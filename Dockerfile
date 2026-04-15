# ============================================================
# Stage 1: Build React frontend
# ============================================================
FROM node:18-alpine AS frontend-build

WORKDIR /frontend

COPY mobile-client/package.json mobile-client/package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY mobile-client/public ./public
COPY mobile-client/src ./src
COPY mobile-client/.env ./.env

ENV NODE_OPTIONS="--max-old-space-size=4096 --openssl-legacy-provider"
RUN npx react-scripts build

# ============================================================
# Stage 2: Production — Python + nginx + gunicorn
# ============================================================
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=backend.settings_mobile

# Install system deps: GDAL + nginx
RUN apt-get update && apt-get install -y --no-install-recommends \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    libproj-dev \
    nginx \
    && rm -rf /var/lib/apt/lists/*

# Python deps
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy Django project
COPY backend/ .

# Copy React build → nginx html root
COPY --from=frontend-build /frontend/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/sites-available/default

# Copy entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Collect static files at build time
RUN python manage.py collectstatic --noinput 2>/dev/null || true

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
