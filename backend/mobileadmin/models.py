from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.contrib.gis.db import models as gis_models
from django.contrib.gis.geos import Point, LineString, Polygon
from django.contrib.postgres.fields import JSONField
from django.contrib.postgres.search import SearchVectorField, SearchVector
from django.utils import timezone


GEOMETRY_CHOICES = [
    ('point', 'Point'),
    ('line', 'Line'),
    ('polygon', 'Polygon'),
]


class Project(models.Model):
    mobile_id = models.CharField(max_length=100, unique=True, db_index=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    geometry_type = models.CharField(max_length=20, choices=GEOMETRY_CHOICES)
    form_fields = JSONField(default=list, help_text="List of form field definitions")

    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='mobile_created_projects'
    )
    collectors = models.ManyToManyField(
        User, blank=True, related_name='mobile_collected_projects',
        help_text="Users who collect data for this project"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    synced_at = models.DateTimeField(auto_now=True)

    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        db_table = 'geoform_projects'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['mobile_id']),
            models.Index(fields=['created_at']),
            models.Index(fields=['is_active', 'is_deleted']),
        ]

    def __str__(self):
        creator = self.created_by.username if self.created_by else 'unknown'
        return f"{self.name} ({self.geometry_type}) - {creator}"

    def get_form_fields_count(self):
        return len(self.form_fields) if isinstance(self.form_fields, list) else 0


class ProjectGroup(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    projects = models.ManyToManyField(
        Project, blank=True, related_name='groups',
        help_text="Projects in this group"
    )
    geometry_type = models.CharField(max_length=20, choices=GEOMETRY_CHOICES, default='point')
    json_template = JSONField(null=True, blank=True, help_text="JSON template for form validation")

    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='mobile_created_project_groups'
    )
    access_by = models.ManyToManyField(
        User, blank=True, related_name='mobile_accessed_project_groups',
        help_text="Users with access to this group"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    is_active = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)

    class Meta:
        db_table = 'geoform_project_groups'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['created_by']),
            models.Index(fields=['is_active', 'is_deleted']),
        ]

    def __str__(self):
        return self.name

    def project_count(self):
        return self.projects.count()

    def validate_project_template(self, project):
        template = self.json_template
        if not template:
            return {"valid": False, "errors": ["Template not available"]}
        if self.geometry_type != project.geometry_type:
            return {"valid": False, "errors": ["Geometry type mismatch"]}

        errors = []
        project_fields_set = {(f.get("label"), f.get("type")) for f in (project.form_fields or [])}
        for field in template.get("formFields", []):
            label = field.get("label")
            expected_type = field.get("type")
            if (label, expected_type) not in project_fields_set:
                errors.append(f"Field '{label}' with type '{expected_type}' not found in project")
        return {"valid": len(errors) == 0, "errors": errors}


class GeoData(models.Model):
    mobile_id = models.CharField(max_length=100, unique=True, db_index=True)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name='geo_data',
        to_field='mobile_id', db_column='project_mobile_id'
    )
    form_data = JSONField(default=dict, help_text="Form data from survey")
    points = JSONField(default=list, help_text="Array of {latitude, longitude, timestamp, ...}")

    collected_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='mobile_collected_geodata'
    )
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    synced_at = models.DateTimeField(auto_now=True)

    is_deleted = models.BooleanField(default=False)

    geom = gis_models.GeometryField(srid=4326, null=True, blank=True)
    geom_3857 = gis_models.GeometryField(srid=3857, null=True, blank=True)

    search_text = models.TextField(blank=True, default='')
    search_vector = SearchVectorField(null=True, blank=True)

    class Meta:
        db_table = 'geoform_geodata'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['mobile_id']),
            models.Index(fields=['project', 'created_at']),
            models.Index(fields=['collected_by']),
            models.Index(fields=['is_deleted']),
        ]

    def __str__(self):
        return f"GeoData {self.mobile_id}"

    @staticmethod
    def _extract_text_from_json(data):
        texts = []
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(key, str) and any(
                    skip in key.lower()
                    for skip in ['oss_key', 'oss_url', 'server_key', 'serverkey', 'serverurl']
                ):
                    continue
                texts.extend(GeoData._extract_text_from_json(value))
        elif isinstance(data, list):
            for item in data:
                texts.extend(GeoData._extract_text_from_json(item))
        elif isinstance(data, str) and len(data) < 500:
            stripped = data.strip()
            if stripped and not stripped.startswith(('http://', 'https://')):
                texts.append(stripped)
        elif isinstance(data, (int, float)):
            texts.append(str(data))
        return texts

    def save(self, *args, **kwargs):
        if self.points and self.project:
            coords = [(p['longitude'], p['latitude']) for p in self.points]
            if self.project.geometry_type == 'point' and coords:
                self.geom = Point(coords[0], srid=4326)
            elif self.project.geometry_type == 'line' and len(coords) >= 2:
                self.geom = LineString(coords, srid=4326)
            elif self.project.geometry_type == 'polygon' and len(coords) >= 3:
                if coords[0] != coords[-1]:
                    coords.append(coords[0])
                self.geom = Polygon(coords, srid=4326)

        if self.geom:
            try:
                self.geom_3857 = self.geom.transform(3857, clone=True)
            except Exception:
                # Fallback: store 4326 geom as-is if GDAL transform fails
                self.geom_3857 = self.geom.clone()
                self.geom_3857.srid = 3857
        else:
            self.geom_3857 = None

        if self.form_data:
            extracted = self._extract_text_from_json(self.form_data)
            self.search_text = ' '.join(extracted)
        else:
            self.search_text = ''

        super().save(*args, **kwargs)

        if self.search_text:
            GeoData.objects.filter(pk=self.pk).update(
                search_vector=SearchVector('search_text', config='simple')
            )


