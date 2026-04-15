#!/bin/bash
set -e

echo "==> Waiting for database..."
while ! python -c "
import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings_mobile'
django.setup()
from django.db import connection
connection.ensure_connection()
" 2>/dev/null; do
    echo "    Database not ready, retrying in 2s..."
    sleep 2
done
echo "==> Database is ready."

echo "==> Running migrations..."
python manage.py makemigrations --settings=backend.settings_mobile --noinput
python manage.py migrate --settings=backend.settings_mobile --noinput

echo "==> Collecting static files..."
python manage.py collectstatic --settings=backend.settings_mobile --noinput 2>/dev/null || true

echo "==> Installing PostGIS tile function..."
python manage.py create_tile_function --settings=backend.settings_mobile 2>/dev/null || true

echo "==> Creating superuser (if not exists)..."
python -c "
import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings_mobile'
django.setup()
from django.contrib.auth.models import User
username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@terestria.com')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin')
if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
    print(f'    Superuser \"{username}\" created.')
else:
    print(f'    Superuser \"{username}\" already exists.')
"

echo "==> Seeding sample data (if empty)..."
python -c "
import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings_mobile'
django.setup()
from mobileadmin.models import Project
if Project.objects.count() == 0:
    from django.core.management import call_command
    call_command('seed_mobile_data')
    print('    Sample data seeded.')
else:
    print('    Data already exists, skipping seed.')
"

echo "==> Starting nginx..."
nginx

echo "==> Starting gunicorn on :8000..."
exec gunicorn backend.wsgi:application \
    --bind 127.0.0.1:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
