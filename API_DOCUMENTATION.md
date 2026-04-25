# Terestria Admin — API Documentation

## Base URL

```
Production: https://terestria.ruangbumi.com/api/mobile/
Local:      http://localhost:8000/api/mobile/
```

> **Catatan:** Semua mobile admin endpoint menggunakan prefix `/api/mobile/`. Auth endpoint berada di root `/api/`.

---

## Authentication

### Token Authentication (DRF)

```
POST /api-token-auth/
```

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "1f6236b8e24c7a2d9e3f4a1c8b5e6d7f3a2c1b4d"
}
```

---

### JWT Authentication

```
POST /api/token/
```

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Refresh Token

```
POST /api/token/refresh/
```

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

---

## Current User

### Get Current User Info

```
GET /api/mobile/me/
```

**Headers:** `Authorization: Token <token>` atau `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "first_name": "Admin",
  "last_name": "User",
  "is_staff": true,
  "is_superuser": true,
  "groups": ["Admin", "Manager"],
  "permissions": ["mobileadmin.add_project", "mobileadmin.change_project"]
}
```

---

## Projects

```
GET    /api/mobile/projects/
POST   /api/mobile/projects/
GET    /api/mobile/projects/{id}/
GET    /api/mobile/projects/{mobile_id}/
PUT    /api/mobile/projects/{id}/
PATCH  /api/mobile/projects/{id}/
DELETE /api/mobile/projects/{id}/
```

> **Permission:** Semua user terautentikasi dapat mengakses. Row-level permission berdasarkan `collectors` dan `created_by`.

### List Projects

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by name, description, mobile_id |
| `geometry_type` | string | Filter: `point`, `line`, `polygon` |
| `is_active` | boolean | Filter active/inactive |
| `is_deleted` | boolean | Filter deleted records |
| `created_by` | integer | Filter by creator ID |
| `ordering` | string | Sort: `name`, `-name`, `created_at`, `-created_at`, `updated_at`, `-updated_at`, `geometry_type` |
| `page` | integer | Page number |
| `page_size` | integer | Items per page (default 20, max 100) |

**Response (200):**
```json
{
  "count": 42,
  "next": "http://localhost:8000/api/mobile/projects/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "mobile_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Rice Field Survey",
      "description": "Annual rice field data collection",
      "geometry_type": "point",
      "form_fields": [
        {"label": "Plant Height", "type": "number", "required": true},
        {"label": "Photo", "type": "photo", "required": false}
      ],
      "created_by": 1,
      "created_by_username": "admin",
      "collectors": [1, 2, 3],
      "map_color": "#4CAF50",
      "created_at": "2024-01-15T08:30:00Z",
      "updated_at": "2024-06-20T14:22:00Z",
      "synced_at": "2024-06-20T14:22:00Z",
      "is_active": true,
      "is_deleted": false,
      "geodata_count": 156
    }
  ]
}
```

### Get Project by mobile_id

```
GET /api/mobile/projects/550e8400-e29b-41d4-a716-446655440000/
```

Returns same format as single project response.

### Create Project

**Request:**
```json
{
  "mobile_id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "New Project",
  "description": "Project description",
  "geometry_type": "point",
  "form_fields": [
    {"label": "Name", "type": "text", "required": true},
    {"label": "Age", "type": "number", "required": false}
  ],
  "map_color": "#2196F3",
  "is_active": true,
  "collectors": [2, 3]
}
```

### Update Project

```
PATCH /api/mobile/projects/{id}/
```

**Request (partial):**
```json
{
  "name": "Updated Project Name",
  "is_active": false
}
```

### Soft Delete Project

```
PATCH /api/mobile/projects/{id}/
```

**Request:**
```json
{
  "is_deleted": true
}
```

> **Note:** Soft delete via `is_deleted: true`. Tidak menghapus record dari database.

### Bulk Delete Projects

```
POST /api/mobile/projects/bulk_delete/
```

**Request:**
```json
{
  "ids": [1, 2, 3]
}
```

**Response (200):**
```json
{
  "deleted": 3
}
```

---

## Project Groups

```
GET    /api/mobile/project-groups/
POST   /api/mobile/project-groups/
GET    /api/mobile/project-groups/{id}/
PUT    /api/mobile/project-groups/{id}/
PATCH  /api/mobile/project-groups/{id}/
DELETE /api/mobile/project-groups/{id}/
```

### List Project Groups

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by name, description |
| `is_active` | boolean | Filter active/inactive |
| `is_deleted` | boolean | Filter deleted records |
| `ordering` | string | Sort: `name`, `-name`, `created_at`, `-created_at` |

**Response (200):**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "name": "Agriculture Projects",
      "description": "All agriculture-related surveys",
      "projects": [1, 2, 3],
      "json_template": {
        "formFields": [
          {"label": "Crop Type", "type": "dropdown", "options": ["Rice", "Corn", "Soybean"]}
        ]
      },
      "created_by": 1,
      "created_by_username": "admin",
      "access_by": [1, 2],
      "created_at": "2024-01-10T08:00:00Z",
      "updated_at": "2024-05-15T10:30:00Z",
      "is_active": true,
      "is_deleted": false,
      "project_count": 3
    }
  ]
}
```