class SyncLog(models.Model):
    SYNC_TYPE_CHOICES = [
        ('project_upload', 'Project Upload'),
        ('project_download', 'Project Download'),
        ('geodata_upload', 'GeoData Upload'),
        ('geodata_download', 'GeoData Download'),
        ('geodata_delete', 'GeoData Delete'),
    ]
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('partial', 'Partial'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    sync_type = models.CharField(max_length=50, choices=SYNC_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    project_mobile_id = models.CharField(max_length=100, null=True, blank=True)
    geodata_mobile_id = models.CharField(max_length=100, null=True, blank=True)
    items_count = models.IntegerField(default=0)
    error_message = models.TextField(null=True, blank=True)
    request_data = JSONField(null=True, blank=True)
    device_info = JSONField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'geoform_sync_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['sync_type', 'status']),
            models.Index(fields=['project_mobile_id']),
            models.Index(fields=['geodata_mobile_id']),
        ]

    def __str__(self):
        return f"{self.sync_type} - {self.status} at {self.created_at}"


class MobileAppVersion(models.Model):
    version = models.CharField(max_length=20, unique=True, help_text="Semantic version (e.g., 1.0.0)")
    version_code = models.IntegerField(unique=True, help_text="Integer version code for comparison")
    apk_url = models.URLField(max_length=500, help_text="URL to download the APK file")
    file_size = models.BigIntegerField(null=True, blank=True, help_text="File size in bytes")
    checksum = models.CharField(max_length=64, null=True, blank=True, help_text="MD5 or SHA256 checksum")
    release_notes = models.TextField(blank=True, help_text="What's new in this version")
    is_mandatory = models.BooleanField(default=False, help_text="Force users to update")
    is_active = models.BooleanField(default=True, help_text="Available for download")
    released_at = models.DateTimeField(auto_now_add=True)
    released_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='mobile_released_versions'
    )
    download_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'mobile_app_versions'
        ordering = ['-version_code', '-released_at']
        indexes = [
            models.Index(fields=['version_code']),
            models.Index(fields=['is_active']),
            models.Index(fields=['-version_code', 'is_active']),
        ]
        verbose_name = "Mobile App Version"

    def __str__(self):
        return f"v{self.version} (code: {self.version_code})"

    def increment_download_count(self):
        self.download_count += 1
        self.save(update_fields=['download_count'])

    @classmethod
    def get_latest_version(cls):
        return cls.objects.filter(is_active=True).first()

    @classmethod
    def check_update_required(cls, current_version_code):
        latest = cls.get_latest_version()
        if not latest:
            return False, None

        update_available = latest.version_code > current_version_code
        mandatory_update = cls.objects.filter(
            version_code__gt=current_version_code,
            version_code__lte=latest.version_code,
            is_mandatory=True,
            is_active=True
        ).exists()

        return update_available, {
            'latest_version': latest.version,
            'latest_version_code': latest.version_code,
            'download_url': latest.apk_url,
            'release_notes': latest.release_notes,
            'is_mandatory': mandatory_update,
            'file_size': latest.file_size,
            'checksum': latest.checksum,
        }


