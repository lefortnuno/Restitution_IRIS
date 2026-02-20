import re
import requests
import json
import time  

def initialisation_argument(entrepot_de_donnee, resultat_calcul, schema, calculStat, title, affichage, filtres, description, prompte_systeme, modele_llm):
    """
    Initialise et appelle le modèle LLM avec les données fournies
    
    Args:
        entrepot_de_donnee: Données brutes de l'entrepôt
        resultat_calcul: Résultats des calculs statistiques
        schema: Schéma des données
        calculStat: Description des calculs effectués
        title: Titre de la restitution
        affichage: Type d'affichage
        filtres: Filtres appliqués
        description: Description utilisateur
        prompte_systeme: Prompt système pour le LLM
        modele_llm: Modèle à utiliser
    
    Returns:
        str: Réponse du LLM ou None en cas d'erreur
    """
    
    try: 
        # Calcul robuste de la taille avec gestion des cas edge
        taille_entrepot_de_donnee = len(entrepot_de_donnee[0]) if entrepot_de_donnee and len(entrepot_de_donnee) > 0 else 1
        taille_donnees = len(resultat_calcul[0]) if resultat_calcul and len(resultat_calcul) > 0 else 1
        taille_schema = len(schema) if schema else 1
        taille_calculStat = len(calculStat) if calculStat else 1 
        
        # Calcul du timeout avec limites raisonnables
        timerequest = min(taille_entrepot_de_donnee * taille_donnees * taille_schema * taille_calculStat * 170 / 2, 600)  # Max 10 minutes
        
            # Entrepôt de données: 
            # {json.dumps(entrepot_de_donnee, indent=2, ensure_ascii=False) if entrepot_de_donnee else "Aucune donnée"}
        prompt_utilisateur = f"""
            [ENTRÉES DISPONIBLES]

            Nombre de champs : {taille_schema}

            Schéma des données :
            {json.dumps(schema, indent=2, ensure_ascii=False) if schema else "Aucun schéma"}

            Nombre d'opération statistique: {taille_calculStat}

            Calculs statistiques effectués :
            {json.dumps(calculStat, indent=2, ensure_ascii=False) if calculStat else "Aucun calcul"}

            Filtres appliqués :
            {json.dumps(filtres, indent=2, ensure_ascii=False) if filtres else "Aucun filtre"}

            Type d'affichage : {affichage}
            Titre : {title}
            Description : {description}

            Résultats des calculs à analyser :
            {json.dumps(resultat_calcul, indent=2, ensure_ascii=False) if resultat_calcul else "Aucun résultat"}

            [FORMAT DE SORTIE ATTENDU]
            Répondez strictement au format JSON :
            {{
            "titre_analyse": "Titre de l'analyse basé sur les données",
            "tendances_cles": ["Tendance 1", "Tendance 2", "Tendance 3"], 
            "anomalies_possibles": ["Anomalie 1", "Anomalie 2"],  
            "resume_executif": "Résumé concis des insights principaux",
            "ton_analyse_personnel": "Analyse personnelle et recommandations"
            }}
        """
 
        print(f"\n\n 🔄 [ --- ]Appel du LLM en cours... \n\n") 
        # print(f"\n\n[ --- ] prompt_utilisateur = {prompt_utilisateur}\n\n") 
        resultat = obtenir_reponse_llama_simple(prompte_systeme, prompt_utilisateur, modele_llm, timerequest)
        
        if resultat:
            # print("✅ Analyse LLM terminée avec succès")
            return resultat
        else:
            # print("❌ Échec de l'analyse LLM")
            return None
            
    except Exception as e:
        # print(f"💥 Erreur dans initialisation_argument: {e}")
        return None


def obtenir_reponse_llama_simple(prompt_systeme, prompt_utilisateur, modele, timerequest):
    """
    Appel simple à l'API Ollama avec gestion d'erreur
    
    Args:
        prompt_systeme: Prompt système
        prompt_utilisateur: Prompt utilisateur  
        modele: Modèle LLM
        timerequest: Timeout en secondes
    
    Returns:
        str: Réponse du LLM ou None
    """
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": modele,
        "system": prompt_systeme,
        "prompt": prompt_utilisateur,
        "stream": False,
        "options": {"temperature": 0  } # Mettre temperature = 0 (plus rapide et plus stable)
    }

    start_time = time.time()

    try:
        print(f"📤 Requête envoyée à Ollama ({modele}) - timeout: {timerequest}s")
        response = requests.post(url, json=payload, timeout=timerequest)
        response.raise_for_status()

        end_time = time.time()
        resultat_json = response.json()
        resultat_texte = resultat_json.get("response", "").strip()

        print("\n" + "=" * 60) 
        print(f"✅  ANALYSE TERMINÉE : Temps de réponse : {end_time - start_time:.2f} secondes")
        print("\n" + "=" * 60 + "\n")

        txt = resultat_texte
 
        match = re.search(r"\{[\s\S]*\}", txt)
        if match:
            json_str = match.group(0)
        else:
            raise ValueError("Aucun JSON détecté dans la réponse.")
 
        resultat_finale = json.loads(json_str)

        # print(f"\n🧠 RÉSULTAT :\n{resultat_finale}") 

        return resultat_finale

    except requests.exceptions.ConnectionError as e:
        print(f"\n❌ ERREUR DE CONNEXION : Impossible de se connecter à Ollama")
        print(f"💡 Vérifiez que Ollama est démarré : 'ollama serve'")
        return None
        
    except requests.exceptions.Timeout:
        print(f"\n⏰ TIMEOUT : La requête a dépassé {timerequest} secondes")
        return None
        
    except requests.exceptions.HTTPError as e:
        print(f"\n🚨 ERREUR HTTP {e.response.status_code if e.response else 'N/A'}: {e}")
        return None
        
    except requests.exceptions.RequestException as e:
        print(f"\n⚠️  ERREUR DE REQUÊTE : {e}")
        return None
        
    except Exception as e:
        print(f"\n💥 ERREUR INATTENDUE : {e}")
        return None