### Create Project Group

**Request:**
```json
{
  "name": "New Group",
  "description": "Group description",
  "projects": [1, 2],
  "json_template": {
    "formFields": [
      {"label": "Area Name", "type": "text", "required": true}
    ]
  },
  "access_by": [1, 2, 3],
  "is_active": true
}
```

### Bulk Delete Project Groups

```
POST /api/mobile/project-groups/bulk_delete/
```

**Request:**
```json
{
  "ids": [1, 2, 3]
}
```

**Response (200):**
```json
{
  "deleted": 3
}
```

---

## GeoData

```
GET    /api/mobile/geodata/
POST   /api/mobile/geodata/
GET    /api/mobile/geodata/{id}/
PUT    /api/mobile/geodata/{id}/
PATCH  /api/mobile/geodata/{id}/
DELETE /api/mobile/geodata/{id}/
```

### List GeoData

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by mobile_id, search_text |
| `project` | string | Filter by project mobile_id |
| `project_id` | integer | Filter by project ID |
| `collected_by` | integer | Filter by user ID |
| `is_deleted` | boolean | Filter deleted records |
| `approval_status` | string | Filter: `draft`, `review`, `approved`, `rejected` |
| `start_date` | datetime | Filter created_at >= value |
| `end_date` | datetime | Filter created_at <= value |
| `ordering` | string | Sort: `created_at`, `-created_at`, `updated_at`, `-updated_at`, `mobile_id` |

**Response (200):**
```json
{
  "count": 1024,
  "results": [
    {
      "id": 1,
      "mobile_id": "660e8400-e29b-41d4-a716-446655440001",
      "project": "550e8400-e29b-41d4-a716-446655440000",
      "project_name": "Rice Field Survey",
      "form_data": {
        "plant_height": 45.5,
        "photo": "https://storage.example.com/photo.jpg",
        "notes": "Healthy crop"
      },
      "points": [
        {"latitude": -6.2088, "longitude": 106.8456, "timestamp": "2024-06-20T10:30:00Z"}
      ],
      "collected_by": 2,
      "collected_by_username": "field_worker",
      "approval_status": "approved",
      "reviewed_by": 1,
      "reviewed_by_username": "admin",
      "reviewed_at": "2024-06-21T08:00:00Z",
      "review_notes": "Data verified",
      "created_at": "2024-06-20T10:30:00Z",
      "updated_at": "2024-06-21T08:00:00Z",
      "synced_at": "2024-06-20T10:35:00Z",
      "is_deleted": false,
      "geom_geojson": {
        "type": "Point",
        "coordinates": [106.8456, -6.2088]
      },
      "comment_count": 2
    }
  ]
}
```

### Create GeoData

**Request:**
```json
{
  "mobile_id": "660e8400-e29b-41d4-a716-446655440002",
  "project": "550e8400-e29b-41d4-a716-446655440000",
  "form_data": {
    "plant_height": 50.2,
    "notes": "Sample data"
  },
  "points": [
    {"latitude": -6.2090, "longitude": 106.8458, "timestamp": "2024-06-22T09:00:00Z"}
  ]
}
```

