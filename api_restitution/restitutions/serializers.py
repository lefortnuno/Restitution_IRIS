from rest_framework import serializers
from django.db import transaction
from customUsers.serializers import SimpleUserSerializer
from .models import (
    Clause_regroupement, LLMModeles, Restitutions, Formats, Jointures, Affichages,
    Filtre_populations, Operations, Conditions, Champs, Expressions
)
from restitutions.functions.miseajour import (
    update_related_instances,
    update_expressions_with_clauses,
    update_clause_regroupements,
    delete_missing_expressions,
    delete_missing_condition_expressions,
    delete_missing_instances_from_json,
)

class JointuresSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour le modèle Jointures.
    
    Exclut le champ 'restitution' qui sera renseigné automatiquement
    lors de la création ou mise à jour.
    """
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Jointures
        exclude = ['restitution']


class FormatSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour le modèle Formats.
    """
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Formats
        exclude = ['restitution']


class AffichagesSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour le modèle Affichages.
    """
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Affichages
        exclude = ['restitution']

class LLMModelesSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour le modèle LLMModeles.
    """
    id = serializers.IntegerField(required=False)

    class Meta:
        model = LLMModeles
        exclude = ['restitution']


class FiltrePopulationsSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour le modèle Filtre_populations.
    """
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Filtre_populations
        exclude = ['restitution']


class ClausesRegroupementSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour le modèle Clause_regroupement.
    
    Utilisé pour sérialiser/désérialiser les clauses rattachées à une expression.
    """
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Clause_regroupement
        exclude = ['expression']
 

class ExpressionsSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour le modèle Expressions.

    Sérialise également les clauses de regroupement associées.
    """
    id = serializers.IntegerField(required=False) 
    clause_regroupement = ClausesRegroupementSerializer(many=True, required=False)

    class Meta:
        model = Expressions
        exclude = ['operation']


class ConditionOperationSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour le modèle Conditions.

    Permet de gérer les champs cible et valeurs de référence 
    avec leurs expressions et clauses associées.
    """
    id = serializers.IntegerField(required=False)
    champs_cible = ExpressionsSerializer(many=True, required=False)
    valeur_reference = ExpressionsSerializer(many=True, required=False)

    class Meta:
        model = Conditions
        exclude = ['operation']

    def create(self, validated_data):
        """
        Crée une condition avec ses expressions et clauses associées.

        :param validated_data: Données validées du sérialiseur.
        :return: Instance de Conditions créée.
        """
        champs_cible_data = validated_data.pop("champs_cible", [])
        valeur_reference_data = validated_data.pop("valeur_reference", [])

        condition = Conditions.objects.create(**validated_data)

        # --- Création des champs cible ---
        previous_exp = None
        for exp_data in champs_cible_data:
            clauses_regroupement = exp_data.pop("clause_regroupement", [])
            if previous_exp:
                exp_data["id_precedente"] = previous_exp.id
            exp = Expressions.objects.create(**exp_data)
            condition.champs_cible.add(exp)
            previous_exp = exp

            # Ajout des clauses de regroupement
            prev_clause = None
            for clause_data in clauses_regroupement:
                if prev_clause:
                    clause_data["id_precedente"] = prev_clause.id
                prev_clause = Clause_regroupement.objects.create(expression=exp, **clause_data)

        # --- Création des valeurs de référence ---
        previous_exp = None
        for exp_data in valeur_reference_data:
            clauses_regroupement = exp_data.pop("clause_regroupement", [])
            if previous_exp:
                exp_data["id_precedente"] = previous_exp.id
            exp = Expressions.objects.create(**exp_data)
            condition.valeur_reference.add(exp)
            previous_exp = exp

            # Ajout des clauses de regroupement
            prev_clause = None
            for clause_data in clauses_regroupement:
                if prev_clause:
                    clause_data["id_precedente"] = prev_clause.id
                prev_clause = Clause_regroupement.objects.create(expression=exp, **clause_data)

        return condition


class OperationsSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour le modèle Operations.
    
    Inclut les conditions et expressions associées.
    """
    id = serializers.IntegerField(required=False)
    conditions = ConditionOperationSerializer(many=True, required=False, allow_null=True)
    expressions = ExpressionsSerializer(many=True, required=False)

    class Meta:
        model = Operations
        exclude = ['restitution']


class ChampsSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour le modèle Champs.
    """
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Champs
        exclude = ['restitution']

    def get_transformation(self, obj): 
        """
        Retourne un dictionnaire des informations de transformation du champ.

        :param obj: Instance de Champs
        :return: dict
        """
        return {  
            "type": obj.type,
            "typeAttribut": obj.typeAttribut,
            "taille": obj.taille,
            "position": obj.position,
            "parametre": obj.parametre,
            "separateur": obj.separateur,
        } 


def create_instance(data_list, ModelClass, parent_instance, relation_field='restitution', extra_kwargs={}):
    """
    Fonction utilitaire pour créer en masse des instances liées à une restitution.

    :param data_list: Liste de dictionnaires contenant les données.
    :param ModelClass: Classe du modèle à instancier.
    :param parent_instance: Instance parent (ex: restitution).
    :param relation_field: Nom du champ relationnel (par défaut 'restitution').
    :param extra_kwargs: Arguments supplémentaires à passer à la création.
    """
    for item_data in data_list:
        kwargs = {relation_field: parent_instance, **extra_kwargs}
        ModelClass.objects.create(**kwargs, **item_data)

   
