import re
import json
import time
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

# ──────────────────────────────────────────────
# Limites Groq par modèle
# ──────────────────────────────────────────────
# tpm               : tokens par minute autorisés
# token_limit       : budget total par appel (system + user + données)
# data_chunk_budget : tokens réservés aux données dans chaque chunk
# delay_safety_s    : secondes de marge fixe ajoutées au délai calculé
MODEL_RATE_CONFIG = {
    "qwen/qwen3-32b": {
        "tpm": 6_000,
        "token_limit": 3_000,
        "data_chunk_budget": 1_800,
        "delay_safety_s": 3,
    },
    "llama-3.3-70b-versatile": {
        "tpm": 12_000,
        "token_limit": 5_000,
        "data_chunk_budget": 3_500,
        "delay_safety_s": 3,
    },
}

# Config de secours si le modèle n'est pas reconnu (conservateur)
_DEFAULT_CONFIG = {
    "tpm": 6_000,
    "token_limit": 3_000,
    "data_chunk_budget": 1_800,
    "delay_safety_s": 3,
}


def _get_model_config(modele: str) -> dict:
    """Retourne la config rate-limit du modèle (correspondance partielle)."""
    for key, cfg in MODEL_RATE_CONFIG.items():
        if key in modele or modele in key:
            return cfg
    print(f"⚠️  Modèle '{modele}' inconnu → config conservatrice appliquée")
    return _DEFAULT_CONFIG


def _rate_delay(tokens_sent: int, cfg: dict) -> float:
    """
    Calcule la pause nécessaire pour rester sous le TPM.
    delay = tokens_sent / (tpm / 60)  +  marge de sécurité fixe
    """
    tps = cfg["tpm"] / 60.0          # tokens par seconde autorisés
    delay = tokens_sent / tps + cfg["delay_safety_s"]
    return round(delay, 1)


