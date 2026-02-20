from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import RestitutionViewSet, RestitutionFullViewSet

"""
Configuration des routes pour l'application Restitutions.

- Utilise un `DefaultRouter` de Django REST Framework pour générer automatiquement
  les URLs correspondant aux ViewSets.
- Fournit deux ensembles de routes :
    1. `RestitutionViewSet` : Gestion standard des restitutions (CRUD).
    2. `RestitutionFullViewSet` : Gestion avancée avec paramétrages complets.

URL Patterns générés automatiquement par DRF pour chaque ViewSet :
    - GET /               → Liste des restitutions
    - POST /              → Création d'une restitution
    - GET /<id>/          → Détail d'une restitution
    - PUT /<id>/          → Mise à jour complète
    - PATCH /<id>/        → Mise à jour partielle
    - DELETE /<id>/       → Suppression

"""

# Initialisation du routeur DRF
router = DefaultRouter()

# Route pour les opérations CRUD simples sur les restitutions
router.register("", RestitutionViewSet, basename="restitutions")

# Route pour le paramétrage complet d'une restitution
router.register("parametrage", RestitutionFullViewSet, basename="restitutions-parametrage")

# Inclusion des routes générées automatiquement par le routeur
urlpatterns = [
    path('', include(router.urls)),
]