### Update GeoData

```
PATCH /api/mobile/geodata/{id}/
```

**Request:**
```json
{
  "form_data": {
    "plant_height": 55.0,
    "notes": "Updated after verification"
  }
}
```

---

## GeoData Actions

### Export GeoData

```
GET /api/mobile/geodata/export/
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | No | Format: `geojson` (default), `csv`, `shapefile` |
| `project` | string | No | Filter by project mobile_id |
| `project_id` | integer | No | Filter by project ID |
| `is_deleted` | boolean | No | Include deleted records |
| `approval_status` | string | No | Filter by status |

**Example:**
```
GET /api/mobile/geodata/export/?format=csv&project=550e8400-e29b-41d4-a716-446655440000
```

**Response:** File download (CSV, GeoJSON, atau ZIP/Shapefile)

---

### Import GeoData

```
POST /api/mobile/geodata/import_data/
```

**Headers:** `Content-Type: multipart/form-data`

**Request:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | Yes | GeoJSON (.geojson, .json) or CSV (.csv) |
| `project_id` | integer | Yes | Target project ID |
| `dry_run` | boolean | No | Validate only without importing |

**Example (curl):**
```bash
curl -X POST http://localhost:8000/api/mobile/geodata/import_data/ \
  -H "Authorization: Token <token>" \
  -F "file=@data.geojson" \
  -F "project_id=1"
```

**Response (dry_run=true):**
```json
{
  "valid_count": 150,
  "error_count": 3,
  "errors": [
    {"row": 5, "error": "Missing required field 'plant_height'"},
    {"row": 12, "error": "Invalid geometry type"}
  ],
  "preview": [
    {"field1": "value1", "field2": "value2"}
  ]
}
```

**Response (after import):**
```json
{
  "imported": 150,
  "error_count": 3,
  "errors": [
    {"row": 5, "error": "Missing required field"},
    {"row": 12, "error": "Invalid geometry"}
  ]
}
```

---

### Bulk Delete

```
POST /api/mobile/geodata/bulk_delete/
```

**Request:**
```json
{
  "ids": [1, 2, 3, 4, 5]
}
```

**Response (200):**
```json
{
  "deleted": 5
}
```

> **Note:** Soft delete — set `is_deleted: true` untuk semua record.

---

### Bulk Update

```
POST /api/mobile/geodata/bulk_update/
```

**Request:**
```json
{
  "ids": [1, 2, 3],
  "data": {
    "is_deleted": true
  }
}
```

**Response (200):**
```json
{
  "updated": 3
}
```

> **Note:** Hanya field `is_deleted` yang diizinkan untuk bulk update.

---

### Submit for Review

```
POST /api/mobile/geodata/{id}/submit_for_review/
```

**Response (200):**
```json
{
  "status": "review"
}
```

---

### Approve GeoData

```
POST /api/mobile/geodata/{id}/approve/
```

> **Permission:** Staff atau superuser only.

**Request (optional):**
```json
{
  "notes": "Data verified and approved"
}
```

**Response (200):**
```json
{
  "status": "approved"
}
```

---

### Reject GeoData

```
POST /api/mobile/geodata/{id}/reject/
```

> **Permission:** Staff atau superuser only.

**Request (optional):**
```json
{
  "notes": "Data has errors, please re-collect"
}
```

**Response (200):**
```json
{
  "status": "rejected"
}
```

---

### GeoData Statistics

```
GET /api/mobile/geodata/statistics/
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_id` | integer | No | Get stats for specific project |

**Response (200):**
```json
{
  "total": 1024,
  "by_project": [
    {"project__name": "Rice Field Survey", "project__geometry_type": "point", "count": 500},
    {"project__name": "Forest Mapping", "project__geometry_type": "polygon", "count": 524}
  ],
  "by_collector": [
    {"collected_by__username": "field_worker", "count": 300},
    {"collected_by__username": "surveyor1", "count": 200}
  ]
}
```

---

## GeoData Comments

```
GET    /api/mobile/geodata-comments/
POST   /api/mobile/geodata-comments/
GET    /api/mobile/geodata-comments/{id}/
PUT    /api/mobile/geodata-comments/{id}/
PATCH  /api/mobile/geodata-comments/{id}/
DELETE /api/mobile/geodata-comments/{id}/
```

### List Comments

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `geodata` | integer | Filter by geodata ID |

**Response (200):**
```json
{
  "count": 15,
  "results": [
    {
      "id": 1,
      "geodata": 1,
      "user": 2,
      "user_username": "field_worker",
      "text": "Need to verify this point",
      "created_at": "2024-06-20T11:00:00Z",
      "updated_at": "2024-06-20T11:00:00Z"
    }
  ]
}
```

### Create Comment

**Request:**
```json
{
  "geodata": 1,
  "text": "New comment on this data point"
}
```

---

## Tasks

```
GET    /api/mobile/tasks/
POST   /api/mobile/tasks/
GET    /api/mobile/tasks/{id}/
PUT    /api/mobile/tasks/{id}/
PATCH  /api/mobile/tasks/{id}/
DELETE /api/mobile/tasks/{id}/
```

> **Permission:** Non-staff hanya melihat task yang di-assign ke mereka atau dibuat oleh mereka.

### List Tasks

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter: `pending`, `in_progress`, `completed`, `cancelled` |
| `priority` | string | Filter: `low`, `medium`, `high`, `urgent` |
| `assigned_to` | integer | Filter by assignee ID |
| `created_by` | integer | Filter by creator ID |
| `project` | integer | Filter by project ID |

**Response (200):**
```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "title": "Verify rice field data",
      "description": "Check all data from district 5",
      "assigned_to": 2,
      "assigned_to_username": "field_worker",
      "created_by": 1,
      "created_by_username": "admin",
      "project": 1,
      "project_name": "Rice Field Survey",
      "geodata": null,
      "status": "pending",
      "priority": "high",
      "due_date": "2024-06-30T00:00:00Z",
      "completed_at": null,
      "created_at": "2024-06-20T08:00:00Z",
      "updated_at": "2024-06-20T08:00:00Z"
    }
  ]
}
```

### Create Task

**Request:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "assigned_to": 2,
  "project": 1,
  "geodata": null,
  "status": "pending",
  "priority": "medium",
  "due_date": "2024-07-15T00:00:00Z"
}
```

