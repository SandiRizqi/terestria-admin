#!/bin/bash
set -e

# ==========================================================
# 1. RUNTIME ENV REPLACEMENT FOR REACT (For Cloud Run)
# React is built statically, so it cannot read process.env at runtime by default.
# We replace placeholder values or inject window.ENV into index.html / JS files here
# before starting nginx.
# ==========================================================

echo "==> Configuring Frontend Runtime Environment..."

# Provide fallback defaults if environment variables aren't set
API_URL=${REACT_APP_API_URL:-/api}
APP_NAME=${REACT_APP_NAME:-Terestria Admin}

# Create a small env.js file that the React app can load (if you modify index.html to load it)
# Or, more commonly, just replace strings in the built static JS files:
# find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|REACT_APP_API_URL_PLACEHOLDER||g" {} +
# find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|REACT_APP_NAME_PLACEHOLDER||g" {} +

# Optional: If you want nginx to listen on a dynamic port assigned by Cloud Run:
# Cloud Run passes the PORT environment variable. Nginx needs to be configured for it.
LISTEN_PORT=${PORT:-80}
if [ "$LISTEN_PORT" != "80" ]; then
    echo "    Changing Nginx port to $LISTEN_PORT..."
    sed -i "s/listen 80;/listen $LISTEN_PORT;/g" /etc/nginx/sites-available/default
fi

# ==========================================================

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
