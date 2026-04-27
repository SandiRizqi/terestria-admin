# ============================================================
# Stage 1: Build React frontend
# ============================================================
FROM node:18-alpine AS frontend-build

WORKDIR /frontend

COPY mobile-client/package.json mobile-client/package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY mobile-client/public ./public
COPY mobile-client/src ./src

# Copy .env file if it exists (the brackets [v] acts as a wildcard trick so it won't fail if missing)
COPY mobile-client/.en[v]* ./

ENV NODE_OPTIONS="--max-old-space-size=4096 --openssl-legacy-provider"

# At build time, we inject placeholder or build-time variables if needed,
# though runtime variables will override these in Cloud Run via entrypoint replacement if configured
RUN npx react-scripts build

# ============================================================
# Stage 2: Production - Python + nginx + gunicorn
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

# Copy React build -> nginx html root
COPY --from=frontend-build /frontend/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/sites-available/default

# Copy entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Collect static files at build time (using dummy DB settings if needed)
# Because we renamed API static URL to /django-static/ in settings and nginx,
# they no longer conflict with React's /static/ files
RUN python manage.py collectstatic --noinput 2>/dev/null || true

# Explicitly expose port (Cloud Run defaults to 8080, but respects EXPOSE / PORT env var)
ENV PORT=80
EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
