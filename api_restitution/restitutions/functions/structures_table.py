import os
import requests

def get_structures_table(id):
    api_url = os.getenv("DJANGO_URL_IRIS") + "donneetab-meta-data/" + str(id) 
    token = os.getenv("DJANGO_TOKEN_IRIS")   

    if not token:
        print("[DEBUG] Token manquant dans les variables d'environnement.")
        return [] 

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }
 
    hometask = False
    if hometask:
        try: 
            response = requests.get(api_url, timeout=10) 
            response.raise_for_status() 
            formats_data = response.json() 
        except requests.RequestException as e:
            print(f"[Celery] Erreur lors de la récupération des structures de table via API : {e}")
            return []
    
        attributs = []
        # Extraction NAME du format puis ses attributs et avec ses types  
        if formats_data.get("structure", {}).get("name") is not None:
            for item in formats_data.get("structure_tables", []):
                id = item.get("id")
                name = item.get("name")
                type = item.get("type")
                if id and name and type:
                    attributs.append({"id": id, "name": name, "type": type}) 
        return attributs

    else:
        print("\n\n[---] id = ", id)
        match id:
            case 1:
                return [
                    { "id": 1, "name": "date", "type": "date" },
                    { "id": 2, "name": "codeT", "type": "VARCHAR" },
                    { "id": 3, "name": "montent", "type": "integer" },
                    { "id": 4, "name": "compt", "type": "VARCHAR" },
                    { "id": 5, "name": "lat", "type": "integer" },
                    { "id": 6, "name": "lon", "type": "integer" },
                    { "id": 7, "name": "money", "type": "integer" }
                ]
            case 2:
                return [
                    { "id": 9, "name": "Date", "type": "date" },
                    { "id": 8, "name": "NACMPT_3A", "type": "VARCHAR" },
                    { "id": 10, "name": "REF_UNIQUE", "type": "integer" },
                    { "id": 11, "name": "type_de_compte", "type": "VARCHAR" }
                ]
            case 3:
                return [
                    { "id": 853, "name": "compt", "type": "VARCHAR" },
                    { "id": 854, "name": "date", "type": "date" },
                    { "id": 855, "name": "montent", "type": "integer" },
                    { "id": 856, "name": "codeT", "type": "VARCHAR" },
                    { "id": 857, "name": "lat", "type": "integer" },
                    { "id": 858, "name": "lon", "type": "integer" },
                    { "id": 859, "name": "money", "type": "integer" },
                    { "id": 860, "name": "region", "type": "VARCHAR" }
                ]
            case 4:
                return [
                    { "id": 21, "name": "contrat", "type": "VARCHAR" },
                    { "id": 22, "name": "taccode", "type": "VARCHAR" },
                    { "id": 23, "name": "montant_investissement", "type": "FLOAT" },
                    { "id": 24, "name": "materiel_num", "type": "VARCHAR" },
                    { "id": 25, "name": "libelle", "type": "VARCHAR" },
                    { "id": 26, "name": "phase", "type": "VARCHAR" },
                    { "id": 27, "name": "jalon", "type": "VARCHAR" },
                    { "id": 28, "name": "date_debut", "type": "date" },
                    { "id": 29, "name": "date_fin", "type": "date" },
                    { "id": 30, "name": "duree", "type": "VARCHAR" },
                    { "id": 31, "name": "dureem", "type": "VARCHAR" },
                    { "id": 32, "name": "montant1", "type": "FLOAT" },
                    { "id": 33, "name": "montant2", "type": "FLOAT" },
                    { "id": 34, "name": "libelle1", "type": "VARCHAR" },
                    { "id": 35, "name": "date_effet", "type": "date" }
                ]
            case 5:
                return [
                    { "id": 41, "name": "Code_Tiers", "type": "VARCHAR" },
                    { "id": 42, "name": "Nom_Tiers", "type": "VARCHAR" },
                    { "id": 43, "name": "Num_Engag", "type": "VARCHAR" },
                    { "id": 44, "name": "Nb_Impayes", "type": "INTEGER" },
                    { "id": 45, "name": "Duree_jour", "type": "INTEGER" },
                    { "id": 46, "name": "CRD", "type": "FLOAT" },
                    { "id": 47, "name": "Mnt_Impaye", "type": "FLOAT" },
                    { "id": 48, "name": "Date_ARRETE", "type": "DATE" },
                    { "id": 49, "name": "Flag_restructure", "type": "BOOLEAN" }
                ]
            case 6:
                return [
                    { "id": 51, "name": "ID_Garantie", "type": "VARCHAR" },
                    { "id": 52, "name": "Code_Tiers", "type": "VARCHAR" },
                    { "id": 53, "name": "Num_Engagement", "type": "VARCHAR" },
                    { "id": 54, "name": "Type_Garantie", "type": "VARCHAR" },
                    { "id": 55, "name": "Valeur_Expertise", "type": "FLOAT" },
                    { "id": 56, "name": "Date_Expertise", "type": "DATE" },
                    { "id": 57, "name": "Montant_Couverture", "type": "FLOAT" },
                    { "id": 58, "name": "Date_ARRETE", "type": "DATE" }
                ]
            case 7:
                return [
                    { "id": 61, "name": "Num_ENGAGEMENT", "type": "VARCHAR" },
                    { "id": 62, "name": "Code_Tiers", "type": "VARCHAR" },
                    { "id": 63, "name": "Creance", "type": "FLOAT" },
                    { "id": 64, "name": "Taux_interet_annuel", "type": "FLOAT" },
                    { "id": 65, "name": "Nb_jours_de_retard", "type": "INTEGER" },
                    { "id": 66, "name": "Base", "type": "INTEGER" },
                    { "id": 67, "name": "Date_dernier_calcul", "type": "DATE" }
                ]
            case 8:
                return [
                    { "id": 71, "name": "Code_Tiers", "type": "VARCHAR" },
                    { "id": 72, "name": "Num_Compte", "type": "VARCHAR" },
                    { "id": 73, "name": "Mnt_Debiteur", "type": "FLOAT" },
                    { "id": 74, "name": "Autorisation", "type": "FLOAT" },
                    { "id": 75, "name": "Duree_Depassement", "type": "INTEGER" },
                    { "id": 76, "name": "Date_arrete", "type": "DATE" }
                ] 
            case _:
                return [
                    { "id": 751, "name": "REF_UNIQUE", "type": "VARCHAR" },
                    { "id": 752, "name": "AUDIT_T24", "type": "VARCHAR" },
                    { "id": 753, "name": "type_de_compte", "type": "VARCHAR" },
                    { "id": 754, "name": "Retour_T24", "type": "VARCHAR" },
                    { "id": 755, "name": "application", "type": "VARCHAR" },
                    { "id": 756, "name": "Date", "type": "date" },
                    { "id": 757, "name": "me", "type": "VARCHAR" },
                    { "id": 758, "name": "NACMPT_3A", "type": "VARCHAR" },
                    { "id": 759, "name": "Exported", "type": "VARCHAR" }
                ]
             