# Terestria Admin — API Documentation

## Base URL

```
Production: http://portal-gis.tap-agri.com/api/
Local:      http://localhost:8000/api/
```

---

## Authentication

### Token Authentication (DRF)

```
POST /api/api-token-auth/
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
GET /api/me/
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
  "permissions": ["add_project", "change_project", ...]
}
```

---

## Projects

```
GET    /api/projects/
POST   /api/projects/
GET    /api/projects/{id}/
GET    /api/projects/{mobile_id}/
PUT    /api/projects/{id}/
PATCH  /api/projects/{id}/
DELETE /api/projects/{id}/
```

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
| `page` | integer | Page number (for pagination) |
| `page_size` | integer | Items per page (default 20, max 100) |

**Response (200):**
```json
{
  "count": 42,
  "next": "http://localhost:8000/api/projects/?page=2",
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
GET /api/projects/550e8400-e29b-41d4-a716-446655440000/
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
PATCH /api/projects/{id}/
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
PATCH /api/projects/{id}/
```

**Request:**
```json
{
  "is_deleted": true
}
```

> **Note:** Soft delete via `is_deleted: true`. Tidak menghapus record dari database.

---

## Project Groups

```
GET    /api/project-groups/
POST   /api/project-groups/
GET    /api/project-groups/{id}/
PUT    /api/project-groups/{id}/
PATCH  /api/project-groups/{id}/
DELETE /api/project-groups/{id}/
```

### List Project Groups

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by name, description |
| `geometry_type` | string | Filter: `point`, `line`, `polygon` |
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
      "geometry_type": "point",
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
  "geometry_type": "polygon",
  "json_template": {
    "formFields": [
      {"label": "Area Name", "type": "text", "required": true}
    ]
  },
  "access_by": [1, 2, 3],
  "is_active": true
}
```

---

## GeoData

```
GET    /api/geodata/
POST   /api/geodata/
GET    /api/geodata/{id}/
PUT    /api/geodata/{id}/
PATCH  /api/geodata/{id}/
DELETE /api/geodata/{id}/
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
  ],
  "collected_by": 2
}
```

### Update GeoData

```
PATCH /api/geodata/{id}/
```

**Request:**
```json
{
  "form_data": {
    "plant_height": 55.0,
    "notes": "Updated after verification"
  },
  "approval_status": "approved"
}
```

---

## GeoData Actions

### Export GeoData

```
GET /api/geodata/export/
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
GET /api/geodata/export/?format=csv&project=550e8400-e29b-41d4-a716-446655440000
```

**Response:** File download (CSV, GeoJSON, atau ZIP/Shapefile)

---

### Import GeoData

```
POST /api/geodata/import_data/
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
curl -X POST http://localhost:8000/api/geodata/import_data/ \
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
POST /api/geodata/bulk_delete/
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
POST /api/geodata/bulk_update/
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
POST /api/geodata/{id}/submit_for_review/
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
POST /api/geodata/{id}/approve/
```

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
POST /api/geodata/{id}/reject/
```

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
GET /api/geodata/statistics/
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_id` | integer | No | Get stats for specific project |

**Response (200):**
```json
{
  "total": 1024,
  "approved": 800,
  "rejected": 50,
  "draft": 174,
  "review": 0,
  "by_project": {
    "1": {"total": 500, "approved": 400, "rejected": 20},
    "2": {"total": 524, "approved": 400, "rejected": 30}
  },
  "by_collector": {
    "2": {"total": 300, "approved": 250, "rejected": 10},
    "3": {"total": 200, "approved": 150, "rejected": 5}
  }
}
```

---

## GeoData Comments

```
GET    /api/geodata-comments/
POST   /api/geodata-comments/
GET    /api/geodata-comments/{id}/
PUT    /api/geodata-comments/{id}/
PATCH  /api/geodata-comments/{id}/
DELETE /api/geodata-comments/{id}/
```

### List Comments

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `geodata` | integer | Filter by geodata ID |
| `user` | integer | Filter by user ID |

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
GET    /api/tasks/
POST   /api/tasks/
GET    /api/tasks/{id}/
PUT    /api/tasks/{id}/
PATCH  /api/tasks/{id}/
DELETE /api/tasks/{id}/
```

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
GET /api/sync-logs/
```

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
GET    /api/app-versions/
POST   /api/app-versions/
GET    /api/app-versions/{id}/
PUT    /api/app-versions/{id}/
PATCH  /api/app-versions/{id}/
DELETE /api/app-versions/{id}/
```

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
GET    /api/fcm-tokens/
POST   /api/fcm-tokens/
GET    /api/fcm-tokens/{id}/
PUT    /api/fcm-tokens/{id}/
PATCH  /api/fcm-tokens/{id}/
DELETE /api/fcm-tokens/{id}/
```

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

---

## TMS Layers

```
GET    /api/tms-layers/
POST   /api/tms-layers/
GET    /api/tms-layers/{id}/
PUT    /api/tms-layers/{id}/
PATCH  /api/tms-layers/{id}/
DELETE /api/tms-layers/{id}/
```

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
GET    /api/notifications/
POST   /api/notifications/
GET    /api/notifications/{id}/
PUT    /api/notifications/{id}/
PATCH  /api/notifications/{id}/
DELETE /api/notifications/{id}/
```

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
GET    /api/users/
POST   /api/users/
GET    /api/users/{id}/
PUT    /api/users/{id}/
PATCH  /api/users/{id}/
DELETE /api/users/{id}/
```

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
      "user_permissions": [1, 2, 3, ...],
      "permission_names": ["add_project", "change_project", ...]
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
PATCH /api/users/{id}/
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
GET    /api/groups/
POST   /api/groups/
GET    /api/groups/{id}/
PUT    /api/groups/{id}/
PATCH  /api/groups/{id}/
DELETE /api/groups/{id}/
```

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
      "permission_names": ["add_project", "change_project", ...],
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
GET /api/permissions/
```

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
GET    /api/admin-settings/
PUT    /api/admin-settings/{id}/
PATCH  /api/admin-settings/{id}/
```