---

## Sync Logs

```
GET /api/mobile/sync-logs/
```

> **Permission:** Non-staff hanya melihat sync log milik sendiri.

### List Sync Logs

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `sync_type` | string | Filter: `project_upload`, `project_download`, `geodata_upload`, `geodata_download`, `geodata_delete` |
| `status` | string | Filter: `success`, `failed`, `partial` |
| `user` | integer | Filter by user ID |
| `start_date` | datetime | Filter logs from this date |
| `end_date` | datetime | Filter logs until this date |

**Response (200):**
```json
{
  "count": 500,
  "results": [
    {
      "id": 1,
      "user": 2,
      "user_username": "field_worker",
      "sync_type": "geodata_upload",
      "status": "success",
      "project_mobile_id": "550e8400-e29b-41d4-a716-446655440000",
      "geodata_mobile_id": "660e8400-e29b-41d4-a716-446655440001",
      "items_count": 25,
      "error_message": null,
      "request_data": {},
      "device_info": {"platform": "android", "app_version": "2.1.0"},
      "ip_address": "192.168.1.100",
      "created_at": "2024-06-20T10:30:00Z"
    }
  ]
}
```

---

## Mobile App Versions

```
GET    /api/mobile/app-versions/
POST   /api/mobile/app-versions/
GET    /api/mobile/app-versions/{id}/
PUT    /api/mobile/app-versions/{id}/
PATCH  /api/mobile/app-versions/{id}/
DELETE /api/mobile/app-versions/{id}/
```

> **Permission:** Read untuk semua user terautentikasi. Write hanya staff/superuser.

### List Versions

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `is_active` | boolean | Filter active versions |
| `is_mandatory` | boolean | Filter mandatory updates |

