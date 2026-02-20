# IRIS API - Backend Django REST & CELERY-REDIS

Ce projet est un backend Django REST API, avec CELERY & REDIS comme broker, qui est bien structuré pour la restitution de données. Il inclut une configuration de base pour le développement local, l'installation de dépendances, la gestion des environnements virtuels, et les étapes de déploiement.

---

## IRIS API - Backend Django REST

### ⚙️ Pré-requis

- Python 3.x
- Git
- Virtualenvwrapper (Windows) ou virtualenv (Linux/Mac)
- PostgreSQL (si déploiement prévu)

---

### 🧱 Structure de base

```
api_restitution/
│
├── config/           # Projet Django
├── restitution/      # App Django : restitution des données
├── requirements.txt  # Liste des dépendances
└── manage.py
```

---

### 🧪 Installation locale (Windows)

```bash
pip install virtualenvwrapper-win
mkvirtualenv iris_api
workon iris_api

# Aller dans le dossier de travail
mkdir api_restitution && cd api_restitution 

# Installer Django et DRF
pip install Django==4.2.4
pip install djangorestframework

# Créer le projet Django
django-admin startproject config .

# Créer les apps
python manage.py startapp restitutions
python manage.py startapp customUsers

# ➤ Ajouter les apps dans config/settings.py → INSTALLED_APPS

# Effectuer les migrations
python manage.py makemigrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser (name email pwd)
# (ex: trofel / trofel@gmail.com / Trofel.@#)

# Lancer le serveur
python manage.py runserver --settings=config.settings.dev
```

---

### 📦 Gérer les dépendances

```bash
# Enregistrer les dépendances installées
pip freeze > requirements.txt

# Installer les dépendances à partir du fichier
pip install -r requirements.txt
```

---

### 🐘 PostgreSQL (optionnel)

```bash
pip install psycopg
```

> 💡 Utilisation d’un service en ligne simple recommandé : [railway.app](https://railway.app)

---

### 🚀 Déploiement (basique)

```bash
pip install gunicorn
```

> Pour un déploiement complet, prévoir une configuration avec Docker ou un PaaS (Heroku, Railway, Render…).

---

### 🖥️ Cloner et exécuter le projet sur un autre ordinateur

```bash
git clone https://github.com/ton-compte/nom-du-projet.git
cd nom-du-projet

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate     # Sur Linux/Mac
# ou
workon venv                  # Sur Windows

# Installer les dépendances
pip install -r requirements.txt

# Migrer la base de données
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

---

## IRIS API - Backend CELERY & REDIS

### 🔁 Système de tâches asynchrones avec Celery & Redis

Ce projet utilise **Celery** avec **Redis** comme broker pour exécuter des tâches asynchrones (ex. : traitements en arrière-plan).

---

#### ⚙️ Installation de Celery avec Redis

```bash
workon [your_venv]
pip install "celery[redis]"
```

---

#### ▶️ Lancer le Worker Celery

Dans le répertoire `backend` :

```bash
# Sur Windows
celery -A config worker --pool=solo -l info
# ou
celery -A config worker --pool=solo --loglevel=info

# Sur Linux
celery -A config worker -l info

```

---

#### 🧱 Configuration de Redis (Broker)

##### ✅ Option 1 : via `.msi`

1. Télécharger Redis : [redis.msi (GitHub Microsoft Archive)](https://github.com/microsoftarchive/redis/releases)
2. Installer Redis
3. Lancer simplement : `redis-cli`  
   ⚠️ `redis-server` est lancé automatiquement après l'installation

##### ✅ Option 2 : via `.zip`

1. Télécharger Redis : [redis.zip (GitHub Microsoft Archive)](https://github.com/microsoftarchive/redis/releases)
2. Extraire dans un dossier personnel (ex. `C:\Users\TonNom\Redis`)
3. Ajouter le chemin du dossier extrait dans les variables d’environnement (`PATH`)
4. Ouvrir deux terminaux :
   ```bash
   redis-server
   redis-cli
   # test : ping => PONG
   ```

---

## ⚠️ Remarques importantes

- **Pare-feu** : en développement, désactivez temporairement le pare-feu réseau public sur l’hôte si l’API n’est pas accessible depuis d’autres machines du réseau local.
- **Fichier settings** : le projet utilise un fichier `config/settings/dev.py`. Assurez-vous qu'il est bien référencé avec `--settings=config.settings.dev`.

---

## ⚠️ Note for Developpers

- **Remplir la bdd** : en développement, lance cette commande dans PowerShell de Django.

```bash
python manage.py shell

from ton_app.tasks import create_dummy_restitution
create_dummy_restitution.delay()
```

---

## 📝 Auteur

- **Trofel**
- Email : trofel.2025@gmail.com

## 🔗 Frontend associé

Voir le projet [IRIS UI – Frontend React + TypeScript + Vite + TailwindCSS](../restitution-ui/README.md)
🔗 Link: ...
