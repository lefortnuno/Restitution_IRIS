import json
import os
import re
import time
import requests
from lark import Lark  
from itertools import zip_longest
from dotenv import load_dotenv
from config.celery import app
from decimal import Decimal

from .lark.evaluateur import CustomTransformer
from .lark.stringify import  generate_logic_string
from .models import Restitutions 
from .models import Formats
from .serializers import ChampsSerializer, FiltrePopulationsSerializer, FormatSerializer, JointuresSerializer, OperationsSerializer
 
from restitutions.functions.recuperation import ( executeur_requete, recuperer_donnees_entrepot )
from restitutions.functions.structures_table import get_structures_table
from restitutions.functions.structures import get_structures
from restitutions.functions.affichage_result import adjust_result_by_affichage
from restitutions.functions.geocoding import get_country, get_state, get_country_coordinates, get_state_coordinates
from restitutions.llama import ( initialisation_argument )

load_dotenv() 


@app.task
def lancer_llm_async(payload):
    """
    Task CELERY dédiée uniquement au LLM.
    """ 
    try:
        result = initialisation_argument(
            payload["entrepot_de_donnee"],
            payload["resultat_calcul"],
            payload["schema"],
            payload["calculStat"],
            payload["title"],
            payload["affichage"],
            payload["filtres"],
            payload["description"],
            payload["prompte_systeme"],
            payload["model"]
        ) 
        
        if result:
            try: 
                match = re.search(r"\{[\s\S]*\}", result)
                if not match:
                    raise ValueError("Aucun JSON détecté.")

                json_str = match.group(0) 
                analyse_json = json.loads(json_str)

                print("📊 Analyse structurée reçue:")
                print(json.dumps(analyse_json, indent=2, ensure_ascii=False))

                return {
                    "status": "SUCCESS",
                    "res_llm": analyse_json
                }

            except Exception as e:
                # Si extraction ou parsing échoue → renvoyer le texte brut
                print("📝 Réponse reçue (format texte) :")
                # print(result)
                return {
                    "status": "SUCCESS",
                    "res_llm": result
                }

        else:
            print("❌ Aucun résultat de l'analyse LLM")
            return {
                "status": "FAILED",
                "res_llm": "Aucun résultat de l'analyse LLM"
            }

    except Exception as e:
        return {
            "status": "ERROR",
            "res_llm": str(e)
        }


