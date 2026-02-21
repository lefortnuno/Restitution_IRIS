from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action, api_view
from config.celery import app
import json
from urllib.parse import unquote

from .serializers import RestitutionsSerializer
from .models import Restitutions

from .tasks import (
    bulk_delete_task, 
    format_and_structure_table,
    list_formats,
    lancer_traitement_restitution,
    lancer_llm_async
)
from restitutions.functions.filter_sort_paginate_data import filter_sort_paginate_data


class RestitutionFullViewSet(viewsets.ModelViewSet):
    """
    ViewSet fournissant l'accès complet à une restitution, incluant toutes ses données liées.

    Endpoints principaux :
        - GET /<id>/get_full_data/ : Retourne toutes les données liées à une restitution.
    
    Attributs :
        - queryset : Ensemble des restitutions triées par date de création.
        - serializer_class : Sérialiseur utilisé pour la restitution.
    """
    queryset = Restitutions.objects.all().order_by('created_at')
    serializer_class = RestitutionsSerializer

    @action(detail=True, methods=['get'])
    def get_full_data(self, request, pk=None):
        """
        Récupère toutes les données liées à une restitution, avec tri récursif par `id` pour chaque liste d'objets.

        :param request: Objet de la requête HTTP.
        :param pk: ID de la restitution.
        :return: Réponse JSON contenant toutes les données liées à la restitution.
        """
        restitution = self.get_object()
        serializer = self.get_serializer(restitution)
        data = serializer.data

        # Fonction récursive pour trier toutes les listes d'objets par "id"
        def sort_lists(obj):
            if isinstance(obj, list):
                if all(isinstance(item, dict) and "id" in item for item in obj):
                    obj = sorted(obj, key=lambda x: x["id"])
                return [sort_lists(item) for item in obj]
            elif isinstance(obj, dict):
                return {k: sort_lists(v) for k, v in obj.items()}
            return obj

        data = sort_lists(data)

        return Response(data, status=status.HTTP_200_OK)


