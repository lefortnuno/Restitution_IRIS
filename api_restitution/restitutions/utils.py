from .models import Restitutions
from .serializers import ChampsSerializer, FiltrePopulationsSerializer, FormatSerializer, JointuresSerializer, OperationsSerializer


def preparer_restitution_calculée(restitution: Restitutions) -> dict:
    """
    Effectue tous les traitements nécessaires pour calculer les résultats d'une restitution.
    """

    affichage = restitution.affichages.first()
    champs = restitution.champs.all()
    formats = restitution.formats_selected.all()
    jointures = restitution.jointures.all()
    filtres = restitution.filtres_pop.all()
    operations = restitution.operation_selected.first()

    # Exemple de structure retournée
    return {
        "affichage": affichage.nom_affichage if affichage else None, 
        "champs": ChampsSerializer(champs, many=True).data,
        "formats": FormatSerializer(formats, many=True).data,
        "jointures": JointuresSerializer(jointures, many=True).data,
        "filtres": FiltrePopulationsSerializer(filtres, many=True).data, 
        "operations": OperationsSerializer(operations).data if operations else None
    }
