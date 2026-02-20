from collections import defaultdict
from datetime import datetime
from itertools import zip_longest 
import numpy as np
from restitutions.functions.geocoding import get_country_coordinates, get_state_coordinates

def format_dates_in_resultats(resultats: list, champs_data: list):
    """Formate les champs dont typeAttribut == 'date'."""
    for row in resultats:
        for champ in champs_data:
            if (champ.get("typeAttribut") or "").lower() != "date":
                continue

            field = champ["nom"]
            if field in row and row[field]:
                try:
                    dt = row[field]
                    if isinstance(dt, str):
                        try:
                            dt = datetime.fromisoformat(dt)
                        except ValueError:
                            dt = datetime.strptime(dt, "%Y-%m-%d %H:%M:%S")
                    
                    # On formate en texte
                    date_str = dt.strftime("Le %d/%m/%Y à %H:%M")

                    type_champ = (champ.get("type") or "").lower()

                    # Si date + extract
                    if type_champ == "extract":
                        pos = max(0, champ.get("position", 0) - 1)
                        taille = champ.get("taille", 0)
                        date_str = date_str[pos:pos + taille]

                    # Si date + concat
                    elif type_champ == "concat":
                        param = champ.get("parametre") or ""
                        sep = champ.get("separateur") or ""
                        date_str = f"{date_str}{sep}{param}"

                    row[field] = date_str

                except Exception:
                    pass
    return resultats