@app.task
def lancer_traitement_restitution(restitution_id): 
    restitution = Restitutions.objects.get(id=restitution_id)  

    affichage = restitution.affichages.first() 
    champs = restitution.champs.all().order_by("id")
    formats = restitution.formats_selected.all().order_by("id")
    jointures = restitution.jointures.all().order_by("id")
    filtres = restitution.filtres_pop.all().order_by("id")
    operations = restitution.operation_selected.all().order_by("id") 

    def sort_lists(obj):
                if isinstance(obj, list):
                    # Si la liste contient des dictionnaires avec un champ "id"
                    if all(isinstance(item, dict) and "id" in item for item in obj):
                        obj = sorted(obj, key=lambda x: x["id"])
                    # Appliquer récursivement sur chaque élément
                    return [sort_lists(item) for item in obj]
                elif isinstance(obj, dict):
                    return {k: sort_lists(v) for k, v in obj.items()}
                return obj
     
    affichage_data = affichage.nom_affichage if affichage else None 
    champs_data =  ChampsSerializer(champs, many=True).data 
    formats_data = FormatSerializer(formats, many=True).data
    jointures_data = JointuresSerializer(jointures, many=True).data
    filtres_data = FiltrePopulationsSerializer(filtres, many=True).data 
    operations_data = OperationsSerializer(operations, many=True).data  
    
    operations_data= sort_lists(operations_data)
    list_champs = []
    list_champs_front = []
    list_champs_date = []
    list_champ_groupBY = []
    champs_axes = []
    list_operation_name = ", ".join(op.get("as_nom", "") for op in operations_data) 
    maps_traitement = ""
    maps_champ_niv = ""
    maps_champ_region = ""
    
    for c in champs_data:
        champ_nom = c["nom"]
        is_used_as_operation = any(champ_nom == op["as_nom"] for op in operations_data) 

        if not is_used_as_operation:
            list_champ_groupBY.append(champ_nom)

    for c in formats_data:  
        structure = get_structures_table(c["id_structure"]) 
        name = c["name_structure"] 

        for attribut in structure:
            col = attribut["name"]
            type = attribut["type"].strip().lower() # "type" depuis l'entrepot de donnee 

            if type == "date": 
                champ = f'TO_CHAR({name}."{col}", \'DD-MM-YYYY\') AS "{name}.{col}"' 
                list_champs_date.append(f'{name}."{col}" IS NOT NULL')  
            elif type == "varchar": 
                champ = f"COALESCE({name}.\"{col}\", ' ') AS \"{name}.{col}\""
            elif type == "integer":  
                champ = f'COALESCE({name}."{col}", 0) AS "{name}.{col}"'
            else:
                champ = f'{name}."{col}" AS "{name}.{col}"'
            list_champs.append(champ) 
 
    req_data = recuperer_donnees_entrepot(formats=formats_data, champs=list_champs, jointures= jointures_data, filtres=filtres_data, filtres_date=list_champs_date)

    # print(f"\n\n[ --- ] req_data = {req_data}\n\n")

    requete_sql = req_data["requete_sql"]
    api_data = req_data["api_data"]
    api_data_original = api_data    
     
    if affichage_data.strip().lower() in ["graphique en barres", "histogramme", "graphique linéaire"]: 
        list_champ_groupBY_axes = []
        
        for c in champs_data:
            champ_nom = c["nom"]
            champ_type = c["type"]
            champ_typeAttribut = c["typeAttribut"]
            is_used_as_operation = any(champ_nom == op["as_nom"] for op in operations_data)
            
            if not is_used_as_operation and champ_type != "AxesY":
                list_champ_groupBY_axes.append(champ_nom)
                champs_axes.append({
                    "champ_type": champ_type,
                    "champ_typeAttribut": champ_typeAttribut,
                    "champ_nom": champ_nom
                })
                
        res_gls = generate_logic_string(operations_data, list_champ_groupBY_axes, api_data,requete_sql)
        logic_operation = res_gls["result"] 
        params_operation = res_gls["params"] 

    elif affichage_data.strip().lower() in ["cartographie à barres", "cartographie circulaires"]:  
        champ_region = next((ch["parametre"] for ch in champs_data if ch["type"] == "manual"), None)
        champ_lat = next((ch["parametre"] for ch in champs_data if ch["type"] == "lat"), None)
        champ_lon = next((ch["parametre"] for ch in champs_data if ch["type"] == "lon"), None)
        champ_niv = next((ch["parametre"] for ch in champs_data if (ch["type"] == "maps" or ch["type"] == "manual") and ch["as_nom"] == "maps-niv"), None) 
        champ_lat_lon_grpby = [] 
        maps_champ_niv = champ_niv  
        if champ_lat and champ_lon:  
            champ_lat_lon_grpby.append(champ_niv) 
        else: 
            champ_lat_lon_grpby.append(champ_region) 
        res_gls = generate_logic_string(operations_data, champ_lat_lon_grpby, api_data,requete_sql) 
        logic_operation = res_gls["result"] 
        params_operation = res_gls["params"]  
         
    else:   
        res_gls = generate_logic_string(operations_data, list_champ_groupBY, api_data, requete_sql)   
        logic_operation = res_gls["result"] 
        params_operation = res_gls["params"]  

    print("\n\n[---] GEN LOGIC VAL ET PARAMS : res_gls = ", res_gls)
 
    grammar_path = os.path.join(os.path.dirname(__file__), "lark", "grammar.lark")
    with open(grammar_path, "r", encoding="utf-8") as f:
        grammar_text = f.read() 

    parser = Lark(grammar_text, parser="lalr", start="start") 
    
    resultats_op= []
    for logic, op_data, params in zip(logic_operation, operations_data, params_operation):
        try: 
            text = logic["operation"] 
            requete_sql = logic["requete_sql"]  
            nom_op = logic["nomOP"]
            alias = op_data["as_nom"]
            tree = parser.parse(text) 

            print(f"[---] requete_sql: {requete_sql}")
            if requete_sql:
                result = executeur_requete(requete_sql) 
                api_data = result["api_data"] 
            else:
                api_data = api_data_original  

            if affichage_data.strip().lower() in ["cartographie à barres", "cartographie circulaires"]:
                champ_region = next((ch["parametre"] for ch in champs_data if ch["type"] == "manual"), None)
                champ_lat = next((ch["parametre"] for ch in champs_data if ch["type"] == "lat"), None)
                champ_lon = next((ch["parametre"] for ch in champs_data if ch["type"] == "lon"), None)
                champ_niv = next((ch["parametre"] for ch in champs_data if ch["type"] == "maps" and ch["as_nom"] == "maps-niv"), None) 
                
                if champ_lat and champ_lon:   
                    maps_traitement = "coordonnees"
                    new_api_data = []
                    for row in api_data:
                        lat_val = row.get(champ_lat)
                        lon_val = row.get(champ_lon)

                        if lat_val is not None and lon_val is not None:
                            if champ_niv == "maps.Pays":
                                geo_val = get_country(lat=lat_val, lon=lon_val)
                            elif champ_niv == "maps.Ville":
                                geo_val = get_state(lat=lat_val, lon=lon_val)
                            else:
                                geo_val = None

                            if geo_val:
                                new_row = row.copy()
                                new_row[champ_niv] = geo_val  # création explicite de la colonne
                                new_api_data.append(new_row)
                    api_data = new_api_data 
                else:
                    maps_champ_region = champ_region
                    maps_traitement = "manual"

            variance_sample, percentile, tc_date_key, tc_global_rate = params
            percentile = percentile / 100
            
            result = CustomTransformer(api_data, variance_sample, percentile, tc_date_key, tc_global_rate).transform(tree) 
            
            print(f"[---] result CT: {result}") 
            if isinstance(result, list) and all(isinstance(r, dict) for r in result):
                for r in result:
                    value_key = [k for k in r.keys() if isinstance(r[k], (int, float, Decimal, list))]
                    if value_key and alias not in r:
                        key = value_key[-1]
                        val = r.pop(key)
                        if isinstance(val, list):
                            r[alias] = ", ".join(str(v) for v in val)
                        elif isinstance(val, Decimal): 
                            r[alias] = float(val) 
                        else:
                            r[alias] = val
                resultats_op.append(result)
        except Exception as e: 
            print("Erreur :", e)  
               
    print("\n\n[---] RESCALC : resultats_op = ", resultats_op)
    # print(f"\n\n[ --- ] resultats_op = {resultats_op}\n\n")
    resultats_final = adjust_result_by_affichage(resultats_op=resultats_op, affichage=affichage_data, champs_axes=champs_axes, list_operation_name=list_operation_name, champ_niv=maps_champ_niv, champs_data=champs_data, maps_traitement=maps_traitement, maps_champ_region=maps_champ_region) 
    # print(f"\n\n[ --- ] resultats_final = {resultats_final}\n\n")
    
    print("\n\n[---] RESFINL : resultats_final = ", resultats_final)

    # APPEL AU LLM OLLAMA 3:8b 
    res_llm_id = 0
    var_llm = True
    if var_llm is True:
        entrepot_de_donnee = req_data["api_data"]
        resultat_calcul = resultats_final["resultats_final"] 

        schema = {}
        for item in champs_data:
            nom = item['nom']
            type_attribut = item['typeAttribut'] if item['typeAttribut'] else 'FLOAT'
            schema[nom] = f"{type_attribut}" 
        
        calculStat = {}
        for op in logic_operation:
            calculStat[op['nomOP']] = f"{op['as_nom']} : {op['operation']}" 

        title = restitution.nom or "Restitution sans nom"
        affichage = affichage_data 
        description = restitution.description or "Aucune description disponible"
        
        filtres =  ""
        premiere_requete = res_gls['result'][0]['requete_sql']  
        if 'WHERE' in premiere_requete:
            filtres = premiere_requete.split('WHERE')[1].strip() 
        else:
            filtres = "Aucun filtre appliquer" 

        # Vous avez accès à des données de l'entrepôt de données pour maximiser l'analyse donc n'oublie pas de l'analyser car c'est un pre-requis. 
        prompte_systeme = f"""
        [CONTEXTE]
        Vous êtes un Analyste Senior expert en analyse de données. 
        Votre rôle est d’interpréter les résultats statistiques fournis et d’en dégager des tendances utiles pour la prise de décision.

        [OBJECTIF]
        Fournir une analyse synthétique, claire et orientée métier des données transmises.

        [CONTRAINTES]
        - Votre sortie doit être au format JSON strict.
        - Les sections suivantes doivent toujours être présentes : 
        titre_analyse, tendances_cles, anomalies_possibles, resume_executif, ton analyse personnel.
        - Réponse concise, sans explications hors JSON.
        - Vous êtes rigoureux, neutre, et orienté performance.

        [STYLE DE COMMUNICATION]
        Professionnel, analytique et structuré.
        """ 


        payload = {
            "entrepot_de_donnee": entrepot_de_donnee,
            "resultat_calcul": resultat_calcul,
            "schema": schema,
            "calculStat": calculStat,
            "title": title,
            "affichage": affichage,
            "filtres": filtres,
            "description": description,
            "prompte_systeme": prompte_systeme,
            # "model": "llama-3.3-70b-versatile"
            "model": "qwen/qwen3-32b"
        }
        task_llm = lancer_llm_async.delay(payload)
        res_llm_id = task_llm.id
        print(f"\n\n[ --- ] TaskId: {res_llm_id} \n\n") 
        
     
    # ✅ Extraire les noms de champs à partir du premier élément 
    if affichage_data.strip().lower() in ["tableau croisée dynamique", "tableau simple"]:
        if resultats_final["resultats_final"]: 
            keys = resultats_final["resultats_final"][0].keys()
            list_champs_front = [
                {"nom": k, "as_nom": k}
                for k in keys
                if k != "id"
            ]
            print("\n\n[---] TCD : list_champs_front = ", list_champs_front)
        else:
            print("\n\n[---] TCD : list_champ_groupBY = ", list_champ_groupBY)
            list_champs_front = list_champ_groupBY
 
    
    res_final = {
            "status": "SUCCESS",
            "id": restitution.id,
            "nom": restitution.nom,
            "affichage": affichage_data,
            "champs": champs_data,
            "liste_champs": list_champs_front,
            "resultats":  resultats_final["resultats_final"],
            "llm_generative_task_id": res_llm_id
        }  
    return res_final