class RestitutionViewSet(viewsets.ModelViewSet):
    """
    ViewSet principal pour la gestion des restitutions.

    Fonctionnalités :
        - CRUD complet sur les restitutions.
        - Recherche et tri sur certains champs.
        - Lancement de tâches Celery pour comparaison de structures, récupération de formats et traitement de restitution.
        - Suppression en masse.
        - Vérification de statut de tâches en arrière-plan.
        - Pagination, filtrage et recherche avancée pour certaines restitutions.

    Permissions :
        - Liste (`list`) : Accès public (`AllowAny`).
        - Autres actions : Authentification requise (`IsAuthenticated`).
    """
    queryset = Restitutions.objects.all().order_by('created_at')
    serializer_class = RestitutionsSerializer

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nom', 'created_by__username', 'affichages__nom_affichage']
    ordering_fields = ['id', 'nom', 'created_at', 'updated_at', 'created_by__username', 'affichages__nom_affichage']
    ordering = ['-created_at']

    def get_permissions(self):
        """
        Définit les permissions dynamiquement :
        - Liste : accès public.
        - Autres actions : authentification requise.
        """
        if self.action == 'list':
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        """
        Liste les restitutions avec ajout d'IDs de tâches Celery en arrière-plan.

        :return: JSON contenant les restitutions + IDs des tâches `list_formats`.
        """
        response = super().list(request, *args, **kwargs) 

        return response

    def retrieve(self, request, *args, **kwargs):
        """
        Récupère une restitution et lance son traitement en arrière-plan.

        :return: Nom de l'affichage et ID de la tâche Celery lancée.
        """
        instance = self.get_object()
        try:
            instance_affichage = instance.affichages.first()
            nom_affichage = instance_affichage.nom_affichage if instance_affichage else None

            task = lancer_traitement_restitution.delay(instance.id)

            data = {
                "affichage": nom_affichage,
                "task_id": task.id
            }
        except Exception as e:
            return Response({"error": f"Erreur lors du calcul : {str(e)}"}, status=500)

        return Response(data)


    @action(detail=False, methods=['get'], url_path='check-task-status/(?P<task_id>[^/.]+)')
    def check_task_status(self, request, *args, **kwargs):
        """
        Vérifie le statut d'une tâche Celery via son ID.

        :param task_id: ID de la tâche.
        :return: État de la tâche et son résultat (si disponible).
        """
        task_id = kwargs.get('task_id')
        result = app.AsyncResult(task_id)

        return Response({
            "task_id": task_id,
            "status": result.state,
            "result": result.result if result.successful() else None
        }, status=status.HTTP_200_OK)


    @action(detail=False, methods=['delete'], url_path='bulk_delete')
    def bulk_delete(self, request):
        """
        Supprime plusieurs restitutions en arrière-plan.

        :param ids: Liste des IDs à supprimer.
        :return: ID de la tâche Celery lancée.
        """
        ids = request.data.get('ids', [])

        if not ids or not isinstance(ids, list):
            return Response({"error": "Une liste est requise !"}, status=status.HTTP_400_BAD_REQUEST)

        task_result = bulk_delete_task.delay(ids)

        return Response({
            "message": "Suppression en arrière-plan lancée.",
            "task_id": task_result.id,
            "ids": ids
        }, status=status.HTTP_202_ACCEPTED)


    @action(detail=False, methods=['get'], url_path='get_formats')
    def get_formats(self, request, *args, **kwargs):
        """
        Lance la récupération des formats en arrière-plan.

        :return: ID de la tâche Celery lancée.
        """
        format2 = list_formats()
        print("[--VIEWS--] format2= ",format2)

        format = list_formats.delay()
        print("[--VIEWS--] Appel a format depuis celery= ", format)

        return Response({
            "format_check_task_id": format.id
        }, status=status.HTTP_200_OK)


    @action(detail=False, methods=['get'], url_path='structure-table/(?P<id>[^/.]+)')
    def get_structure_table(self, request, *args, **kwargs):
        """
        Lance la génération de la table de structure pour un format donné.

        :param id: ID du format.
        :return: ID de la tâche Celery lancée.
        """
        id = kwargs.get('id')
        struct_table_task = format_and_structure_table.delay(id)

        return Response({
            "struct_table_check_task_id": struct_table_task.id,
        }, status=status.HTTP_200_OK)


    @action(detail=False, methods=['get'], url_path='check-traitement-restitution-status/(?P<task_id>[^/.]+)')
    def check_traitement_restitution(self, request, *args, **kwargs):
        """
        Vérifie le statut d'une tâche de traitement de restitution et retourne ses résultats paginés si applicable.

        :param task_id: ID de la tâche.
        :query page: Numéro de page (par défaut: 1).
        :query page_size: Taille de page (par défaut: 11).
        :query ordering: Tri des résultats.
        :query search: Recherche simple.
        :query advanced_filters: Filtres avancés en JSON encodé.
        :return: Résultats du traitement, éventuellement paginés.
        """
        task_id = kwargs.get('task_id')
        result = app.AsyncResult(task_id)

        if not result.successful():
            return Response({
                "task_id": task_id,
                "status": result.state,
                "result": []
            })

        result_data = result.result
        restitution_id = result_data.get("id")
        try:
            instance = Restitutions.objects.get(id=restitution_id)
        except Restitutions.DoesNotExist:
            return Response({"error": "Restitution non trouvée"}, status=404)

        instance_affichage = instance.affichages.first()
        nom_affichage = instance_affichage.nom_affichage if instance_affichage else None

        if nom_affichage in ["Tableau simple", "Tableau croisée dynamique"]:
            resultats = result_data.get("resultats", [])

            page = int(request.query_params.get("page", 1))
            page_size = int(request.query_params.get("page_size", 11))
            ordering = request.query_params.get("ordering", "")
            search = request.query_params.get("search", "")
            advanced_filters_param = request.query_params.get("advanced_filters", "")
            raw_searchable_fields = result_data.get("liste_champs", [])

            advanced_filters = None
            searchable_fields = [
                champ.get("nom") if isinstance(champ, dict) else champ
                for champ in raw_searchable_fields
            ]

            if advanced_filters_param:
                try:
                    advanced_filters = json.loads(unquote(advanced_filters_param))
                except json.JSONDecodeError:
                    return Response({"error": "Paramètre 'advanced_filters' mal formé"}, status=400)

            paginated_data = filter_sort_paginate_data(
                resultats,
                page=page,
                page_size=page_size,
                ordering=ordering,
                search=search,
                searchable_fields=searchable_fields,
                advanced_filters=advanced_filters
            )

            return Response({
                "task_id": task_id,
                "status": result.state,
                "result": {
                    **result_data,
                    "resultats": paginated_data["results"],
                    "count": paginated_data["count"],
                    "total_pages": paginated_data["total_pages"],
                    "page": paginated_data["page"],
                }
            })

        else:
            return Response({
                "task_id": task_id,
                "status": result.state,
                "result": result_data
            })


    @action(detail=False, methods=['get'], url_path='check-llm-restitution-status/(?P<task_id>[^/.]+)')
    def check_traitement_restitution_llama(self, request, *args, **kwargs):
        """
        Vérifie le statut d'une tâche de traitement de restitution avec l'IA LLAMA et retourne ses résultats 
        """
        task_id = kwargs.get('task_id')
        result = app.AsyncResult(task_id)
        
        return Response({
            "task_id": task_id,
            "status": result.state,
            "result": result.result if result.successful() else None
        }, status=status.HTTP_200_OK)
    
