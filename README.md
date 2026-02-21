# Restitution_IRIS

## Activer le venv

C:\Users\AC2I\Envs\iris_rest\Scripts\activate

celery -A config worker -P solo -l info

python manage.py runserver 0.0.0.0:8000

## Makemigrations

python manage.py makemigrations

## Creer un SuperUser

docker exec restt-backendd-1 python -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings'); django.setup(); from django.contrib.auth import get_user_model; User = get_user_model(); user, created = User.objects.get_or_create(username='trofel', email='trofel.2025@gmail.com'); user.set_password('Trofel.@#'); user.is_superuser=True; user.is_staff=True; user.save()"

## groq

bat 'docker exec restt-backendd-1 printenv GROQ_API_KEY'
