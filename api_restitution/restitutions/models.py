from django.db import models 
from config import settings
    

class Restitutions(models.Model):
    """
    Modèle représentant une restitution, qui est une configuration de données à afficher ou traiter.

    Champs :
        - nom (CharField) : Nom de la restitution.
        - description (TextField, optionnel) : Description détaillée de la restitution.
        - created_at (DateTimeField) : Date de création.
        - updated_at (DateTimeField) : Date de dernière mise à jour.
        - created_by (ForeignKey vers User) : Utilisateur ayant créé la restitution.
        - updated_by (ForeignKey vers User) : Utilisateur ayant modifié la restitution en dernier.

    Relations :
        - formats_selected : Liste des formats liés à la restitution.
        - jointures : Liste des jointures associées.
        - affichages : Liste des affichages liés.
        - filtres_pop : Liste des filtres de population associés.
        - operation_selected : Opérations définies pour cette restitution.
        - champs : Champs inclus dans la restitution.

    """

    nom = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="restitutions_crees")
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="restitutions_modifiees") 

    def __str__(self):
        return self.nom


class Formats(models.Model):
    """
    Modèle représentant un format de données sélectionné dans une restitution.

    Champs :
        - restitution (ForeignKey) : Restitution associée.
        - id_structure (IntegerField) : Identifiant de la structure.
        - name_structure (CharField, optionnel) : Nom de la structure.
    """

    restitution = models.ForeignKey(Restitutions, on_delete=models.CASCADE, related_name='formats_selected', null=True)
    id_structure = models.IntegerField()
    name_structure = models.CharField(max_length=255, null=True) 

    def __str__(self):
        return f"Format #{self.pk}"
    

class Jointures(models.Model):
    """
    Modèle représentant une jointure entre deux formats dans une restitution.

    Champs :
        - restitution (ForeignKey) : Restitution associée.
        - reference1 (JSONField) : Première référence de jointure.
        - reference2 (JSONField) : Deuxième référence de jointure.
        - type (CharField, choix) : Type de jointure (LEFT, RIGHT, INNER, FULL).
        - code_format1 (IntegerField) : Identifiant du premier format.
        - code_format2 (IntegerField) : Identifiant du second format.
    """

    list_types = (
        ("LJ", "LEFT JOIN"),
        ("RJ", "RIGHT JOIN"), 
        ("IJ", "INNER JOIN"),
        ("FJ", "FULL JOIN"), 
    )
    restitution = models.ForeignKey(Restitutions, on_delete=models.CASCADE, related_name="jointures", null=True) 
    reference1 = models.JSONField()
    reference2 = models.JSONField()
    type = models.CharField(max_length=10, choices=list_types)
    code_format1= models.IntegerField(null=True)
    code_format2= models.IntegerField(null=True)

    def __str__(self):
        return f"Jointure #{self.id}"


class Affichages(models.Model):
    """
    Modèle représentant un affichage configuré dans une restitution.

    Champs :
        - restitution (ForeignKey) : Restitution associée.
        - nom_affichage (CharField, optionnel) : Nom de l'affichage.
    """

    restitution = models.ForeignKey(Restitutions, on_delete=models.CASCADE, related_name="affichages", null=True)
    nom_affichage = models.CharField(max_length=255, null=True) 

    def __str__(self):
        return self.nom_affichage


class Filtre_populations(models.Model):
    """
    Modèle représentant un filtre appliqué à une population de données dans une restitution.

    Champs :
        - restitution (ForeignKey) : Restitution associée.
        - operateur_logique (CharField, choix) : Opérateur logique ("ET", "OU").
        - champs_cible (CharField) : Champ sur lequel le filtre est appliqué.
        - operateur_comparaison (CharField, choix) : Opérateur de comparaison (>, >=, <, <=, ==, !=, %).
        - parametre (JSONField) : Valeur ou paramètre utilisé pour la comparaison.
        - id_precedente (IntegerField, optionnel) : Lien vers un filtre précédent.
    """

    list_operateur = {
        ("OU","OU"),
        ("ET","ET"), 
    } 
    list_condition = (
        (">", ">"),
        (">=", ">="),
        ("<", "<"),
        ("<=", "<="),
        ("==", "=="),
        ("!=", "!="),
        ("%", "%"),
    )

    restitution = models.ForeignKey(Restitutions, on_delete=models.CASCADE, related_name="filtres_pop", null=True)
    operateur_logique = models.CharField(max_length=50, choices=list_operateur, null=True)
    champs_cible = models.CharField(max_length=255)
    operateur_comparaison = models.CharField(max_length=5, choices=list_condition)
    parametre = models.JSONField()  
    id_precedente = models.IntegerField(blank=True, null=True) 

    def __str__(self):
        return f"Filtre sur {self.champs_cible}"


