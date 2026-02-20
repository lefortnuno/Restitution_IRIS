from django.db import connection
from django.apps import apps

def is_number(value):
    """
    Vérifie si une valeur peut être convertie en float.
    """
    try:
        float(value)
        return True
    except (TypeError, ValueError):
        return False
    
def recuperer_donnees_entrepot(formats: list, champs: list, jointures: list = None, filtres: list = None, filtres_date: list = None):
    """
    Récupère les données depuis un entrepôt de données dynamique.
    
    Arguments :
    - formats : liste d’objets contenant l'attribut `name_structure` (ex: {"name_structure": "tab1"})
    - champs : liste de chaînes au format "nom_table.nom_attribut"
    - jointures : liste d’objets avec `type`, `reference1`, `reference2`
    - filtres : liste d’objets avec `champs_cible`, `operateur_comparaison`, `parametre`, `operateur_logique`
    - filtres_date : liste de conditions de dates au format SQL
    
    Retour :
    - Dictionnaire avec la requête SQL et les données récupérées.
    """

    # Initialisation
    list_formats = [f.get("name_structure") for f in formats if f.get("name_structure")]
    list_champs = ", ".join(champs)
    list_champs_date, list_jointures, list_filtres, list_jointure_tables, list_cross_joins = [], [], [], [], [] 
 
    # Traitement des jointures
    if jointures:
        for cpt, j in enumerate(jointures):
            table1 = j["reference1"]["format"]
            champ1 = j["reference1"]["attribut"]
            table2 = j["reference2"]["format"]
            champ2 = j["reference2"]["attribut"]

            join_types = {
                "FJ": "FULL JOIN",
                "IJ": "INNER JOIN",
                "RJ": "RIGHT JOIN",
                "LJ": "LEFT JOIN",
            }

            join_prefix = join_types.get(j["type"], "")
            if cpt != 0 and table1 not in list_jointure_tables:
                jointure = f"{join_prefix} {table1} ON TRUE"
                list_jointures.append(jointure) 
                list_jointure_tables.append(table1)  
            jointure = f"{join_prefix} {table2} ON {table1}.{champ1} = {table2}.{champ2}"
            list_jointures.append(jointure)
            if cpt == 0 :
                list_jointure_tables.append(table1)  
            if  table2 not in list_jointure_tables:
                list_jointure_tables.append(table2)  
  
    # Traitement des filtres
    if filtres:
        for f in filtres:
            champs_cible = f["champs_cible"]  
            comp = f['operateur_comparaison'] 
            param = f["parametre"]
            
            # Gestion des noms de colonnes avec "."
            if len(champs_cible.split(".")) >= 2:
                champs_cible = f'{champs_cible.split(".")[0]}."{champs_cible.split(".")[1]}"'

            if comp == "==":
                comp = "="
            
            # Encadrement des valeurs non numériques
            if not is_number(param): 
                param = f"'{param}'"
            
            condition = f"{champs_cible} {comp} {param}"

            # Opérateur logique
            if f.get("operateur_logique"):
                op_log = f["operateur_logique"].upper()
                op_log = "OR" if op_log == "OU" else "AND" if op_log == "ET" else ""
                condition = f"{op_log} {condition}"

            list_filtres.append(condition) 

    # Détection des CROSS JOIN nécessaires
    formats_non_jointes = set(list_formats) - set(list_jointure_tables)
    for table in formats_non_jointes:
        list_cross_joins.append(f"CROSS JOIN {table}")

    # Construction de la requête SQL 
    where_clause = " ".join(list_filtres) 

    # Détermination de la table de base
    if list_jointures:
        base_table = list_jointure_tables[0] 
        join_clause = " ".join(list_jointures + list_cross_joins)
    else: 
        base_table = list_formats[0]    
        list_cross_joins = [
            cj for cj in list_cross_joins
            if f"CROSS JOIN {base_table}" != cj
        ]
        join_clause = " ".join(list_cross_joins) 
        
    # Construction de la requête
    requete_sql = f"SELECT {list_champs} FROM {base_table} {join_clause} "

    if filtres_date :
        list_champs_date = " AND ".join(filtres_date)   

        if where_clause:
            requete_sql += f"WHERE {where_clause} AND {list_champs_date}"
        else:
            requete_sql += f"WHERE {list_champs_date}"
    else:
        if where_clause:
            requete_sql += f"WHERE {where_clause}"

    # print(f"\n\n[ --- ] ICI {requete_sql}\n\n")
    return executeur_requete(requete_sql)  


def executeur_requete(requete_sql: str):
    """
    Exécute une requête SQL brute et retourne les résultats sous forme de liste de dictionnaires.
    """
    with connection.cursor() as cursor:
        cursor.execute(requete_sql)
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()  
        result = {
            "requete_sql": requete_sql,
            "api_data": [dict(zip(columns, row)) for row in rows]
        }
        # print(f"\n\n[ --- ] ICI 4 {result} \n\n")
        return result 
     
    return {
        "requete_sql": requete_sql,
        "api_data": []
    } 