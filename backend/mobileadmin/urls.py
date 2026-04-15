from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet, ProjectGroupViewSet, GeoDataViewSet,
    SyncLogViewSet, MobileAppVersionViewSet, FCMTokenViewSet,
    TMSLayerViewSet, MobileNotificationViewSet,
    UserManagementViewSet, GroupViewSet, PermissionViewSet,
    AdminSettingsViewSet, AuditLogViewSet,
    GeoDataCommentViewSet, TaskViewSet,
    vector_tile, tile_proxy, me, dashboard_analytics, spatial_query,
)

router = DefaultRouter()
router.register('projects', ProjectViewSet, basename='project')
router.register('project-groups', ProjectGroupViewSet, basename='project-group')
router.register('geodata', GeoDataViewSet, basename='geodata')
router.register('sync-logs', SyncLogViewSet, basename='sync-log')
router.register('app-versions', MobileAppVersionViewSet, basename='app-version')
router.register('fcm-tokens', FCMTokenViewSet, basename='fcm-token')
router.register('tms-layers', TMSLayerViewSet, basename='tms-layer')
router.register('notifications', MobileNotificationViewSet, basename='notification')
router.register('users', UserManagementViewSet, basename='user')
router.register('groups', GroupViewSet, basename='group')
router.register('permissions', PermissionViewSet, basename='permission')
router.register('admin-settings', AdminSettingsViewSet, basename='admin-settings')
router.register('geodata-comments', GeoDataCommentViewSet, basename='geodata-comment')
router.register('tasks', TaskViewSet, basename='task')
router.register('audit-logs', AuditLogViewSet, basename='audit-log')

urlpatterns = [
    path('', include(router.urls)),
    path('me/', me, name='me'),
    path('analytics/dashboard/', dashboard_analytics, name='dashboard-analytics'),
    path('spatial-query/', spatial_query, name='spatial-query'),
    path('tiles/<int:z>/<int:x>/<int:y>.pbf', vector_tile, name='vector-tile'),
    path('proxy', tile_proxy, name='tile-proxy'),
]
