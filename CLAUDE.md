# CLAUDE.md — IRIS Restitution Platform

## Project Overview

**IRIS Restitution** is a data query, analysis, and visualization platform. Users build complex data queries through a visual interface; a Django backend executes them (using a custom Lark grammar), processes results with Pandas/GeoPandas, optionally enriches them with an LLM (Groq), and returns structured data for rendering in React (tables, charts, maps, exports).

---

## Architecture

```
React Frontend (TypeScript)
    ↓ Axios / REST
Nginx (reverse proxy — port 80/443)
    ├─ /backend/ → Django API (port 8000)
    └─ /         → React App (port 5173 in dev)

Django Backend
    ├─ PostgreSQL 15   (persistent data)
    ├─ Redis 7         (cache + Celery broker)
    └─ Celery Worker   (async task queue)
```

---

## Tech Stack

### Backend (`api_restitution/`)
| Component | Tech | Version |
|-----------|------|---------|
| Framework | Django | 4.2.4 |
| API layer | Django REST Framework | 3.15.2 |
| Auth | djangorestframework-simplejwt | latest |
| Database | PostgreSQL | 15 (alpine) |
| Task queue | Celery | 5.5.1 |
| Broker | Redis | 7 (alpine) |
| LLM | Groq API | 0.37.1 |
| Data processing | Pandas / NumPy | 2.3.0 |
| Geospatial | GeoPandas / Shapely / PyProj | 1.1.1 / 2.1.1 / 3.7.1 |
| Query parser | Lark | 1.2.2 |
| Server (prod) | Gunicorn | 23.0.0 |
| Runtime | Python | 3.11 |

### Frontend (`restitution_ui/`)
| Component | Tech | Version |
|-----------|------|---------|
| Framework | React | 18.3.1 |
| Language | TypeScript | 4.9.5 |
| Styling | TailwindCSS | 3.0.0 |
| Routing | react-router-dom | 7.6.0 |
| HTTP client | Axios | 1.9.0 |
| Server state | @tanstack/react-query | 5.76.1 |
| Forms | react-hook-form + @tanstack/react-form | 7.56.4 / 1.11.3 |
| Tables | @tanstack/react-table | 8.21.2 |
| Maps | Leaflet + react-leaflet | 1.9.4 / 4.2.1 |
| Charts | Chart.js + react-chartjs-2 | 4.4.8 / 5.3.0 |
| PDF export | jsPDF + html2canvas + pdfmake | 3.0.1 / 1.4.1 / 0.2.20 |
| Excel export | xlsx | 0.18.5 |
| UI primitives | Radix UI | various |
| Validation | Zod | 3.25.32 |
| Build tool | react-app-rewired | 2.2.1 |

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Reverse proxy:** Nginx (Alpine)
- **CI/CD:** Jenkins (local/Windows) + GitLab CI (remote/AWS EC2)

---

## Project Structure

```
Restitution_IRIS/
├── api_restitution/           # Django backend
│   ├── config/                # Django settings, URLs, Celery config, WSGI/ASGI
│   ├── restitutions/          # Core app: models, views, serializers, tasks
│   │   ├── lark/              # Custom Lark grammar for query parsing
│   │   ├── recuperation.py    # Data retrieval logic
│   │   ├── structures.py      # Data structure handling
│   │   ├── llama.py           # Groq LLM integration
│   │   └── tasks.py           # Celery async tasks
│   ├── customUsers/           # Custom user model and endpoints
│   ├── requirements.txt
│   ├── Dockerfile
│   └── build.sh               # pip install + collectstatic + migrate
│
├── restitution_ui/            # React frontend
│   ├── src/
│   │   ├── pages/             # Restitution, Visualisation, AddForm, UpdateForm, DuplicateForm
│   │   ├── components/        # forms, tables, graphs, modals, exports
│   │   ├── context/           # React contexts (affichages, aggregations, champs, filtre,
│   │   │                      #   formats, jointures, llmmodeles, operations, textes)
│   │   └── types/             # TypeScript types
│   ├── public/
│   ├── package.json
│   └── Dockerfile             # Multi-stage: Node 18 build → Nginx Alpine serve
│
├── nginx/                     # Nginx reverse proxy config + Dockerfile
├── aws_restt/                 # Production docker-compose for AWS EC2
├── docs/                      # Deployment scripts and documentation
├── logs/                      # Runtime log directory
├── Jenkinsfile                # Jenkins CI/CD pipeline
├── .gitlab-ci.yml             # GitLab CI pipeline (remote deploy)
├── docker-compose.yml         # Local development compose
└── launch_microservices.bat   # Windows helper script
```