class FCMToken(models.Model):
    PLATFORM_CHOICES = [
        ('android', 'Android'),
        ('ios', 'iOS'),
        ('web', 'Web'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mobile_fcm_tokens', db_index=True)
    device_id = models.CharField(max_length=255, db_index=True)
    fcm_token = models.TextField(unique=True)
    platform = models.CharField(max_length=200, choices=PLATFORM_CHOICES, default='android')
    device_name = models.CharField(max_length=255, null=True, blank=True)
    app_version = models.CharField(max_length=500, null=True, blank=True)
    os_version = models.CharField(max_length=500, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'mobile_fcm_tokens'
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['device_id', 'user']),
            models.Index(fields=['is_active', 'updated_at']),
        ]
        unique_together = [['user', 'device_id']]
        verbose_name = "FCM Token"

    def __str__(self):
        return f"{self.user.username} - {self.device_name or self.device_id[:20]}"

    def deactivate(self):
        self.is_active = False
        self.save(update_fields=['is_active', 'updated_at'])

    @classmethod
    def register_or_update_token(cls, user, fcm_token, device_id, **kwargs):
        existing_token = cls.objects.filter(fcm_token=fcm_token).first()
        if existing_token:
            existing_token.user = user
            existing_token.device_id = device_id
            existing_token.is_active = True
            for field in ['platform', 'device_name', 'app_version', 'os_version']:
                if field in kwargs:
                    setattr(existing_token, field, kwargs[field])
            existing_token.save()
            return existing_token, False

        device_token = cls.objects.filter(user=user, device_id=device_id).first()
        if device_token:
            device_token.fcm_token = fcm_token
            device_token.is_active = True
            for field in ['platform', 'device_name', 'app_version', 'os_version']:
                if field in kwargs:
                    setattr(device_token, field, kwargs[field])
            device_token.save()
            return device_token, False

        token = cls.objects.create(user=user, fcm_token=fcm_token, device_id=device_id, **kwargs)
        return token, True


class TMSLayer(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=100, unique=True, db_index=True)
    description = models.TextField(blank=True, null=True)
    owner = models.CharField(max_length=255, blank=True, default='')
    tms_url = models.CharField(max_length=500)
    base_url = models.CharField(max_length=500, default="https://portal-gis.tap-agri.com")
    min_zoom = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(24)])
    max_zoom = models.IntegerField(default=18, validators=[MinValueValidator(0), MaxValueValidator(24)])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'mobile_tms_layers'
        ordering = ['code', 'name']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['is_active', 'code']),
        ]
        verbose_name = "TMS Layer"

    def __str__(self):
        return f"{self.name} ({self.code})"

    def get_full_url(self):
        return f"{self.base_url}{self.tms_url}"

    def get_proxy_url(self, proxy_base_url):
        return f"{proxy_base_url}/api/mobile/proxy?tile={self.tms_url}"


class AdminSettings(models.Model):
    """Singleton model for admin panel configuration (theme, logo, etc.)."""
    app_name = models.CharField(max_length=255, default='Terestria Mobile Admin')
    logo_url = models.URLField(max_length=500, blank=True, default='')
    logo_image = models.ImageField(upload_to='admin_settings/', blank=True, null=True)
    primary_color = models.CharField(max_length=7, default='#388e3c', help_text="Hex color code")
    primary_dark = models.CharField(max_length=7, default='#2e7d32')
    primary_light = models.CharField(max_length=7, default='#66bb6a')
    sidebar_color = models.CharField(max_length=7, default='#1b5e20')
    accent_color = models.CharField(max_length=7, default='#4caf50')
    background_color = models.CharField(max_length=7, default='#f6faf6')
    font_family = models.CharField(max_length=255, default='Plus Jakarta Sans')
    default_map_center_lng = models.FloatField(default=110.5)
    default_map_center_lat = models.FloatField(default=-2.5)
    default_map_zoom = models.IntegerField(default=10)

    class Meta:
        db_table = 'mobile_admin_settings'
        verbose_name = 'Admin Settings'
        verbose_name_plural = 'Admin Settings'

    def __str__(self):
        return self.app_name

    def save(self, *args, **kwargs):
        # Enforce singleton — always use pk=1
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class MobileNotification(models.Model):
    title = models.CharField(max_length=255)
    body = models.TextField()
    image = models.ImageField(upload_to="mobile_notifications/", blank=True, null=True)
    data = JSONField(blank=True, null=True)
    receivers = models.ManyToManyField(FCMToken, related_name='notifications', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'mobile_notifications'
        ordering = ['-created_at']

    def __str__(self):
        return self.title