# ──────────────────────────────────────────────
# Utils tokens
# ──────────────────────────────────────────────
def estimate_tokens(text: str) -> int:
    """Estimation rapide : 1 token ≈ 4 caractères."""
    if not text:
        return 0
    return max(1, len(text) // 4)


def split_array_by_token_limit(data: list, max_tokens: int) -> list:
    """Découpe une liste en chunks dont chacun tient dans max_tokens."""
    chunks, current_chunk, current_tokens = [], [], 0

    for item in data:
        item_text   = json.dumps(item, ensure_ascii=False)
        item_tokens = estimate_tokens(item_text)

        if current_tokens + item_tokens > max_tokens and current_chunk:
            chunks.append(current_chunk)
            current_chunk  = [item]
            current_tokens = item_tokens
        else:
            current_chunk.append(item)
            current_tokens += item_tokens

    if current_chunk:
        chunks.append(current_chunk)

    return chunks


# ──────────────────────────────────────────────
# Point d'entrée principal
# ──────────────────────────────────────────────
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
        taille_schema    = len(schema)    if schema    else 1
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


# ──────────────────────────────────────────────
# Orchestrateur : simple ou map-reduce
# ──────────────────────────────────────────────
def obtenir_reponse_llama_groq(
    prompt_systeme,
    prompt_utilisateur,
    resultat_calcul,
    modele,
    timerequest
):
    cfg = _get_model_config(modele)
    token_limit    = cfg["token_limit"]
    chunk_budget   = cfg["data_chunk_budget"]

    overhead_tokens = (
        estimate_tokens(prompt_systeme)
        + estimate_tokens(prompt_utilisateur)
        + 150  # marge sécurité
    )
    data_tokens = estimate_tokens(json.dumps(resultat_calcul, ensure_ascii=False))
    total_tokens = overhead_tokens + data_tokens

    print(f"⚠️  Tokens estimés — overhead: {overhead_tokens}, data: {data_tokens}, total: {total_tokens} (limite: {token_limit}, modèle: {modele})")

    # ── Cas simple : tout tient dans un seul appel ──
    if total_tokens <= token_limit:
        full_prompt = (
            prompt_utilisateur
            + "\n\nRésultats :\n"
            + json.dumps(resultat_calcul, ensure_ascii=False)
        )
        return _appel_groq(prompt_systeme, full_prompt, modele, expect_final=True)

    # ── Cas chunking : map-reduce ──
    print(f"⚠️  Volume trop élevé ({total_tokens} tokens) → découpage map-reduce")

    if not isinstance(resultat_calcul, list):
        # Données non découpables : on tronque en dernier recours
        print("⚠️  resultat_calcul n'est pas une liste — troncature")
        full_prompt = (
            prompt_utilisateur
            + "\n\nRésultats (tronqués) :\n"
            + json.dumps(resultat_calcul, ensure_ascii=False)[:8000]
        )
        return _appel_groq(prompt_systeme, full_prompt, modele, expect_final=True)

    # Budget données par chunk = min(config, limite − overhead − marge)
    effective_budget = min(chunk_budget, token_limit - overhead_tokens - 200)
    if effective_budget < 500:
        effective_budget = 500  # plancher minimal

    chunks      = split_array_by_token_limit(resultat_calcul, effective_budget)
    total_parts = len(chunks)
    print(f"📦  {total_parts} chunk(s) de ≤{effective_budget} tokens chacun")

    # ── Phase MAP : analyse partielle de chaque chunk ──
    partial_analyses = []

    for i, chunk in enumerate(chunks, start=1):
        chunk_tokens = estimate_tokens(json.dumps(chunk, ensure_ascii=False))
        call_tokens  = overhead_tokens + chunk_tokens
        delay        = _rate_delay(call_tokens, cfg)
        print(f"[LLM MAP] Chunk {i}/{total_parts} (~{call_tokens} tokens envoyés)")

        map_prompt = f"""{prompt_utilisateur}

CONSIGNE POUR CETTE PARTIE :
Il s'agit de la partie {i}/{total_parts} des données.
Produis une analyse PARTIELLE et COMPACTE uniquement sur ces données.
Réponds UNIQUEMENT en JSON valide :
{{
  "synthese_partielle": "...",
  "tendances": ["..."],
  "anomalies": ["..."]
}}

Données (partie {i}/{total_parts}) :
{json.dumps(chunk, ensure_ascii=False)}
"""

        partial = _appel_groq(prompt_systeme, map_prompt, modele, expect_final=False)
        if partial:
            partial_analyses.append(partial)
        else:
            print(f"⚠️  Chunk {i} sans résultat — ignoré")

        if i < total_parts:
            print(f"⏳  Pause {delay}s (rate limit {cfg['tpm']} TPM)")
            time.sleep(delay)

    if not partial_analyses:
        print("❌ Aucune analyse partielle récupérée")
        return None

    # ── Phase REDUCE : synthèse des analyses partielles ──
    reduce_tokens = overhead_tokens + estimate_tokens(json.dumps(partial_analyses, ensure_ascii=False))
    reduce_delay  = _rate_delay(reduce_tokens, cfg)
    print(f"[LLM REDUCE] Synthèse de {len(partial_analyses)} analyse(s) partielle(s)")
    print(f"⏳  Pause {reduce_delay}s avant synthèse")
    time.sleep(reduce_delay)

    reduce_prompt = f"""{prompt_utilisateur}

Les données ont été découpées en {total_parts} partie(s) et analysées séparément.
Voici les analyses partielles :

{json.dumps(partial_analyses, indent=2, ensure_ascii=False)}

Synthétise ces analyses partielles en une ANALYSE FINALE COMPLÈTE.
Respecte strictement le format JSON demandé.
"""

    return _appel_groq(prompt_systeme, reduce_prompt, modele, expect_final=True)


# ──────────────────────────────────────────────
# Appel Groq
# ──────────────────────────────────────────────
def _appel_groq(
    prompt_systeme: str,
    prompt_utilisateur: str,
    modele: str,
    expect_final: bool = True
):
    """
    Effectue un unique appel Groq.
    - expect_final=True  → retourne un dict JSON complet (analyse finale)
    - expect_final=False → retourne un dict JSON compact (analyse partielle)
    Retourne None en cas d'échec.
    """
    try:
        completion = client.chat.completions.create(
            model=modele,
            messages=[
                {"role": "system", "content": prompt_systeme},
                {"role": "user",   "content": prompt_utilisateur},
            ],
            temperature=0.1,
            max_completion_tokens=1024,
            top_p=1,
            stream=False,
        )

        texte = completion.choices[0].message.content.strip()
        print(f"✅ Groq OK ({modele}) — {estimate_tokens(texte)} tokens en sortie")

        match = re.search(r"\{[\s\S]*\}", texte)
        if not match:
            print("⚠️  Aucun JSON détecté dans la réponse")
            return None

        return json.loads(match.group(0))

    except Exception as e:
        print(f"❌ Erreur appel Groq ({modele}) : {e}")
        return None
