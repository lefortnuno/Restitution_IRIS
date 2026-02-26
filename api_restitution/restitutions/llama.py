import re
import json
import time
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
 
# GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_MODEL_LLAMA70B = "qwen/qwen3-32b"

client = Groq(api_key=GROQ_API_KEY)


# -------------------------------
# Utils tokens
# -------------------------------
def estimate_tokens(text: str) -> int:
    if not text:
        return 0
    return max(1, len(text) // 4)


def split_array_by_token_limit(data, max_tokens):
    chunks = []
    current_chunk = []
    current_tokens = 0

    for item in data:
        item_text = json.dumps(item, ensure_ascii=False)
        item_tokens = estimate_tokens(item_text)

        if current_tokens + item_tokens > max_tokens and current_chunk:
            chunks.append(current_chunk)
            current_chunk = [item]
            current_tokens = item_tokens
        else:
            current_chunk.append(item)
            current_tokens += item_tokens

    if current_chunk:
        chunks.append(current_chunk)

    return chunks


# -------------------------------
# Main
# -------------------------------
def initialisation_argument(
    entrepot_de_donnee,
    resultat_calcul,
    schema,
    calculStat,
    title,
    affichage,
    filtres,
    description,
    prompte_systeme,
    modele_llm
):

    try:
        taille_schema = len(schema) if schema else 1
        taille_calculStat = len(calculStat) if calculStat else 1

        timerequest = min(taille_schema * taille_calculStat * 80, 600)

        prompt_utilisateur = f"""
[ENTRÉES DISPONIBLES]

Schéma :
{json.dumps(schema, indent=2, ensure_ascii=False)}

Calculs :
{json.dumps(calculStat, indent=2, ensure_ascii=False)}

Filtres :
{json.dumps(filtres, indent=2, ensure_ascii=False)}

Type d'affichage : {affichage}
Titre : {title}
Description : {description}

[FORMAT DE SORTIE JSON STRICT]
{{
  "titre_analyse": "",
  "tendances_cles": [],
  "anomalies_possibles": [],
  "resume_executif": "",
  "ton_analyse_personnel": ""
}}
"""

        return obtenir_reponse_llama_groq(
            prompte_systeme,
            prompt_utilisateur,
            resultat_calcul,
            modele_llm,
            timerequest
        )

    except Exception as e:
        print("❌ ERREUR initialisation_argument :", e)
        return None


# -------------------------------
# Groq Logic
# -------------------------------
def obtenir_reponse_llama_groq(
    prompt_systeme,
    prompt_utilisateur,
    resultat_calcul,
    modele,
    timerequest
):

    TOKEN_LIMIT = 5000
    BASE_DELAY = 6

    base_tokens = (
        estimate_tokens(prompt_systeme)
        + estimate_tokens(prompt_utilisateur)
        + estimate_tokens(json.dumps(resultat_calcul, ensure_ascii=False))
    )

    print(f"⚠️ Tokens estimés : {base_tokens}")

    # 🔹 CAS SIMPLE
    if base_tokens <= TOKEN_LIMIT:
        full_prompt = prompt_utilisateur + "\n\nRésultats :\n" + json.dumps(
            resultat_calcul, ensure_ascii=False
        )
        return _appel_groq(prompt_systeme, full_prompt, modele, timerequest)

    # 🔹 CAS DÉCOUPAGE
    print("⚠️ Prompt trop volumineux → découpage")

    if not isinstance(resultat_calcul, list):
        raise ValueError("resultat_calcul doit être une LISTE pour le découpage")

    chunks = split_array_by_token_limit(resultat_calcul, 4500)
    total_parts = len(chunks)

    for i, chunk in enumerate(chunks, start=1):
        partial_prompt = f"""
PARTIE {i}/{total_parts}

Consigne :
- Analyse
- MÉMORISE
- NE GÉNÈRE PAS l'analyse finale
- Répond STRICTEMENT :
{{ "status": "PART_OK" }}

Données :
{json.dumps(chunk, ensure_ascii=False)}
"""

        _appel_groq(
            prompt_systeme,
            partial_prompt,
            modele,
            timerequest,
            expect_json=True
        )

        time.sleep(BASE_DELAY)

    final_prompt = """
Toutes les parties ont été transmises.

Génère maintenant l'analyse finale
au FORMAT JSON STRICT demandé.
"""

    time.sleep(BASE_DELAY)

    return _appel_groq(prompt_systeme, final_prompt, modele, timerequest)


# -------------------------------
# Groq Call
# -------------------------------
def _appel_groq(
    prompt_systeme,
    prompt_utilisateur,
    modele,
    timerequest,
    expect_json=True
):

    completion = client.chat.completions.create(
        model=modele,
        messages=[
            {"role": "system", "content": prompt_systeme},
            {"role": "user", "content": prompt_utilisateur}
        ],
        temperature=0,
        max_completion_tokens=1024,
        top_p=1,
        stream=False
    )

    texte = completion.choices[0].message.content.strip()

    print(f"✅ Groq OK ({modele})")

    if not expect_json:
        return texte

    match = re.search(r"\{[\s\S]*\}", texte)
    if not match:
        raise ValueError("❌ JSON non détecté")

    return json.loads(match.group(0))



def obtenir_reponse_llama_groq1(prompt_systeme, prompt_utilisateur, modele, timerequest):

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