class Operations(models.Model):
    """
    Modèle représentant une opération effectuée sur les données d'une restitution.

    Champs :
        - restitution (ForeignKey) : Restitution associée.
        - as_nom (CharField, optionnel) : Alias ou nom de l'opération.
    """

    restitution = models.ForeignKey(Restitutions, on_delete=models.CASCADE, related_name="operation_selected", null=True)
    as_nom = models.CharField(max_length=255, null=True)

    def __str__(self):
        return f"Operation #{self.as_nom}"
    

class Conditions(models.Model):
    """
    Modèle représentant une condition appliquée à une opération.

    Champs :
        - operation (ForeignKey) : Opération associée.
        - cle_logique (CharField, choix) : Clé logique ("si", "sinon si", "sinon").
        - champs_cible (ManyToManyField vers Expressions) : Champs ciblés par la condition.
        - operateur_comparaison (CharField, choix) : Opérateur de comparaison.
        - valeur_reference (ManyToManyField vers Expressions) : Valeur(s) utilisée(s) pour la comparaison.
        - operateur_logique (CharField, choix) : Opérateur logique entre conditions ("ET", "OU").
        - id_precedente (IntegerField, optionnel) : Référence vers une condition précédente.
    """

    list_cle_condition = (
        ("si","si"),
        ("sinon si","sinon si"),
        ("sinon","sinon"), 
    )
    list_operateur = {
        ("OU","OU"),
        ("ET","ET"), 
    } 
    list_condition = (
        (">", ">"),
        (">=", ">="),
        ("<", "<"),
        ("<=", "<="),
        ("==", "=="),
        ("!=", "≠"),
        ("%", "%"),
    )
    operation = models.ForeignKey(Operations, on_delete=models.CASCADE, related_name="conditions", null=True)
    cle_logique = models.CharField(max_length=8, choices=list_cle_condition)
    champs_cible = models.ManyToManyField('Expressions', related_name='cible_conditions', blank=True)
    operateur_comparaison = models.CharField(max_length=5, choices=list_condition, blank=True, null=True)
    valeur_reference = models.ManyToManyField('Expressions', related_name='valeur_conditions', blank=True)
    operateur_logique = models.CharField(max_length=5, choices=list_operateur, null=True)
    id_precedente = models.IntegerField(blank=True, null=True) 

    def __str__(self):
        return f"Condition pour {self.operation}"


class Expressions(models.Model):
    """
    Modèle représentant une expression utilisée dans une opération ou une condition.

    Champs :
        - operation (ForeignKey) : Opération associée.
        - valeur (JSONField, optionnel) : Valeur de l'expression.
        - operateur_arithmetique (CharField, optionnel) : Opérateur arithmétique.
        - id_precedente (IntegerField, optionnel) : Référence vers une expression précédente.
    """

    operation = models.ForeignKey(Operations, on_delete=models.CASCADE, related_name="expressions", null=True) 
    valeur = models.JSONField(null=True) 
    operateur_arithmetique = models.CharField(max_length=5, null=True)
    id_precedente = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return f"Expression pour {self.operation}"


class Clause_regroupement(models.Model):
    """
    Modèle représentant une clause de regroupement appliquée sur une expression.

    Champs :
        - expression (ForeignKey) : Expression associée.
        - champs_cible (CharField, optionnel) : Champ sur lequel effectuer le regroupement.
        - id_precedente (IntegerField, optionnel) : Référence vers un regroupement précédent.
    """

    expression = models.ForeignKey(Expressions, on_delete=models.CASCADE, related_name="clause_regroupement", null=True, blank=True)
    champs_cible = models.CharField(max_length=255, null=True) 
    id_precedente = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return f"Regroupement sur {self.champs_cible}"
    

class Champs(models.Model):
    """
    Modèle représentant un champ inclus dans une restitution.

    Champs :
        - restitution (ForeignKey) : Restitution associée.
        - nom (CharField, optionnel) : Nom du champ.
        - as_nom (CharField, optionnel) : Alias du champ.
        - taille (IntegerField, optionnel) : Taille du champ.
        - position (IntegerField, optionnel) : Position dans l'affichage.
        - parametre (CharField, optionnel) : Paramètres spécifiques.
        - separateur (CharField, optionnel) : Séparateur de valeur.
        - type (CharField, optionnel) : Type de champ.
        - typeAttribut (CharField, optionnel) : Type d'attribut.
    """

    restitution = models.ForeignKey(Restitutions, on_delete=models.CASCADE, related_name="champs", null=True)
    nom = models.CharField(max_length=255, blank=True, null=True)
    as_nom = models.CharField(max_length=255, blank=True, null=True)    
    taille = models.IntegerField(blank=True, null=True)
    position = models.IntegerField(blank=True, null=True)
    parametre = models.CharField(max_length=100, null=True, blank=True)
    separateur = models.CharField(max_length=20, null=True, blank=True) 
    type = models.CharField(max_length=20, null=True, blank=True) 
    typeAttribut= models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return self.nom