**Response (200):**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "version": "2.1.0",
      "version_code": 21,
      "apk_url": "https://storage.example.com/terestria-v2.1.0.apk",
      "file_size": 52428800,
      "checksum": "md5:a1b2c3d4e5f6...",
      "release_notes": "- Bug fixes\n- Performance improvements\n- New map features",
      "is_mandatory": true,
      "is_active": true,
      "released_at": "2024-06-15T00:00:00Z",
      "released_by": 1,
      "released_by_username": "admin",
      "download_count": 150,
      "created_at": "2024-06-15T00:00:00Z",
      "updated_at": "2024-06-15T00:00:00Z"
    }
  ]
}
```

### Create Version

> **Permission:** Staff/superuser only.

**Request:**
```json
{
  "version": "2.2.0",
  "version_code": 22,
  "apk_url": "https://storage.example.com/terestria-v2.2.0.apk",
  "file_size": 55000000,
  "checksum": "md5:b2c3d4e5f6g7...",
  "release_notes": "- New feature: Offline mode\n- Bug fixes",
  "is_mandatory": false,
  "is_active": true
}
```

---

## FCM Tokens

```
GET    /api/mobile/fcm-tokens/
POST   /api/mobile/fcm-tokens/
GET    /api/mobile/fcm-tokens/{id}/
PUT    /api/mobile/fcm-tokens/{id}/
PATCH  /api/mobile/fcm-tokens/{id}/
DELETE /api/mobile/fcm-tokens/{id}/
```

> **Permission:** Non-staff hanya melihat token milik sendiri.

### List Tokens

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `user` | integer | Filter by user ID |
| `platform` | string | Filter: `android`, `ios`, `web` |
| `is_active` | boolean | Filter active tokens |

**Response (200):**
```json
{
  "count": 25,
  "results": [
    {
      "id": 1,
      "user": 2,
      "user_username": "field_worker",
      "device_id": "abc123def456",
      "fcm_token": "dGhpc2lzYXZlcnlz...",
      "platform": "android",
      "device_name": "Samsung Galaxy S21",
      "app_version": "2.1.0",
      "os_version": "Android 13",
      "is_active": true,
      "created_at": "2024-01-15T08:00:00Z",
      "updated_at": "2024-06-20T10:00:00Z",
      "last_used_at": "2024-06-20T10:00:00Z"
    }
  ]
}
```

### Register/Update Token

**Request:**
```json
{
  "user": 2,
  "device_id": "abc123def456",
  "fcm_token": "new_fcm_token_here...",
  "platform": "android",
  "device_name": "Samsung Galaxy S21",
  "app_version": "2.1.0",
  "os_version": "Android 13"
}
```

### Deactivate Token

```
POST /api/mobile/fcm-tokens/{id}/deactivate/
```

**Response (200):**
```json
{
  "status": "deactivated"
}
```

---

## TMS Layers

```
GET    /api/mobile/tms-layers/
POST   /api/mobile/tms-layers/
GET    /api/mobile/tms-layers/{id}/
PUT    /api/mobile/tms-layers/{id}/
PATCH  /api/mobile/tms-layers/{id}/
DELETE /api/mobile/tms-layers/{id}/
```

> **Permission:** Read untuk semua user terautentikasi. Write hanya staff/superuser.

### List Layers

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `is_active` | boolean | Filter active layers |

**Response (200):**
```json
{
  "count": 8,
  "results": [
    {
      "id": 1,
      "name": "OpenStreetMap",
      "code": "osm",
      "description": "Free OpenStreetMap tiles",
      "owner": "OpenStreetMap",
      "tms_url": "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      "base_url": "https://tile.openstreetmap.org/",
      "min_zoom": 0,
      "max_zoom": 19,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "full_url": "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
    }
  ]
}
```

### Create Layer

> **Permission:** Staff/superuser only.

**Request:**
```json
{
  "name": "Satellite Imagery",
  "code": "satellite",
  "description": "High resolution satellite tiles",
  "owner": "MapBox",
  "tms_url": "https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.jpg90",
  "base_url": "https://api.mapbox.com/",
  "min_zoom": 0,
  "max_zoom": 18,
  "is_active": true
}
```

---

## Notifications

```
GET    /api/mobile/notifications/
POST   /api/mobile/notifications/
GET    /api/mobile/notifications/{id}/
PUT    /api/mobile/notifications/{id}/
PATCH  /api/mobile/notifications/{id}/
DELETE /api/mobile/notifications/{id}/
```

> **Permission:** Staff/superuser only.

### List Notifications

**Response (200):**
```json
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "title": "New Update Available",
      "body": "Version 2.2.0 is now available with new features",
      "image": "https://storage.example.com/update-banner.jpg",
      "data": {"type": "app_update", "version": "2.2.0"},
      "receivers": [1, 2, 3, 4, 5],
      "created_at": "2024-06-20T08:00:00Z",
      "updated_at": "2024-06-20T08:00:00Z",
      "receiver_count": 5
    }
  ]
}
```

### Create Notification

> **Permission:** Staff/superuser only.

**Request:**
```json
{
  "title": "Scheduled Maintenance",
  "body": "System will be down for maintenance on Sunday 2AM",
  "image": null,
  "data": {"type": "maintenance"},
  "receivers": [1, 2, 3]
}
```

---

## Users (Management)

```
GET    /api/mobile/users/
POST   /api/mobile/users/
GET    /api/mobile/users/{id}/
PUT    /api/mobile/users/{id}/
PATCH  /api/mobile/users/{id}/
DELETE /api/mobile/users/{id}/
```

> **Permission:** Staff/superuser only.

### List Users

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by username, email, first_name, last_name |
| `is_active` | boolean | Filter active/inactive |
| `is_staff` | boolean | Filter staff users |
| `is_superuser` | boolean | Filter superusers |
| `groups` | integer | Filter by group ID |

**Response (200):**
```json
{
  "count": 15,
  "results": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "first_name": "Admin",
      "last_name": "User",
      "is_active": true,
      "is_staff": true,
      "is_superuser": true,
      "date_joined": "2024-01-01T00:00:00Z",
      "last_login": "2024-06-20T10:00:00Z",
      "project_count": 5,
      "groups": [1],
      "group_names": ["Admin"],
      "user_permissions": [1, 2, 3],
      "permission_names": ["add_project", "change_project"]
    }
  ]
}
```

### Create User

**Request:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "first_name": "New",
  "last_name": "User",
  "password": "securepassword123",
  "is_active": true,
  "is_staff": false,
  "is_superuser": false,
  "groups": [2],
  "user_permissions": []
}
```

