# Restitution_IRIS

## Activer le venv

## Makemigrations

python manage.py makemigrations

## Creer un SuperUser

docker exec restt-backendd-1 python -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings'); django.setup(); from django.contrib.auth import get_user_model; User = get_user_model(); user, created = User.objects.get_or_create(username='trofel', email='trofel.2025@gmail.com'); user.set_password('Trofel.@#'); user.is_superuser=True; user.is_staff=True; user.save()"
