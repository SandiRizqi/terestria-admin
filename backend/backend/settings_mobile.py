"""
Mobile admin settings — extends base settings with PostGIS and mobileadmin app.

Usage:
    python manage.py runserver --settings=backend.settings_mobile
    python manage.py migrate --settings=backend.settings_mobile
"""
import os
from .settings import *  # noqa: F401, F403

# Add GIS and mobile admin apps
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.gis',
    'django.contrib.postgres',
    'corsheaders',
    'django_filters',
    'rest_framework',
    'rest_framework.authtoken',
    'exampleapp',
    'mobileadmin',
]

# CORS middleware (before CommonMiddleware)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOW_ALL_ORIGINS = True

# Ensure Django uses UTC
USE_TZ = False
# TIME_ZONE = 'UTC'

# PostGIS database
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': os.environ.get('DB_NAME', 'terestria_admin'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'postgres'),
        'HOST': os.environ.get('DB_HOST', '127.0.0.1'),
        'PORT': os.environ.get('DB_PORT', '5433'),
        'CONN_MAX_AGE': 500,
        'OPTIONS': {
            # 'options': '-c timezone=UTC',
        },
    }
}

# Allow all hosts in Docker
ALLOWED_HOSTS = ['*']

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

# Media files (notification images)
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

# Force UTC on every new database connection
from django.db.backends.signals import connection_created


def _set_utc(sender, connection, **kwargs):
    if connection.vendor == 'postgresql':
        connection.cursor().execute("SET TIME ZONE 'UTC'")


connection_created.connect(_set_utc)

# GDAL/GEOS library paths
# On Docker/Linux these are auto-detected. Override for Windows local dev:
import platform
if platform.system() != 'Linux':
    GDAL_LIBRARY_PATH = os.environ.get('GDAL_LIBRARY_PATH', r'C:\Users\User\.conda\envs\terestria-admin\Library\bin\gdal.dll')
else:
    # Clear any Windows path from base settings
    GDAL_LIBRARY_PATH = None