### Update User

```
PATCH /api/mobile/users/{id}/
```

**Request (example - change password):**
```json
{
  "password": "newpassword456"
}
```

**Request (example - update groups):**
```json
{
  "groups": [1, 2, 3]
}
```

---

## Groups

```
GET    /api/mobile/groups/
POST   /api/mobile/groups/
GET    /api/mobile/groups/{id}/
PUT    /api/mobile/groups/{id}/
PATCH  /api/mobile/groups/{id}/
DELETE /api/mobile/groups/{id}/
```

> **Permission:** Staff/superuser only.

### List Groups

**Response (200):**
```json
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "name": "Admin",
      "permissions": [1, 2, 3, 4, 5],
      "permission_names": ["add_project", "change_project"],
      "user_count": 2
    },
    {
      "id": 2,
      "name": "Field Worker",
      "permissions": [1, 6],
      "permission_names": ["add_geodata", "view_project"],
      "user_count": 10
    }
  ]
}
```

### Create Group

**Request:**
```json
{
  "name": "Supervisor",
  "permissions": [1, 2, 3, 6, 7]
}
```

---

## Permissions

```
GET /api/mobile/permissions/
```

> **Permission:** Staff/superuser only. Hanya menampilkan permission dari app `mobileadmin` dan `auth`.

### List Permissions

**Response (200):**
```json
{
  "count": 50,
  "results": [
    {
      "id": 1,
      "name": "Can add project",
      "codename": "add_project",
      "content_type": 5,
      "content_type_name": "mobileadmin.project"
    }
  ]
}
```

---

## Admin Settings

```
GET   /api/mobile/admin-settings/
PUT   /api/mobile/admin-settings/{id}/
PATCH /api/mobile/admin-settings/{id}/
```

> **Permission:** Read untuk semua user terautentikasi. Write hanya staff/superuser.