@app.task
def bulk_delete_task(ids: list):
    if not ids:
        return {
            "error": "Liste d'IDs vide",
            "deleted_count": 0,
            "deleted_ids": [],
            "not_found_ids": []
        }

    existing = Restitutions.objects.filter(id__in=ids)
    deleted_ids = list(existing.values_list("id", flat=True))
    not_found_ids = [i for i in ids if i not in deleted_ids]
    count = existing.count()
    existing.delete() 
    
    return {
        "message": f"{count} supprimées.",
        "deleted_ids": deleted_ids,
        "not_found_ids": not_found_ids
    }


@app.task
def compare_structures_id():
    used_structure_ids = set(Formats.objects.values_list('id_structure', flat=True))

    # URL de l'API et token depuis .env
    api_url = os.getenv("DJANGO_URL_IRIS") + "get_formats/"
    token = os.getenv("DJANGO_TOKEN_IRIS")  

    if not token:
        print("[DEBUG] Token manquant dans les variables d'environnement.")
        return [] 

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }

    try:
        response = requests.get(api_url,  timeout=10)
        response.raise_for_status()
        formats_data = response.json()
    except requests.RequestException as e:
        print(f"[Celery] Erreur lors de la récupération des structures via API : {e}")
        return []
 
    # Extraction des IDs de structures depuis les données reçues
    existing_structure_ids = set()
    for item in formats_data:
        structure_id = item.get("id")
        if structure_id is not None:
            existing_structure_ids.add(structure_id)

    missing_structures = list(used_structure_ids - existing_structure_ids)
 
    return missing_structures


@app.task
def list_formats(): 
    return get_structures()


@app.task
def format_and_structure_table(id): 
    try:
        id_int = int(id)
    except (ValueError, TypeError):
        return []
    
    return get_structures_table(id_int)
 