---

## Core Domain Concepts

The backend models a structured query DSL:

| Model | Purpose |
|-------|---------|
| `Restitution` | Top-level entity: a named data query configuration |
| `Format` | Data source/table to query |
| `Jointure` | JOIN between Formats (LEFT, RIGHT, INNER, FULL) |
| `Filtre_population` | WHERE clause condition (`>`, `>=`, `<`, `<=`, `==`, `!=`, `%`) |
| `Operation` | Aggregate function or expression (avg, sum, max, min, median, percentile…) |
| `Expression` | Arithmetic expression with operators |
| `Condition` | IF / ELSE-IF / ELSE conditional logic |
| `Clause_regroupement` | GROUP BY clause |
| `Affichage` | Display/visualization settings |
| `LlmModele` | Selected Groq model for AI analysis |

**Query execution flow:**
1. User configures a `Restitution` in the UI (formats, joins, filters, operations).
2. Frontend POSTs to `lancer_traitement_restitution/` → Celery async task.
3. Backend builds SQL via the Lark grammar parser and executes it on PostgreSQL.
4. Results processed with Pandas; optionally enriched by Groq LLM (`lancer_llm_async/`).
5. Structured JSON returned to frontend for table/chart/map rendering.

---

## API Endpoints

### Authentication
```
POST /token/           # Obtain JWT (username + password)
POST /token_refresh/   # Refresh JWT
```

### Restitutions (core resource)
```
GET    /api/restitutions/                              # List (paginated, 6/page, public)
POST   /api/restitutions/                              # Create (authenticated)
GET    /api/restitutions/{id}/                         # Retrieve
PUT    /api/restitutions/{id}/                         # Full update (authenticated)
PATCH  /api/restitutions/{id}/                         # Partial update (authenticated)
DELETE /api/restitutions/{id}/                         # Delete (authenticated)
GET    /api/restitutions/{id}/get_full_data/           # Full restitution with all relations

POST   /api/restitutions/{id}/format_and_structure_table/   # Compare/format structures (async)
POST   /api/restitutions/{id}/list_formats/                 # List available formats
POST   /api/restitutions/{id}/lancer_traitement_restitution/ # Execute query (async)
POST   /api/restitutions/{id}/lancer_llm_async/             # Generate AI analysis (async)
POST   /api/restitutions/bulk_delete/                       # Delete multiple restitutions
```

### Users
```
GET    /api/users/        # List (public)
POST   /api/users/        # Create (public)
GET    /api/users/{id}/   # Retrieve
PUT    /api/users/{id}/   # Update (authenticated)
PATCH  /api/users/{id}/   # Partial update (authenticated)
```

### Admin
```
GET /admin/   # Django admin (staff only)
```

---

## Environment Variables

### Backend
| Variable | Default | Description |
|----------|---------|-------------|
| `DEBUG` | `1` | `1` dev / `0` prod |
| `SECRET_KEY` | (insecure dev key) | Django secret key |
| `POSTGRES_DB` | `iris_restitution` | Database name |
| `POSTGRES_USER` | `postgres` | DB user |
| `POSTGRES_PASSWORD` | `root` | DB password |
| `POSTGRES_HOST` | `localhost` / `dbb` (docker) | DB host |
| `POSTGRES_PORT` | `5432` | DB port |
| `REDIS_URL` | `redis://localhost:6379/0` | Celery broker |
| `REDIS_RES_URL` | `redis://localhost:6379/1` | Celery result backend |
| `GROQ_API_KEY` | — | Required for AI features |
| `CORS_ALLOW_ALL_ORIGINS` | `True` | Set `False` in prod |