### Get Settings

**Response (200):**
```json
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
```

### Update Settings

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
GET /api/audit-logs/
```

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

---

## Analytics / Dashboard

```
GET /api/analytics/dashboard/
```

### Dashboard Statistics

**Response (200):**
```json
{
  "total_projects": 42,
  "active_projects": 38,
  "total_geodata": 15000,
  "geodata_this_month": 500,
  "total_users": 25,
  "active_users": 20,
  "pending_review": 45,
  "recent_activity": [
    {
      "user": "admin",
      "action": "created",
      "model": "project",
      "object": "New Survey",
      "timestamp": "2024-06-20T10:00:00Z"
    }
  ],
  "sync_today": {
    "total": 50,
    "successful": 48,
    "failed": 2
  }
}
```

---

## Spatial Query

```
GET /api/spatial-query/
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
GET /api/spatial-query/?lng=106.8456&lat=-6.2088&radius_m=500&project_id=550e8400-e29b-41d4-a716-446655440000
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

---

## Vector Tile

```
GET /api/tiles/{z}/{x}/{y}.pbf
```

### Get Vector Tile

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `z` | integer | Zoom level (0-22) |
| `x` | integer | Tile column |
| `y` | integer | Tile row |

**Response:** Vector tile in MVT format (application/x-protobuf)

---

## Tile Proxy

```
GET /api/proxy?url=<encoded_url>
```

### Proxy External Tiles

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | URL-encoded tile URL to proxy |

**Example:**
```
GET /api/proxy?url=https%3A%2F%2Ftile.openstreetmap.org%2F10%2F163%2F395.png
```

**Response:** Tile image (PNG/JPEG) with appropriate content-type headers.

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
  "next": "http://localhost:8000/api/projects/?page=2",
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
  - `Authorization: Token <token>` atau
  - `Authorization: Bearer <access_token>`

- Semua timestamp dalam format ISO 8601 (UTC)

- Soft delete pattern: gunakan `PATCH` dengan `{"is_deleted": true}` daripada `DELETE`

- Primary key integer OR UUID mobile_id dapat digunakan untuk lookup di Project dan GeoData

- Row-level permissions diterapkan otomatis berdasarkan user dan object relationship