> **Note:** Settings adalah singleton — selalu ada tepat satu record.

### Get Settings

**Response (200):**
```json
{
  "count": 1,
  "results": [
    {
      "id": 1,
      "app_name": "Terestria Admin",
      "logo_url": "https://storage.example.com/logo.png",
      "logo_image": null,
      "logo_image_url": "https://storage.example.com/logo.png",
      "primary_color": "#2196F3",
      "primary_dark": "#1976D2",
      "primary_light": "#BBDEFB",
      "sidebar_color": "#263238",
      "accent_color": "#FF5722",
      "background_color": "#FAFAFA",
      "font_family": "Roboto, sans-serif",
      "default_map_center_lng": 106.8456,
      "default_map_center_lat": -6.2088,
      "default_map_zoom": 10
    }
  ]
}
```

### Update Settings

```
PATCH /api/mobile/admin-settings/{id}/
```

> **Permission:** Staff/superuser only.

**Request:**
```json
{
  "app_name": "Terestria GIS",
  "primary_color": "#4CAF50",
  "default_map_center_lng": 107.0,
  "default_map_center_lat": -6.5,
  "default_map_zoom": 8
}
```

---

## Audit Logs

```
GET /api/mobile/audit-logs/
```

> **Permission:** Non-staff hanya melihat log milik sendiri.

### List Audit Logs

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `user` | integer | Filter by user ID |
| `action` | string | Filter: `create`, `update`, `delete`, `status_change` |
| `model_name` | string | Filter by model (e.g., `project`, `geodata`) |
| `object_id` | integer | Filter by object ID |
| `start_date` | datetime | Filter from date |
| `end_date` | datetime | Filter until date |

**Response (200):**
```json
{
  "count": 1000,
  "results": [
    {
      "id": 1,
      "user": 1,
      "user_username": "admin",
      "action": "create",
      "model_name": "project",
      "object_id": 1,
      "object_repr": "Rice Field Survey",
      "changes": {
        "name": {"new": "Rice Field Survey"},
        "geometry_type": {"new": "point"}
      },
      "ip_address": "192.168.1.100",
      "created_at": "2024-06-20T10:00:00Z"
    }
  ]
}
```

### Recent Activity

```
GET /api/mobile/audit-logs/recent_activity/
```

Returns last 50 audit log entries (filtered by user permission).

**Response:** Same format as list, max 50 items.

### Record History

```
GET /api/mobile/audit-logs/record_history/?model_name=project&object_id=1
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model_name` | string | Yes | Model name (e.g., `project`, `geodata`) |
| `object_id` | integer | Yes | Object ID |

**Response:** Same format as list, filtered to that specific record.

---

## Analytics / Dashboard

```
GET /api/mobile/analytics/dashboard/
```

### Dashboard Statistics

**Response (200):**
```json
{
  "geodata_by_project": [
    {"project__name": "Rice Field Survey", "count": 500},
    {"project__name": "Forest Mapping", "count": 300}
  ],
  "geodata_by_collector": [
    {"collected_by__username": "field_worker", "count": 300},
    {"collected_by__username": "surveyor1", "count": 200}
  ],
  "geodata_by_date": [
    {"date": "2024-06-01", "count": 25},
    {"date": "2024-06-02", "count": 30}
  ],
  "geodata_by_geometry": [
    {"project__geometry_type": "point", "count": 800},
    {"project__geometry_type": "polygon", "count": 224}
  ],
  "sync_activity": [
    {"date": "2024-06-01", "status": "success", "count": 48},
    {"date": "2024-06-01", "status": "failed", "count": 2}
  ],
  "recent_activity": [
    {
      "id": 1,
      "user": 1,
      "user_username": "admin",
      "action": "create",
      "model_name": "project",
      "object_repr": "New Survey",
      "created_at": "2024-06-20T10:00:00Z"
    }
  ]
}
```

> **Note:** `geodata_by_date` menampilkan data 30 hari terakhir. `recent_activity` menampilkan 20 log terakhir. Data geodata difilter sesuai permission user.

---

## Spatial Query

```
GET /api/mobile/spatial-query/
```

