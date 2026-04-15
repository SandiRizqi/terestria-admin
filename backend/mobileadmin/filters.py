import django_filters
from .models import (
    Project, ProjectGroup, GeoData, SyncLog,
    MobileAppVersion, FCMToken, TMSLayer, MobileNotification,
    AuditLog, Task,
)


class ProjectFilter(django_filters.FilterSet):
    geometry_type = django_filters.CharFilter()
    is_active = django_filters.BooleanFilter()
    is_deleted = django_filters.BooleanFilter()
    created_by = django_filters.NumberFilter()

    class Meta:
        model = Project
        fields = ['geometry_type', 'is_active', 'is_deleted', 'created_by']


class ProjectGroupFilter(django_filters.FilterSet):
    is_active = django_filters.BooleanFilter()
    is_deleted = django_filters.BooleanFilter()
    geometry_type = django_filters.CharFilter()

    class Meta:
        model = ProjectGroup
        fields = ['is_active', 'is_deleted', 'geometry_type']


class GeoDataFilter(django_filters.FilterSet):
    project = django_filters.CharFilter(field_name='project__mobile_id')
    project_id = django_filters.NumberFilter(field_name='project__id')
    collected_by = django_filters.NumberFilter()
    is_deleted = django_filters.BooleanFilter()
    approval_status = django_filters.CharFilter()
    start_date = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    end_date = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = GeoData
        fields = ['project', 'project_id', 'collected_by', 'is_deleted', 'approval_status', 'start_date', 'end_date']


class SyncLogFilter(django_filters.FilterSet):
    sync_type = django_filters.CharFilter()
    status = django_filters.CharFilter()
    user = django_filters.NumberFilter()
    start_date = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    end_date = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = SyncLog
        fields = ['sync_type', 'status', 'user', 'start_date', 'end_date']


class MobileAppVersionFilter(django_filters.FilterSet):
    is_active = django_filters.BooleanFilter()
    is_mandatory = django_filters.BooleanFilter()

    class Meta:
        model = MobileAppVersion
        fields = ['is_active', 'is_mandatory']


class FCMTokenFilter(django_filters.FilterSet):
    user = django_filters.NumberFilter()
    platform = django_filters.CharFilter()
    is_active = django_filters.BooleanFilter()

    class Meta:
        model = FCMToken
        fields = ['user', 'platform', 'is_active']


class TMSLayerFilter(django_filters.FilterSet):
    is_active = django_filters.BooleanFilter()

    class Meta:
        model = TMSLayer
        fields = ['is_active']


class TaskFilter(django_filters.FilterSet):
    status = django_filters.CharFilter()
    priority = django_filters.CharFilter()
    assigned_to = django_filters.NumberFilter()
    created_by = django_filters.NumberFilter()
    project = django_filters.NumberFilter(field_name='project__id')

    class Meta:
        model = Task
        fields = ['status', 'priority', 'assigned_to', 'created_by', 'project']


class AuditLogFilter(django_filters.FilterSet):
    user = django_filters.NumberFilter()
    action = django_filters.CharFilter()
    model_name = django_filters.CharFilter()
    object_id = django_filters.CharFilter()
    start_date = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    end_date = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = AuditLog
        fields = ['user', 'action', 'model_name', 'object_id', 'start_date', 'end_date']
