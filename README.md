# Terestria Admin

Sistem administrasi untuk mengelola proyek geospatial mobile mapping berbasis Django + React + Docker.

---

## 📋 Fitur Utama

### 🔐 Autentikasi & Otorisasi
- Token-based authentication (Django REST Framework)
- Role-based access control per resource
- User management dengan group permissions

### 📁 Resource Management
- **Projects** — Kelola proyek mapping dengan geometry type (point/line/polygon)
- **Project Groups** — Kelompokkan beberapa proyek
- **GeoData** — Data geospatial yang dikumpulkan di lapangan
- **TMS Layers** — Tile map service layers
- **Users & Groups** — Manajemen user dan permissions
- **Notifications** — Sistem notifikasi mobile
- **App Versions** — Management versi aplikasi mobile
- **FCM Tokens** — Firebase Cloud Messaging tokens
- **Audit Logs** — Log aktivitas untuk tracking changes
- **Tasks** — Task management untuk field workers

### ✏️ Workflow
- GeoData approval workflow: Draft → Review → Approved/Rejected
- Soft delete untuk semua resource (is_deleted flag)
- Bulk operations (bulk delete/update)

### 📊 Fitur Tambahan
- Export data: GeoJSON, CSV, Shapefile
- Import GeoData dari file CSV
- Vector tiles support
- Dashboard analytics
- Audit logging

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + React Admin + Material UI |
| Backend | Django 4 + Django REST Framework |
| Database | PostgreSQL + PostGIS |
| Container | Docker + Docker Compose |
| Auth | Token-based (DRF Auth) |

---

## 🚀 Cara Menjalankan

### Prasyarat
- Docker & Docker Compose
- PostgreSQL database dengan PostGIS extension

### Setup

**1. Clone repository**
```bash
git clone https://github.com/SandiRizqi/terestria-admin.git
cd terestria-admin
```

**2. Setup environment variables**
```bash
cp .env.example .env
```

Edit file `.env` sesuai konfigurasi database:
```env
DB_NAME=terestria_admin
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=your-db-host.rds.amazonaws.com
DB_PORT=5432
DJANGO_SECRET_KEY=your-secret-key
DJANGO_SETTINGS_MODULE=backend.settings_mobile
```

**3. Jalankan dengan Docker**
```bash
docker compose -f docker-compose-prod.yml up -d
```

Aplikasi akan tersedia di `http://localhost:3000` (atau port yang dikonfigurasi).

### Development Mode

**Tanpa Docker:**
```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000

# Frontend (di terminal lain)
cd mobile-client
npm install
npm start
```

---

## 📐 Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (React)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Projects  │  │  GeoData    │  │   Users     │  ...    │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└───────────────────────────┬────────────────────────────────┘
                            │ REST API (Token Auth)
┌───────────────────────────▼────────────────────────────────┐
│                    Backend (Django)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Views     │  │ Serializers │  │   Models    │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Filters    │  │ Permissions │  │   Audit     │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└───────────────────────────┬────────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────────┐
│              PostgreSQL + PostGIS                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Reference

Base URL: `/api/mobile/`

### Authentication
```
POST /api-token-auth/
Body: { "username": "admin", "password": "admin" }
Response: { "token": "..." }
```

### Endpoints

| Resource | CRUD | Bulk Delete | Other Actions |
|----------|------|------------|---------------|
| `/projects/` | ✅ | ✅ | — |
| `/project-groups/` | ✅ | ✅ | — |
| `/geodata/` | ✅ | ✅ | export, import, submit_for_review, approve, reject |
| `/tms-layers/` | ✅ | — | — |
| `/users/` | ✅ | — | — |
| `/groups/` | ✅ | — | — |
| `/notifications/` | ✅ | — | — |
| `/app-versions/` | ✅ | — | — |
| `/fcm-tokens/` | ✅ | — | deactivate |
| `/tasks/` | ✅ | — | — |
| `/audit-logs/` | Read-only | — | — |

### Bulk Delete Example
```
POST /api/mobile/{resource}/bulk_delete/
Body: { "ids": [1, 2, 3] }
Response: { "deleted": 3 }
```

### Export Example
```
GET /api/mobile/geodata/export/?format=geojson
GET /api/mobile/geodata/export/?format=csv
```

---

## 🗂️ Struktur Project

```
terestria-admin/
├── backend/
│   ├── backend/
│   │   ├── settings_mobile.py    # Production settings
│   │   ├── urls.py               # Root URL config
│   │   └── api_router.py         # Example app router
│   ├── mobileadmin/
│   │   ├── views.py              # All ViewSets & actions
│   │   ├── models.py             # Database models
│   │   ├── serializers.py        # DRF serializers
│   │   ├── filters.py            # Filter classes
│   │   ├── permissions.py        # Custom permissions
│   │   ├── audit.py              # Audit logging
│   │   ├── export_import.py      # Export/Import functions
│   │   ├── middleware.py         # Custom middleware
│   │   └── urls.py               # Mobile API routes
│   ├── requirements.txt
│   ├── manage.py
│   └── db.sqlite3               # Local dev database
├── mobile-client/
│   ├── src/
│   │   ├── projects/             # Project CRUD pages
│   │   ├── project-groups/       # Project Group CRUD pages
│   │   ├── geodata/             # GeoData + Approval workflow
│   │   ├── components/           # Shared components
│   │   ├── authProvider.js       # Auth logic
│   │   └── theme.js              # Material UI theme
│   ├── package.json
│   └── public/
├── docker-compose-prod.yml
├── Dockerfile
└── nginx.conf
```

---

## 🔒 Security Model

### Permissions
Setiap resource memiliki permission class tersendiri:
- `IsProjectMember` — Akses ke project tertentu
- `IsProjectGroupMember` — Akses ke project group
- `IsGeoDataProjectMember` — Akses ke geodata dari project yang join

### Soft Delete
Semua operasi delete menggunakan soft delete (`is_deleted=True`), data tidak pernah dihapus permanen kecuali melalui Django admin.

---

## 📝 Audit Logging

Semua perubahan terhadap data dicatat di `AuditLog`:
- User yang melakukan perubahan
- Jenis action (create/update/delete)
- Timestamp
- Detail perubahan

---

## 🧪 Testing

```bash
# Run Django tests
cd backend
python manage.py test

# Lint frontend
cd mobile-client
npm run lint
```

---

## 📦 Deployment

### Production Build
```bash
docker compose -f docker-compose-prod.yml build app
docker compose -f docker-compose-prod.yml up -d
```

### Environment Variables Production
Pastikan setting berikut dikonfigurasi di `.env`:
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- `DJANGO_SECRET_KEY`
- `DJANGO_SUPERUSER_USERNAME`, `DJANGO_SUPERUSER_PASSWORD`

---

## 👤 Author

**Sandi Rizqi** — [GitHub](https://github.com/SandiRizqi)

---

## 📄 License

MIT License