def adjust_result_by_affichage(resultats_op: list, affichage: str, champs_axes: list, list_operation_name: list, champ_niv: str, champs_data: list, maps_traitement: str, maps_champ_region: str) -> list:
    """
    Adapte le format des résultats en fonction de l'affichage demandé.
    - "diagramme circulaire" : format pour camembert
    - "tableau simple" : regroupement horizontal des opérations
    """   
    
    if not resultats_op or not affichage: 
        return {"resultats_final": {"labelsX":[], "datasets":[]}}
 
    affichage = affichage.strip().lower()
    
    # === Prétraitement : extract et concat (hors dates) ===
    for resultat_set in (resultats_op if isinstance(resultats_op, list) else [resultats_op]):
        if not isinstance(resultat_set, list):
            continue

        for row in resultat_set:
            for champ in champs_data:
                type_champ = (champ.get("type") or "").lower()
                type_attr = (champ.get("typeAttribut") or "").lower()

                # On ignore les dates
                if type_attr == "date":
                    continue

                nom_col = champ.get("nom")
                if nom_col not in row or not isinstance(row[nom_col], str):
                    continue

                # --- Cas extract ---
                if type_champ == "extract":
                    pos = max(0, champ.get("position", 0) - 1)  # 1-based vers 0-based
                    taille = champ.get("taille", 0)
                    row[nom_col] = row[nom_col][pos:pos + taille]

                # --- Cas concat ---
                elif type_champ == "concat":
                    param = champ.get("parametre") or ""
                    sep = champ.get("separateur") or ""
                    row[nom_col] = f"{row[nom_col]}{sep}{param}"
 
    # === Cas 1 : diagramme circulaire ===
    if affichage == "diagramme circulaire": 
        resultats = resultats_op[0] if isinstance(resultats_op[0], list) else resultats_op
        if not resultats:
            return {"resultats_final": {"labelsX":[], "datasets":[]}}

        resultats = format_dates_in_resultats(resultats, champs_data)
        first_row = resultats[0]
        value_keys = [k for k in first_row.keys() if isinstance(first_row[k], (int, float))]
 
        if not value_keys:
            return { "resultats_final": resultats }
 
        value_key = value_keys[0] 
        label_candidates = [k for k in first_row.keys() if k != "id" and k != value_key] 
        label_key = label_candidates[0] if label_candidates else None
 
        if not label_key:
            label_key = value_key

        total = sum(r.get(value_key, 0) or 0 for r in resultats)
 
        resultats_final = [
            {
                "label": row.get(label_key),
                "value": row.get(value_key, 0),
                "prc": f"{round((row.get(value_key, 0) or 0) / total * 100, 1)}%" if total else "0%"
            }
            for row in resultats
        ] 
        return { "resultats_final": resultats_final }


    # === Cas 2 : tableau simple ===
    if affichage in ["tableau simple","tableau croisée dynamique"]: 
        resultats_final = [] 
        for i, lignes in enumerate(zip_longest(*resultats_op, fillvalue={})):
            ligne_fusion = {"id": i + 1}  
            for d in lignes:
                ligne_fusion.update(d)
            resultats_final.append(ligne_fusion)
            
        resultats_final = format_dates_in_resultats(resultats_final, champs_data)
        return { "resultats_final": resultats_final } 


    # === Cas 3 : diagramme baton === 
    if affichage in ["graphique en barres", "histogramme", "graphique linéaire"]:
        resultats = resultats_op[0] if isinstance(resultats_op[0], list) else resultats_op
        if not resultats:
            return {"resultats_final": {"labelsX":[], "datasets":[]}}

        resultats = format_dates_in_resultats(resultats, champs_data)
        champ_x_info = next((c for c in champs_axes if c["champ_type"] == "AxesX"), None)  

        if not list_operation_name:
            return {"resultats_final": {"labelsX":[], "datasets":[]}}

        value_key = list_operation_name  # Ex: "sum1" 

        champ_x_nom = champ_x_info["champ_nom"]
        champ_x_type = (champ_x_info.get("champ_typeAttribut") or "").lower() 

        resultats_tmp = []
        resultats_triee = []
        resultats_final = []

        for row in resultats: 
            value = row.get(value_key, 0)  
            axesY = value  
            axesX = row.get(champ_x_nom) 
            autres_keys = [k for k in row.keys() if k not in [champ_x_nom, value_key, "id"]]  
            label_parts = [str(row[k]) for k in autres_keys]
            label = "-".join(label_parts) if label_parts else "" 

            resultats_tmp.append({
                "axesX": axesX,
                "axesY": axesY,
                "label": label,
                "value": value
            }) 

        # === Tri du résultat selon la logique des types === 
        def try_parse_date(v):
            if isinstance(v, str):
                for fmt in ("%d-%m-%Y", "%m-%Y"):
                    try:
                        return datetime.strptime(v, fmt)
                    except ValueError:
                        pass
            return v

        if champ_x_type == "date": 
            resultats_triee = sorted(resultats_tmp, key=lambda x: try_parse_date(x["axesX"]))  
        elif champ_x_type in ["integer", "float", "decimal", "numeric"]:
            resultats_triee = sorted(resultats_tmp, key=lambda x: x["axesX"] or 0) 
        else: 
            resultats_triee = resultats_tmp  # Pas de tri défini, conserver tel quel
            
        print("\n\n" )

        # Regrouper toutes les valeurs par label
        grouped = defaultdict(dict)
        labelsX = []
        labelsX_set = set()

        for item in resultats_triee:
            x = item["axesX"]
            label = item["label"]
            value = item["value"]

            grouped[label][x] = value
            if x not in labelsX_set:
                labelsX.append(x)
                labelsX_set.add(x)

        # Construire les datasets
        datasets = []
        labelsX_sorted = sorted(labelsX, key=try_parse_date)

        for label, data_dict in grouped.items():
            data = [data_dict.get(x, 0) for x in labelsX_sorted]
            datasets.append({
                "label": label if label else value_key,
                "data": data
            })

        resultats_final = {
            "labelsX": labelsX_sorted,
            "datasets": datasets
        }

        return { "resultats_final": resultats_final  }


    # === Cas 3 : Cartographie === 
    if affichage in ["cartographie en barres", "cartographie circulaires"]:  
        resultats = resultats_op[0] if isinstance(resultats_op[0], list) else resultats_op
        if not resultats:
            return {"resultats_final": {"labelsX": [], "datasets": []}} 

        resultats = format_dates_in_resultats(resultats, champs_data)
        grouped = defaultdict(lambda: {"lat": None, "lon": None, "values": {}}) 
        labelsX, labelsX_set, datasets, all_values, labelX_Final = [], set(), [], [], []

        # --- 1. Déterminer la clé région en fonction du mode ---
        if maps_traitement == "coordonnees":
            region_key = champ_niv
        elif maps_traitement == "manual":
            region_key = maps_champ_region
        else:
            region_key = None  

        # --- 2. Boucle principale ---
        for row in resultats:
            if not region_key:
                continue
            region = row.get(region_key)
            value = row.get(list_operation_name, 0)

            if region not in labelsX_set:
                labelsX.append(region)
                labelsX_set.add(region) 

            # Construire un label (catégorie)
            autres_keys = [k for k in row.keys() if k not in [region_key, list_operation_name, "id"]]
            category = "-".join(str(row[k]) for k in autres_keys) or list_operation_name

            # Regrouper les valeurs par label
            grouped[category]["values"][region] = value 

        # --- 3. Construire les datasets finaux ---
        for label, info in grouped.items():
            data = [info["values"].get(region, 0) for region in labelsX]
            datasets.append({
                "label": label, 
                "value": data
            })
            all_values += [abs(v) for v in data if v != 0]

        # --- 4. Récupération des coordonnées ---
        for l in labelsX: 
            if champ_niv == "maps.Ville":
                coo = get_state_coordinates(l)
            elif champ_niv == "maps.Pays":
                coo = get_country_coordinates(l) 
            else:
                coo = {"lat": None, "lon": None}
            labelX_Final.append({
                "region": l,
                "lat": coo["lat"],
                "lon": coo["lon"]
            })

        # --- 5. Calcul des proportions ---

        # --- 5. Calcul des proportions ---
        # max_val = max(all_values or [1])
        # min_val = min(all_values or [1])
        # mean_val = sum(all_values) / len(all_values) if all_values else 1
        # std_val = np.std(all_values) if all_values else 1

        # # Normalisation des valeurs pour gérer les différentes échelles
        # if max_val > 0:
        #     normalized_values = [v / max_val for v in all_values] if all_values else [1]
        # else:
        #     normalized_values = [1]

        # # Calcul robuste des proportions
        # if len(all_values) > 1:
        #     # Échelle logarithmique pour gérer les grandes variations
        #     if max_val >= 1000:
        #         log_max = np.log1p(max_val)  # log(1 + max_val)
        #         log_mean = np.log1p(mean_val)
                
        #         proportion1 = round((log_mean / log_max) * 10, 4)
        #         proportion2 = round(np.sqrt(log_mean / log_max) * 8, 4)
        #         proportion3 = round((log_mean / (log_max + 1)) * 6, 4)
            
        #     elif max_val >= 100:
        #         # Échelle intermédiaire
        #         scaled_max = max_val / 100
        #         scaled_mean = mean_val / 100
                
        #         proportion1 = round((scaled_mean / scaled_max) * 15, 4)
        #         proportion2 = round(np.sqrt(scaled_mean) * 10, 4)
        #         proportion3 = round((scaled_mean / (scaled_max + 0.5)) * 8, 4)
            
        #     else:
        #         # Échelle linéaire pour petites valeurs
        #         range_val = max_val - min_val if max_val != min_val else 1
                
        #         proportion1 = round((mean_val / (max_val + 1)) * 20, 4)
        #         proportion2 = round((std_val / (range_val + 1)) * 15, 4)
        #         proportion3 = round((mean_val / (range_val + 1)) * 12, 4)

        # else:
        #     # Valeurs par défaut si une seule valeur
        #     proportion1 = 10.0
        #     proportion2 = 8.0
        #     proportion3 = 6.0

        # # Assurance que les proportions restent dans des limites raisonnables
        # proportion1 = min(max(proportion1, 5), 50) 
        # proportion2 = min(max(proportion2, 4), 40) 
        # proportion3 = min(max(proportion3, 3), 30) 

        max_val = max(all_values or [1])
        mean_val = sum(all_values) / len(all_values) if all_values else 1
        std_val = np.std(all_values) if all_values else 1

        base = np.sqrt(mean_val + std_val)
        proportion1 = round(((np.sqrt(max_val + std_val)) / (base + 1)), 4) * 10
        proportion2 = np.sqrt(np.sqrt(mean_val))
        proportion3 = np.sqrt(mean_val) / np.log(max_val + 1)  
        
        # if mean_val >= 1000: 
        #     base = np.sqrt(mean_val + std_val)
        #     proportion1 = round(((np.sqrt(max_val + std_val)) / (base + 1)), 4) * 10
        #     proportion2 = np.sqrt(np.sqrt(mean_val))
        #     proportion3 = np.sqrt(mean_val) / np.log(max_val + 1)   
        # else:
        #     base = mean_val + std_val
        #     proportion1 = round(1 / ((np.sqrt(max_val + std_val)) * (np.sqrt(base) + 1)), 4)
        #     proportion2 = round(1 / (np.sqrt(base)), 4)
        #     proportion3 = round(1 / (np.sqrt(base) / np.log(max_val + 1)), 4)   

        resultats_final = {
            "labelsX": labelX_Final,
            "datasets": datasets,
            "proportion": [proportion1, proportion2, proportion3]
        } 

        return {"resultats_final": resultats_final}

    # === Par défaut : renvoyer ''resultats_op'' ===
    return {"resultats_final": {"labelsX":[], "datasets":[]}}
