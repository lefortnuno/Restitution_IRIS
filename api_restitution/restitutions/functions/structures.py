import os
import requests

def get_structures():
    api_url = os.getenv("DJANGO_URL_IRIS") + "get_formats/"
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
            response = requests.get(api_url,  timeout=10)
            response.raise_for_status()
            formats_data = response.json()
        except requests.RequestException as e:
            print(f"[Celery] Erreur lors de la récupération des formats via API : {e}")
            return []
    
        # Extraction des IDs et NAMEs de formats depuis les données reçues
        formats = []
        for item in formats_data:
            structure_id = item.get("id")
            structure_name = item.get("name")
            if structure_id is not None and structure_name is not None:
                formats.append({"id":structure_id, "name":structure_name}) 
        return formats
    else:
        return [  
            { "id": 1, "name": "AUDIT_FINANCIER" }, 
            { "id": 2, "name": "COMPTA_COMPTE" }, 
            { "id": 3, "name": "AUDIT_BANCAIRE" },
            { "id": 4, "name": "INVESTISSEMENTS" },
            { "id": 5, "name": "CREDIT_CREANCE" },
            { "id": 6, "name": "GARANTIES" },
            { "id": 7, "name": "AGIOS" },
            { "id": 8, "name": "COMPTE_DEBITEUR" }
        ]
