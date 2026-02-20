import re
import json
import time
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL_LLAMA70B = "llama-3.3-70b-versatile"

client = Groq(api_key=GROQ_API_KEY)


def initialisation_argument(entrepot_de_donnee, resultat_calcul, schema, calculStat,
                            title, affichage, filtres, description, prompte_systeme, modele_llm):

    print("Clé chargée ?", GROQ_API_KEY[:10] if GROQ_API_KEY else "Aucune")

    try:
        taille_entrepot_de_donnee = len(entrepot_de_donnee[0]) if entrepot_de_donnee else 1
        taille_donnees = len(resultat_calcul[0]) if resultat_calcul else 1
        taille_schema = len(schema) if schema else 1
        taille_calculStat = len(calculStat) if calculStat else 1

        timerequest = min(
            taille_entrepot_de_donnee * taille_donnees * taille_schema * taille_calculStat * 170 / 2,
            600
        )

        prompt_utilisateur = f"""
            [ENTRÉES DISPONIBLES]

            Nombre de champs : {taille_schema}

            Schéma des données :
            {json.dumps(schema, indent=2, ensure_ascii=False) if schema else "Aucun schéma"}

            Nombre d'opérations statistiques : {taille_calculStat}

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

        print("\n\n 🔄 [Groq] Appel du LLM en cours...\n\n")

        resultat = obtenir_reponse_llama_groq(
            prompte_systeme,
            prompt_utilisateur,
            modele_llm,
            timerequest
        )

        return resultat

    except Exception:
        return None



def obtenir_reponse_llama_groq(prompt_systeme, prompt_utilisateur, modele, timerequest):

    if modele in ("llama70", "llama-70b"):
        modele = GROQ_MODEL_LLAMA70B

    start_time = time.time()

    try:
        print(f"📤 Requête envoyée à Groq ({modele}) - timeout: {timerequest}s")

        # →→→ APPEL DIRECT GROQ SDK (comme ton snippet demandé)
        completion = client.chat.completions.create(
            model=modele,
            messages=[
                {
                    "role": "system",
                    "content": "[CONTEXTE]\n"
                               "Vous êtes un Analyste Senior expert en analyse de données.\n"
                               "Votre rôle est d’interpréter les résultats statistiques fournis et d’en dégager "
                               "des tendances utiles pour la prise de décision.\n\n"
                               "[OBJECTIF]\n"
                               "Fournir une analyse synthétique, claire et orientée métier des données transmises.\n\n"
                               "[CONTRAINTES]\n"
                               "- Votre sortie doit être au format JSON strict.\n"
                               "- Les sections suivantes doivent toujours être présentes :\n"
                               "  titre_analyse, tendances_cles, anomalies_possibles, resume_executif, ton_analyse_personnel.\n"
                               "- Réponse concise, sans explications hors JSON.\n"
                               "- Vous êtes rigoureux, neutre, et orienté performance.\n\n"
                               "[STYLE DE COMMUNICATION]\n"
                               "Professionnel, analytique et structuré."
                },
                {"role": "user", "content": prompt_utilisateur}
            ],
            temperature=0,
            max_completion_tokens=1024,
            top_p=1,
            stream=False
        )

        texte = completion.choices[0].message.content.strip()
        end_time = time.time()

        print("\n" + "=" * 60)
        print(f"✅  ANALYSE TERMINÉE (Groq) : {end_time - start_time:.2f}s {texte}")
        print("=" * 60 + "\n")

        # Extraction JSON
        match = re.search(r"\{[\s\S]*\}", texte)
        if match:
            return json.loads(match.group(0))

        raise ValueError("Aucun JSON détecté dans la réponse.")

    except Exception as e:
        print(f"\n💥 ERREUR avec Groq : {e}\n")
        return None
