# CLAUDE.md — Restitution IRIS

## Vue d'ensemble du projet

Application fullstack de **restitution de données** (reporting/dataviz) pour le projet IRIS. Elle permet de configurer des restitutions (rapports) avec des sources de données, des opérations SQL-like, des types d'affichage (tableaux, graphiques, cartes) et une génération LLM optionnelle.

---

## Architecture

```
Restitution_IRIS/
├── api_restitution/        # Backend Django REST Framework (Python)
├── restitution_ui/         # Frontend React + TypeScript
├── nginx/                  # Reverse proxy (conf + certificats TLS)
├── docker-compose.yml      # Orchestration complète
├── Jenkinsfile             # CI/CD Jenkins
└── .gitlab-ci.yml          # CI/CD GitLab
```

### Services Docker

| Service     | Port exposé | Rôle                                      |
|-------------|-------------|-------------------------------------------|
| `frontendd` | 5173 → 80   | React SPA servi par Nginx interne         |
| `backendd`  | 8000        | API Django + Gunicorn                     |
| `celery`    | —           | Worker Celery pour tâches asynchrones LLM |
| `dbb`       | 5435        | PostgreSQL 15                             |
| `redis`     | 6379        | Broker Celery + cache résultats           |
| `nginx`     | 80 / 443    | Reverse proxy global                      |

Variables d'environnement requises : `GROQ_API_KEY`, `REACT_APP_API_TOKEN`.

---

## Frontend (`restitution_ui/`)

**Stack :** React 18, TypeScript, React Hook Form, Zod, TanStack Query, Tailwind CSS, Radix UI, Chart.js, React-Leaflet.

### Pages principales

| Fichier                   | Rôle                                          |
|---------------------------|-----------------------------------------------|
| `pages/Restitution.tsx`   | Liste et consultation des restitutions        |
| `pages/AddForm.tsx`       | Formulaire de création                        |
| `pages/UpdateForm.tsx`    | Formulaire d'édition                          |
| `pages/DuplicateForm.tsx` | Duplication d'une restitution                 |
| `pages/Visualisation.tsx` | Rendu final (tableau, graphique, carte, LLM)  |

### Gestion du formulaire

Le formulaire utilise **React Hook Form** avec `FormProvider`. Tous les sous-composants accèdent à l'état via `useFormContext()`.

Champs clés du formulaire (`schema.tsx`) :
- `nom` — nom de la restitution
- `formats_selected` — sources de données (formats)
- `affichages` — type d'affichage (un seul)
- `llmmodeles` — modèle LLM (un seul)
- `champs` — champs/colonnes à afficher (`ChampsAVC[]`)
- `operation_selected` — opérations configurées
- `jointures` — jointures entre formats
- `filtres_pop` — filtres de population

### Composants contextuels (`src/context/`)

| Dossier          | Rôle                                                              |
|------------------|-------------------------------------------------------------------|
| `affichages/`    | Sélecteur du type d'affichage                                     |
| `llmmodeles/`    | Sélecteur du modèle LLM                                           |
| `champs/`        | Sélecteur et gestion des champs à afficher                        |
| `operations/`    | Constructeur d'opérations (GROUP BY, arithmétique, etc.)          |
| `formats/`       | Sélecteur des sources de données                                  |
| `jointures/`     | Gestion des jointures                                             |
| `filtrePop/`     | Gestion des filtres de population                                 |
| `aggregations/`  | Sélecteur d'agrégations                                           |

### Type `ChampsAVC` (champ configuré)

```typescript
type ChampsAVC = {
  nom: string | null;
  as_nom: string | null;
  type: string | null;        // voir types ci-dessous
  typeAttribut: string | null;
  position?: number | null;
  taille?: number | null;
  separateur?: string | null;
  parametre?: string | number | null;
  transformation: { /* mêmes champs que ci-dessus */ };
};
```

Types de champs (`transformation.type`) :
- `"none"` — attribut sélectionné tel quel
- `"extract"` — extraction (position + taille)
- `"concat"` — concaténation (séparateur + paramètre)
- `"AxesX"` / `"AxesY"` — axe X ou Y pour graphiques
- `"maps"` / `"lat"` / `"lon"` — champs cartographiques
- `"manual"` — champ saisi manuellement
- `"op_*"` — champ généré par une opération configurée

### Affichage conditionnel des champs

Le composant `Champ.tsx` rend un sous-composant différent selon le type d'affichage (`nomAffichage`) :

| Type d'affichage                              | Composant rendu       |
|-----------------------------------------------|-----------------------|
| Tableau simple, Tableau croisée dynamique     | `ChampTables`         |
| Histogramme, Graphique en barres, Graphique linéaire | `ChampsAxesContent` |
| Diagramme circulaire, Diagramme en secteurs   | `ChampsCircles`       |
| Cartographie circulaires, Cartographie à barres | `ChampsMaps`        |

### Génération des champs "op_"

Quand une opération est finalisée (`GroupByProcess.tsx`, `OperationArthmProcess.tsx`), un champ de type `"op_"` est automatiquement ajouté à `champs`. Ces champs sont liés à une opération — ils ne peuvent pas être supprimés manuellement tant que l'opération existe.

---

## Backend (`api_restitution/`)

**Stack :** Django 4+, Django REST Framework, Celery, Redis, PostgreSQL.

- Migrations gérées par Django (`python manage.py migrate`)
- API REST exposée sur `/api/`
- Tâches asynchrones Celery pour appels LLM (Groq)
- CORS activé (configurable via `CORS_ALLOW_ALL_ORIGINS`)

---

## Commandes utiles

```bash
# Démarrer tous les services
docker compose up -d

# Logs d'un service
docker compose logs -f backendd

# Rebuild après modif
docker compose up -d --build

# Migrations Django
docker compose exec backendd python manage.py migrate

# Frontend dev local
cd restitution_ui && npm start
```

---

## Points d'attention

- **Ne pas filtrer `champs` lors du changement d'affichage ou de modèle LLM.** Les champs générés par les opérations (`op_*`) doivent toujours être préservés. Voir `Affichage.tsx` et `Llmmodele.tsx`.
- Le champ `champs` est partagé entre toutes les sous-vues — ne jamais le réinitialiser sauf action explicite de l'utilisateur (bouton "X").
- Les champs liés à des opérations (`operation_selected.some(op => op.as_nom === champ.as_nom)`) sont protégés contre la suppression dans `Champ.tsx`.
- `GROQ_API_KEY` doit être défini dans l'environnement pour les fonctionnalités LLM.