### Radius Search

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lng` | float | Yes | Longitude of center point |
| `lat` | float | Yes | Latitude of center point |
| `radius_m` | float | No | Radius in meters (default: 1000) |
| `project_id` | string | No | Filter by project mobile_id |

**Example:**
```
GET /api/mobile/spatial-query/?lng=106.8456&lat=-6.2088&radius_m=500&project_id=550e8400-e29b-41d4-a716-446655440000
```

**Response (200):**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [106.8460, -6.2090]
      },
      "properties": {
        "id": 1,
        "mobile_id": "660e8400-e29b-41d4-a716-446655440001",
        "project_name": "Rice Field Survey",
        "collected_by": "field_worker",
        "approval_status": "approved",
        "created_at": "2024-06-20T10:30:00Z"
      }
    }
  ],
  "total": 1,
  "center": [106.8456, -6.2088],
  "radius_m": 500
}
```

> **Note:** Maksimal 500 hasil. Row-level permission diterapkan otomatis.

---

## Vector Tile

```
GET /api/mobile/tiles/{z}/{x}/{y}.pbf
```

### Get Vector Tile

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `z` | integer | Zoom level (0-22) |
| `x` | integer | Tile column |
| `y` | integer | Tile row |

**Query Parameters (salah satu wajib):**

| Parameter | Type | Description |
|-----------|------|-------------|
| `project_id` | string | mobile_id dari satu project |
| `group_id` | integer | ID dari ProjectGroup |

**Example:**
```
GET /api/mobile/tiles/10/819/512.pbf?project_id=550e8400-e29b-41d4-a716-446655440000
GET /api/mobile/tiles/10/819/512.pbf?group_id=1
```

**Response:** Vector tile dalam format MVT (application/x-protobuf)

> **Note:** Cache-Control: public, max-age=3600. Row-level permission diterapkan berdasarkan project access.

---

## Tile Proxy

```
GET /api/mobile/proxy?tile=<tile_path>
```

### Proxy External Tiles

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tile` | string | Yes | Path tile relatif dari `portal-gis.tap-agri.com` |

**Example:**
```
GET /api/mobile/proxy?tile=/tms/tile/geoportal/fu_ebl_2025/+4326/10/819/512.png
```

**Response:** Tile image (PNG/JPEG) dengan content-type headers dari sumber.

---

## Error Responses

### 400 Bad Request

```json
{
  "detail": "Error message",
  "field_name": ["Error details"]
}
```

### 401 Unauthorized

```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden

```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found

```json
{
  "detail": "Not found."
}
```

### 500 Server Error

```json
{
  "detail": "Internal server error."
}
```

---

## Pagination

Default page size: **20 items**

Custom page size: `?page_size=50` (max 100)

### Pagination Response Format

```json
{
  "count": 100,
  "next": "http://localhost:8000/api/mobile/projects/?page=2",
  "previous": null,
  "results": [...]
}
```

---

## Filtering Syntax

All list endpoints support Django Filter syntax:

| Example | Description |
|---------|-------------|
| `?is_active=true` | Boolean filter |
| `?geometry_type=point` | Exact match |
| `?created_at__gte=2024-01-01` | Greater than or equal |
| `?created_at__lte=2024-12-31` | Less than or equal |
| `?name__contains=survey` | Case-insensitive contains |
| `?id__in=1,2,3` | IN filter |

---

## Notes

- Semua endpoint (kecuali `/api-token-auth/`, `/api/token/`, `/api/token/refresh/`) memerlukan authentication token di header:
  - `Authorization: Token <token>` — Token DRF
  - `Authorization: Bearer <access_token>` — JWT

- Semua timestamp dalam format ISO 8601 (UTC)

- **Soft delete** (Projects, ProjectGroups, GeoData): gunakan `PATCH` dengan `{"is_deleted": true}` daripada `DELETE`

- **Hard delete** (Users, Groups, Tasks, Notifications, FCMTokens, TMSLayers, AppVersions): gunakan `DELETE`

- Primary key integer OR UUID mobile_id dapat digunakan untuk lookup di Project dan GeoData

- Row-level permission diterapkan otomatis berdasarkan `collectors` / `created_by` / `access_by` relationship
