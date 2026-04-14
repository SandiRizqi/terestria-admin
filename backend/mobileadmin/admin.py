from django.contrib import admin
from .models import (
    Project, ProjectGroup, GeoData, SyncLog,
    MobileAppVersion, FCMToken, TMSLayer, MobileNotification,
    AdminSettings,
)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'mobile_id', 'geometry_type', 'is_active', 'created_by', 'created_at']
    list_filter = ['geometry_type', 'is_active', 'is_deleted']
    search_fields = ['name', 'description', 'mobile_id']
    filter_horizontal = ['collectors']
    readonly_fields = ['created_at', 'updated_at', 'synced_at']


@admin.register(ProjectGroup)
class ProjectGroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'geometry_type', 'is_active', 'created_by', 'created_at']
    list_filter = ['geometry_type', 'is_active', 'is_deleted']
    search_fields = ['name', 'description']
    filter_horizontal = ['projects', 'access_by']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(GeoData)
class GeoDataAdmin(admin.ModelAdmin):
    list_display = ['mobile_id', 'project', 'collected_by', 'is_deleted', 'created_at']
    list_filter = ['is_deleted', 'project__geometry_type']
    search_fields = ['mobile_id', 'search_text']
    readonly_fields = ['synced_at', 'geom', 'geom_3857', 'search_text', 'search_vector']


@admin.register(SyncLog)
class SyncLogAdmin(admin.ModelAdmin):
    list_display = ['sync_type', 'status', 'user', 'items_count', 'created_at']
    list_filter = ['sync_type', 'status']
    search_fields = ['project_mobile_id', 'geodata_mobile_id']
    readonly_fields = ['created_at']


@admin.register(MobileAppVersion)
class MobileAppVersionAdmin(admin.ModelAdmin):
    list_display = ['version', 'version_code', 'is_mandatory', 'is_active', 'download_count', 'released_at']
    list_filter = ['is_active', 'is_mandatory']
    search_fields = ['version', 'release_notes']
    readonly_fields = ['released_at', 'download_count', 'created_at', 'updated_at']


@admin.register(FCMToken)
class FCMTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'device_name', 'platform', 'is_active', 'updated_at']
    list_filter = ['platform', 'is_active']
    search_fields = ['user__username', 'device_name', 'device_id']
    readonly_fields = ['created_at', 'updated_at', 'last_used_at']


@admin.register(TMSLayer)
class TMSLayerAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'owner', 'min_zoom', 'max_zoom', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(AdminSettings)
class AdminSettingsAdmin(admin.ModelAdmin):
    list_display = ['app_name', 'primary_color', 'sidebar_color']

    def has_add_permission(self, request):
        return not AdminSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(MobileNotification)
class MobileNotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_at']
    search_fields = ['title', 'body']
    filter_horizontal = ['receivers']
    readonly_fields = ['created_at', 'updated_at']