### Frontend
| Variable | Description |
|----------|-------------|
| `REACT_APP_API_BASE_URL` | Backend API URL (varies by environment) |
| `REACT_APP_API_TOKEN` | Pre-generated JWT token for auth |
| `REACT_APP_API_IRIS_URL` | Secondary API endpoint (optional) |
| `REACT_APP_API_TOKEN_IRIS` | Token for secondary API (optional) |

**Environment URLs:**
- Local dev: `http://192.168.56.1:1234/api/`
- Docker dev: `http://172.20.128.1:8000/api/`
- AWS prod: `https://16.16.185.140/backend/`

---

## Running the Project

### Docker (recommended for development)
```bash
# Set required env vars
export GROQ_API_KEY="your-groq-key"
export REACT_APP_API_TOKEN="your-jwt-token"

# Build and start all services
docker compose up -d --build

# Create a Django superuser
docker exec restt-backendd-1 python manage.py createsuperuser

# Access points
# Frontend : http://localhost:5173
# Backend API: http://localhost:8000/api/
# Django admin: http://localhost:8000/admin/
```

### Backend — local Python
```bash
cd api_restitution
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000

# Celery worker (separate terminal)
celery -A config worker -P solo -l info
```

> **Note:** `-P solo` is Windows-compatible; do not use in Linux production.

### Frontend — local Node
```bash
cd restitution_ui
npm install
npm start   # http://localhost:3000
```

### Production (AWS)
```bash
docker compose -f aws_restt/docker-compose.yml pull
docker compose -f aws_restt/docker-compose.yml up -d

# Restore database
docker cp restt.sql restt-postgres:/restt.sql
docker exec -i restt-postgres psql -U postgres -d iris_restitution -f /restt.sql
```

---

## CI/CD

### Jenkins (local / Windows)
Stages: **Clone → Build → SuperUser → HealthCheck → DataLoad → DBSetup → Done**
- Credentials injected: `GROQ_API_KEY`, `REACT_APP_API_TOKEN`
- Test admin: `trofel / Trofel.@#`

### GitLab CI (remote / AWS EC2)
- Triggered on push to `main`
- Single `deploy_production` stage: SSH into EC2 → pull images → `docker compose down -v` → `docker compose up -d`
- EC2 host: `ubuntu@16.16.185.140`
- Images from: `registry.gitlab.com/...`

---

## Conventions

- **Language:** Variable and function names throughout the codebase are in **French** (`nom`, `affichage`, `restitution`, `jointure`, `filtre`, `champ`, etc.)
- **Python:** snake_case
- **TypeScript/JavaScript:** camelCase identifiers, PascalCase components
- **Pagination:** Fixed at 6 items/page
- **Async results:** Celery task IDs returned immediately; frontend polls for completion
- **File size limit:** 200 MB (`client_max_body_size` in Nginx)
- **JWT lifetime:** 365 days (dev setting — shorten for production)

---

## Known Security Issues (do not introduce more)

1. `SECRET_KEY` and DB password are hardcoded in `docker-compose.yml` — move to secrets manager for prod.
2. `CORS_ALLOW_ALL_ORIGINS = True` — restrict in production.
3. 365-day JWT lifetime — reduce for production.
4. Admin credentials visible in `Jenkinsfile` — use Jenkins credentials store.
5. `DEBUG=1` must never be deployed to production.

---

## LLM Models (Groq)

Supported models configurable per restitution via `LlmModele`:
- `qwen3-32b`
- `llama-3.3-70b-versatile`

AI analysis is triggered via `lancer_llm_async/` and runs as an async Celery task. Results are stored and returned via task polling.

---

## Geospatial Features

- **Geocoding:** Maps location names to lat/lon coordinates.
- **Natural Earth:** Country and state boundary datasets integrated via GeoPandas/PyOGRIO.
- **Frontend map:** Leaflet + react-leaflet for interactive map rendering.
- **Projection:** PyProj for coordinate reference system transformations.