class RestitutionsSerializer(serializers.ModelSerializer):
    """
    Sérialiseur principal pour le modèle Restitutions.

    Gère la création et la mise à jour des restitutions ainsi que de toutes leurs
    relations : formats, jointures, affichages, filtres, opérations et champs.
    """
    formats_selected  = FormatSerializer(many=True)
    jointures = JointuresSerializer(many=True, required=False)
    affichages = AffichagesSerializer(many=True)
    llmmodeles = LLMModelesSerializer(many=True)
    filtres_pop = FiltrePopulationsSerializer(many=True, required=False)
    operation_selected  = OperationsSerializer(many=True)
    champs = ChampsSerializer(many=True, required=False) 

    created_by = SimpleUserSerializer(read_only=True)
    updated_by = SimpleUserSerializer(read_only=True)

    class Meta:
        model = Restitutions
        fields = '__all__'

    def update(self, instance, validated_data):  
        """
        Met à jour une instance de restitution et toutes ses relations associées.
        
        - Supprime les éléments retirés dans le JSON.
        - Met à jour ou crée les éléments liés.
        - Gère l'enchaînement (id_precedente) pour filtres, conditions et expressions.

        :param instance: Instance existante de Restitutions.
        :param validated_data: Données validées.
        :return: Instance mise à jour.
        """
        request = self.context.get("request")
        user = request.user if request and hasattr(request, "user") else None

        formats_data = validated_data.pop('formats_selected', [])
        jointures_data = validated_data.pop('jointures', [])
        affichages_data = validated_data.pop("affichages", [])
        llmmodeles_data = validated_data.pop("llmmodeles", [])
        filtres_data = validated_data.pop("filtres_pop", [])
        operations_data = validated_data.pop("operation_selected", []) 
        champs_data = validated_data.pop("champs", []) 

        # Suppression des éléments retirés
        delete_missing_instances_from_json(champs_data, Champs, instance)
        delete_missing_instances_from_json(filtres_data, Filtre_populations, instance)
        delete_missing_instances_from_json(operations_data, Operations, instance)
        delete_missing_instances_from_json(jointures_data, Jointures, instance)
        delete_missing_instances_from_json(formats_data, Formats, instance)
        delete_missing_instances_from_json(affichages_data, Affichages, instance)
        delete_missing_instances_from_json(llmmodeles_data, LLMModeles, instance)

        with transaction.atomic():
            # Mise à jour des champs simples
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.updated_by = user
            instance.save()

            # Relations simples
            update_related_instances(formats_data, Formats, instance)
            update_related_instances(jointures_data, Jointures, instance)
            update_related_instances(affichages_data, Affichages, instance)
            update_related_instances(llmmodeles_data, LLMModeles, instance)
            
            # Mise à jour des filtres avec chaînage
            previous_instance = None
            for filtre in filtres_data:
                filtre_id = filtre.get("id")
                if filtre_id:
                    try:
                        filtre_instance = Filtre_populations.objects.get(id=filtre_id, restitution=instance)
                        filtre_instance.operateur_logique = filtre.get("operateur_logique", filtre_instance.operateur_logique)
                        filtre_instance.champs_cible = filtre.get("champs_cible", filtre_instance.champs_cible)
                        filtre_instance.operateur_comparaison = filtre.get("operateur_comparaison", filtre_instance.operateur_comparaison)
                        filtre_instance.parametre = filtre.get("parametre", filtre_instance.parametre)
                        filtre_instance.id_precedente = previous_instance.id if previous_instance else None
                        filtre_instance.save()
                        previous_instance = filtre_instance
                    except Filtre_populations.DoesNotExist:
                        continue
                else:
                    filtre_instance = Filtre_populations.objects.create(
                        restitution=instance,
                        operateur_logique=filtre.get("operateur_logique"),
                        champs_cible=filtre.get("champs_cible"),
                        operateur_comparaison=filtre.get("operateur_comparaison"),
                        parametre=filtre.get("parametre"),
                        id_precedente=previous_instance.id if previous_instance else None
                    )
                previous_instance = filtre_instance 
            
            # Mise à jour des champs
            for champ in champs_data:
                champ_id = champ.get("id") 
                if champ_id:
                    try: 
                        champ_instance = Champs.objects.get(id=champ_id, restitution=instance)
                        champ_instance.nom = champ.get("nom", champ_instance.nom) 
                        champ_instance.as_nom = champ.get("as_nom", champ_instance.as_nom)
                        champ_instance.type = champ.get("type", champ_instance.type)
                        champ_instance.typeAttribut = champ.get("typeAttribut", champ_instance.typeAttribut)
                        champ_instance.taille = champ.get("taille", champ_instance.taille)
                        champ_instance.position = int(champ["position"]) if champ.get("position") else None
                        champ_instance.separateur = champ.get("separateur", champ_instance.separateur)
                        champ_instance.parametre = champ.get("parametre", champ_instance.parametre) 
                        champ_instance.save() 
                    except Champs.DoesNotExist: 
                        continue 
                else:    
                    Champs.objects.create(
                        restitution=instance,
                        nom=champ["nom"],
                        as_nom=champ.get("as_nom"),
                        type=champ.get("type"),
                        typeAttribut=champ.get("typeAttribut"),
                        taille=champ.get("taille"),
                        position=int(champ["position"]) if champ.get("position") else None,
                        separateur=champ.get("separateur"),
                        parametre=champ.get("parametre")
                    ) 

            # Mise à jour des opérations et de leurs sous-éléments
            for operation_data in operations_data:
                conditions_data = operation_data.pop("conditions", None) or []
                expressions_data = operation_data.pop('expressions', [])
                operation_id = operation_data.get('id')

                if operation_id: 
                    try:
                        operation_instance = Operations.objects.get(id=operation_id, restitution=instance) 
                    except Operations.DoesNotExist:
                        continue 
                    for attr, value in operation_data.items():
                        setattr(operation_instance, attr, value)
                    operation_instance.save() 
                else: 
                    operation_instance = Operations.objects.create(restitution=instance, **operation_data)

                # Conditions avec chaînage
                previous_condition = None
                for condition_data in conditions_data:
                    champs_cible_data = condition_data.pop("champs_cible", [])
                    valeur_reference_data = condition_data.pop("valeur_reference", [])
                    condition_id = condition_data.get("id")

                    if previous_condition:
                        condition_data['id_precedente'] = previous_condition.id

                    if condition_id:
                        try:
                            condition_instance = Conditions.objects.get(id=condition_id, operation=operation_instance)
                            for attr, value in condition_data.items():
                                setattr(condition_instance, attr, value)
                            condition_instance.save()
                        except Conditions.DoesNotExist:
                            continue
                    else:
                        condition_instance = Conditions.objects.create(
                            operation=operation_instance,
                            **condition_data
                        )

                    # Suppression des expressions retirées
                    delete_missing_condition_expressions(condition_instance, champs_cible_data, "champs_cible")
                    delete_missing_condition_expressions(condition_instance, valeur_reference_data, "valeur_reference")

                    # Mise à jour ou création des expressions avec clauses
                    update_expressions_with_clauses(champs_cible_data, condition_instance, "champs_cible")
                    update_expressions_with_clauses(valeur_reference_data, condition_instance, "valeur_reference")

                    previous_condition = condition_instance 

                # Expressions avec chaînage
                delete_missing_expressions(operation_instance, expressions_data)
                previous_expression = None
                for expression_data in expressions_data:
                    clauses_regroupement_data = expression_data.pop('clause_regroupement', []) 
                    if previous_expression:
                        expression_data['id_precedente'] = previous_expression.id

                    expression_id = expression_data.get('id')
                    if expression_id:
                        try:
                            expression_instance = Expressions.objects.get(id=expression_id, operation=operation_instance)
                            for attr, value in expression_data.items():
                                setattr(expression_instance, attr, value)
                            expression_instance.save()
                        except Expressions.DoesNotExist:
                            continue
                    else:
                        expression_instance = Expressions.objects.create(operation=operation_instance, **expression_data)

                    # Mise à jour des clauses
                    update_clause_regroupements(clauses_regroupement_data, expression_instance)

                    previous_expression = expression_instance

        return instance
    
    def create(self, validated_data):
        """
        Crée une restitution et toutes ses relations associées.

        :param validated_data: Données validées.
        :return: Instance créée de Restitutions.
        """
        request = self.context.get("request")
        user = request.user if request and hasattr(request, "user") else None

        formats_data = validated_data.pop('formats_selected', [])
        jointures_data = validated_data.pop('jointures', [])
        affichages_data = validated_data.pop("affichages", [])
        llmmodeles_data = validated_data.pop("llmmodeles", [])
        filtres_data = validated_data.pop("filtres_pop", [])
        operations_data = validated_data.pop("operation_selected", [])
        champs_data = validated_data.pop("champs", []) 

        with transaction.atomic():
            restitution = Restitutions.objects.create(created_by=user, **validated_data)

            create_instance(formats_data, Formats, restitution)
            create_instance(jointures_data, Jointures, restitution)
            create_instance(affichages_data, Affichages, restitution)
            create_instance(llmmodeles_data, LLMModeles, restitution)
            create_instance(filtres_data, Filtre_populations, restitution)
            
            for champ_data in champs_data:
                print("champ_data=",champ_data)
                transformation = champ_data.pop("transformation", None)
                print("transformation=",transformation)
                if transformation:
                    champ_data.update(transformation)  # déplie les clés dans champ_data
                print("champ_data=",champ_data)
                Champs.objects.create(restitution=restitution, **champ_data)


            for operation_data in operations_data: 
                conditions_data = operation_data.pop("conditions", None) or []
                expressions_data = operation_data.pop("expressions", [])
                operation = Operations.objects.create(restitution=restitution, **operation_data)

                # Chaînage des conditions
                previous_condition = None
                for condition in conditions_data:
                    if previous_condition:
                        condition['id_precedente'] = previous_condition.id
                    condition_serializer = ConditionOperationSerializer(data=condition)
                    condition_serializer.is_valid(raise_exception=True)
                    condition_valid = condition_serializer.save(operation=operation)
                    previous_condition = condition_valid

                # Chaînage des expressions
                previous_expression = None
                for expression in expressions_data:
                    clauses_regroupement_data = expression.pop("clause_regroupement", [])
                    if previous_expression:
                        expression["id_precedente"] = previous_expression.id
                    expression_instance = Expressions.objects.create(operation=operation, **expression)
                    previous_expression = expression_instance

                    previous_clause_regroupement = None
                    for clause_regroupement in clauses_regroupement_data:
                        if previous_clause_regroupement:
                            clause_regroupement['id_precedente'] = previous_clause_regroupement.id
                        previous_clause_regroupement = Clause_regroupement.objects.create(expression=expression_instance, **clause_regroupement)

        return restitution
