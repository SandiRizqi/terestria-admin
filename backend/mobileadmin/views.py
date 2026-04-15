import json
import math
from datetime import timedelta
import requests as http_requests

from django.db import connection
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from django.http import HttpResponse, JsonResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from django.contrib.auth.models import User, Group, Permission

from .models import (
    Project, ProjectGroup, GeoData, SyncLog,
    MobileAppVersion, FCMToken, TMSLayer, MobileNotification,
    AdminSettings, AuditLog, GeoDataComment, Task,
)
from .serializers import (
    ProjectSerializer, ProjectGroupSerializer, GeoDataSerializer,
    SyncLogSerializer, MobileAppVersionSerializer, FCMTokenSerializer,
    TMSLayerSerializer, MobileNotificationSerializer,
    UserManagementSerializer, GroupSerializer, PermissionSerializer,
    AdminSettingsSerializer, AuditLogSerializer,
    GeoDataCommentSerializer, TaskSerializer,
)
from .filters import (
    ProjectFilter, ProjectGroupFilter, GeoDataFilter,
    SyncLogFilter, MobileAppVersionFilter, FCMTokenFilter,
    TMSLayerFilter, AuditLogFilter, TaskFilter,
)
from .audit import AuditMixin
from .permissions import (
    IsProjectMember, IsProjectGroupMember, IsGeoDataProjectMember,
    filter_projects_for_user, filter_project_groups_for_user,
    filter_geodata_for_user, get_accessible_project_mobile_ids,
)


# ---------------------------------------------------------------------------
# ViewSets
# ---------------------------------------------------------------------------

class ProjectViewSet(AuditMixin, viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    filterset_class = ProjectFilter
    permission_classes = [IsAuthenticated, IsProjectMember]
    search_fields = ['name', 'description', 'mobile_id']
    ordering_fields = ['name', 'created_at', 'updated_at', 'geometry_type']

    def get_queryset(self):
        qs = Project.objects.annotate(
            geodata_count=Count('geo_data')
        ).select_related('created_by').all()
        return filter_projects_for_user(qs, self.request.user)

    def get_object(self):
        """Support lookup by both integer PK and mobile_id UUID."""
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        pk = self.kwargs[lookup_url_kwarg]
        try:
            pk_int = int(pk)
            obj = self.get_queryset().get(id=pk_int)
        except (ValueError, TypeError):
            obj = self.get_queryset().get(mobile_id=pk)
        self.check_object_permissions(self.request, obj)
        return obj

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ProjectGroupViewSet(AuditMixin, viewsets.ModelViewSet):
    serializer_class = ProjectGroupSerializer
    filterset_class = ProjectGroupFilter
    permission_classes = [IsAuthenticated, IsProjectGroupMember]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']

    def get_queryset(self):
        qs = ProjectGroup.objects.select_related('created_by').all()
        return filter_project_groups_for_user(qs, self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class GeoDataViewSet(AuditMixin, viewsets.ModelViewSet):
    serializer_class = GeoDataSerializer
    filterset_class = GeoDataFilter
    permission_classes = [IsAuthenticated, IsGeoDataProjectMember]
    search_fields = ['mobile_id', 'search_text']
    ordering_fields = ['created_at', 'updated_at', 'mobile_id']

    def get_queryset(self):
        qs = GeoData.objects.select_related('project', 'collected_by').all()
        return filter_geodata_for_user(qs, self.request.user)

    def perform_create(self, serializer):
        serializer.save(collected_by=self.request.user)

    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export geodata. Query params: format (geojson|csv|shapefile)"""
        from .export_import import export_geojson, export_csv, export_shapefile

        fmt = request.query_params.get('format', 'geojson')
        qs = self.filter_queryset(self.get_queryset()).filter(is_deleted=False)

        if fmt == 'csv':
            data = export_csv(qs)
            response = HttpResponse(data, content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="geodata_export.csv"'
        elif fmt == 'shapefile':
            data = export_shapefile(qs)
            response = HttpResponse(data, content_type='application/zip')
            response['Content-Disposition'] = 'attachment; filename="geodata_export.zip"'
        else:
            data = export_geojson(qs)
            response = HttpResponse(data, content_type='application/geo+json')
            response['Content-Disposition'] = 'attachment; filename="geodata_export.geojson"'

        return response

    @action(detail=False, methods=['post'])
    def import_data(self, request):
        """Import geodata from file. Params: file, project_id, dry_run (optional)"""
        from .export_import import parse_geojson, parse_csv, validate_import_data
        from .audit import log_change
        import uuid

        uploaded_file = request.FILES.get('file')
        project_id = request.data.get('project_id')
        dry_run = request.query_params.get('dry_run', 'false').lower() == 'true'

        if not uploaded_file:
            return Response({'detail': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        if not project_id:
            return Response({'detail': 'project_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({'detail': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

        # Parse based on file extension
        filename = uploaded_file.name.lower()
        if filename.endswith('.geojson') or filename.endswith('.json'):
            records = parse_geojson(uploaded_file)
        elif filename.endswith('.csv'):
            records = parse_csv(uploaded_file, project.geometry_type)
        else:
            return Response({'detail': 'Unsupported file format. Use .geojson or .csv'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Validate
        result = validate_import_data(records, project)

        if dry_run:
            return Response({
                'valid_count': len(result['valid']),
                'error_count': len(result['errors']),
                'errors': result['errors'][:50],  # Limit error details
                'preview': [r['properties'] for r in result['valid'][:10]],
            })

        # Import valid records
        from django.contrib.gis.geos import GEOSGeometry
        from datetime import datetime
        imported = 0

        for record in result['valid']:
            geom_data = record['geometry']
            try:
                geom = GEOSGeometry(json.dumps(geom_data), srid=4326)
            except Exception:
                continue

            gd = GeoData(
                mobile_id=str(uuid.uuid4()),
                project=project,
                form_data=record.get('properties', {}),
                points=[],
                collected_by=request.user,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                geom=geom,
            )
            gd.save()
            log_change(request.user, 'create', gd, request=request)
            imported += 1

        return Response({
            'imported': imported,
            'error_count': len(result['errors']),
            'errors': result['errors'][:20],
        })

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        """Soft-delete multiple geodata records. Body: {ids: [1,2,3]}"""
        from .audit import log_change

        ids = request.data.get('ids', [])
        if not ids:
            return Response({'detail': 'No IDs provided'}, status=status.HTTP_400_BAD_REQUEST)

        qs = self.get_queryset().filter(id__in=ids)
        count = 0
        for gd in qs:
            gd.is_deleted = True
            gd.save(update_fields=['is_deleted'])
            log_change(request.user, 'delete', gd, request=request)
            count += 1

        return Response({'deleted': count})

    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Update multiple geodata records. Body: {ids: [...], data: {field: value}}"""
        from .audit import log_change

        ids = request.data.get('ids', [])
        data = request.data.get('data', {})
        if not ids or not data:
            return Response({'detail': 'ids and data are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Only allow safe fields
        allowed_fields = {'is_deleted'}
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        if not update_data:
            return Response({'detail': 'No valid fields to update'}, status=status.HTTP_400_BAD_REQUEST)

        qs = self.get_queryset().filter(id__in=ids)
        count = 0
        for gd in qs:
            for field, value in update_data.items():
                setattr(gd, field, value)
            gd.save()
            log_change(request.user, 'update', gd, changes=update_data, request=request)
            count += 1

        return Response({'updated': count})

    @action(detail=True, methods=['post'])
    def submit_for_review(self, request, pk=None):
        """Submit geodata for review."""
        from .audit import log_change
        gd = self.get_object()
        gd.approval_status = 'review'
        gd.save(update_fields=['approval_status'])
        log_change(request.user, 'status_change', gd,
                   changes={'approval_status': {'old': 'draft', 'new': 'review'}},
                   request=request)
        return Response({'status': 'review'})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve geodata."""
        from .audit import log_change
        from datetime import datetime
        gd = self.get_object()
        old_status = gd.approval_status
        gd.approval_status = 'approved'
        gd.reviewed_by = request.user
        gd.reviewed_at = datetime.now()
        gd.review_notes = request.data.get('notes', '')
        gd.save(update_fields=['approval_status', 'reviewed_by', 'reviewed_at', 'review_notes'])
        log_change(request.user, 'status_change', gd,
                   changes={'approval_status': {'old': old_status, 'new': 'approved'}},
                   request=request)
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject geodata."""
        from .audit import log_change
        from datetime import datetime
        gd = self.get_object()
        old_status = gd.approval_status
        gd.approval_status = 'rejected'
        gd.reviewed_by = request.user
        gd.reviewed_at = datetime.now()
        gd.review_notes = request.data.get('notes', '')
        gd.save(update_fields=['approval_status', 'reviewed_by', 'reviewed_at', 'review_notes'])
        log_change(request.user, 'status_change', gd,
                   changes={'approval_status': {'old': old_status, 'new': 'rejected'}},
                   request=request)
        return Response({'status': 'rejected'})

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        project_id = request.query_params.get('project_id')
        qs = GeoData.objects.filter(is_deleted=False)
        if project_id:
            qs = qs.filter(project__id=project_id)

        total = qs.count()
        by_project = list(
            qs.values('project__name', 'project__geometry_type')
            .annotate(count=Count('id'))
            .order_by('-count')[:20]
        )
        by_collector = list(
            qs.values('collected_by__username')
            .annotate(count=Count('id'))
            .order_by('-count')[:20]
        )

        return Response({
            'total': total,
            'by_project': by_project,
            'by_collector': by_collector,
        })


class SyncLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SyncLogSerializer
    filterset_class = SyncLogFilter
    search_fields = ['project_mobile_id', 'geodata_mobile_id']
    ordering_fields = ['created_at', 'sync_type', 'status']

    def get_queryset(self):
        return SyncLog.objects.select_related('user').all()


class MobileAppVersionViewSet(viewsets.ModelViewSet):
    serializer_class = MobileAppVersionSerializer
    filterset_class = MobileAppVersionFilter
    search_fields = ['version', 'release_notes']
    ordering_fields = ['version_code', 'released_at', 'download_count']

    def get_queryset(self):
        return MobileAppVersion.objects.select_related('released_by').all()

    def perform_create(self, serializer):
        serializer.save(released_by=self.request.user)


class FCMTokenViewSet(viewsets.ModelViewSet):
    serializer_class = FCMTokenSerializer
    filterset_class = FCMTokenFilter
    search_fields = ['user__username', 'device_name', 'device_id']
    ordering_fields = ['updated_at', 'created_at', 'platform']

    def get_queryset(self):
        return FCMToken.objects.select_related('user').all()

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        token = self.get_object()
        token.deactivate()
        return Response({'status': 'deactivated'})


class TMSLayerViewSet(viewsets.ModelViewSet):
    serializer_class = TMSLayerSerializer
    filterset_class = TMSLayerFilter
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'created_at']

    def get_queryset(self):
        return TMSLayer.objects.all()


class MobileNotificationViewSet(viewsets.ModelViewSet):
    serializer_class = MobileNotificationSerializer
    search_fields = ['title', 'body']
    ordering_fields = ['created_at']

    def get_queryset(self):
        return MobileNotification.objects.all()


class UserManagementViewSet(viewsets.ModelViewSet):
    serializer_class = UserManagementSerializer
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'date_joined', 'last_login']

    def get_queryset(self):
        return User.objects.prefetch_related('groups', 'user_permissions').all().order_by('-date_joined')


class GroupViewSet(viewsets.ModelViewSet):
    serializer_class = GroupSerializer
    search_fields = ['name']
    ordering_fields = ['name']

    def get_queryset(self):
        return Group.objects.prefetch_related('permissions').all().order_by('name')


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PermissionSerializer
    search_fields = ['name', 'codename']
    ordering_fields = ['codename', 'name']

    def get_queryset(self):
        # Only show permissions for mobileadmin models + auth models
        app_labels = ['mobileadmin', 'auth']
        return Permission.objects.filter(
            content_type__app_label__in=app_labels
        ).select_related('content_type').order_by('content_type__app_label', 'codename')


class AdminSettingsViewSet(viewsets.ModelViewSet):
    serializer_class = AdminSettingsSerializer

    def get_queryset(self):
        return AdminSettings.objects.all()

    def list(self, request, *args, **kwargs):
        """Always return the singleton settings object as a list with 1 item."""
        settings_obj = AdminSettings.load()
        serializer = self.get_serializer(settings_obj)
        return Response({
            'count': 1,
            'results': [serializer.data],
        })

    def retrieve(self, request, *args, **kwargs):
        settings_obj = AdminSettings.load()
        serializer = self.get_serializer(settings_obj)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        settings_obj = AdminSettings.load()
        serializer = self.get_serializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)


class GeoDataCommentViewSet(viewsets.ModelViewSet):
    serializer_class = GeoDataCommentSerializer
    search_fields = ['text']
    ordering_fields = ['created_at']

    def get_queryset(self):
        qs = GeoDataComment.objects.select_related('user', 'geodata').all()
        geodata_id = self.request.query_params.get('geodata')
        if geodata_id:
            qs = qs.filter(geodata_id=geodata_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TaskViewSet(AuditMixin, viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    filterset_class = TaskFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'due_date', 'priority', 'status']

    def get_queryset(self):
        qs = Task.objects.select_related(
            'assigned_to', 'created_by', 'project'
        ).all()
        user = self.request.user
        if not (user.is_superuser or user.is_staff):
            from django.db.models import Q
            qs = qs.filter(
                Q(assigned_to=user) | Q(created_by=user)
            ).distinct()
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


# ---------------------------------------------------------------------------
# Dashboard Analytics endpoint
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_analytics(request):
    """Returns aggregated analytics data for the dashboard charts."""
    from datetime import datetime

    user = request.user
    thirty_days_ago = datetime.now() - timedelta(days=30)

    # GeoData filtered by permissions
    geodata_qs = GeoData.objects.filter(is_deleted=False)
    geodata_qs = filter_geodata_for_user(geodata_qs, user)

    # GeoData by project (top 20)
    geodata_by_project = list(
        geodata_qs.values('project__name')
        .annotate(count=Count('id'))
        .order_by('-count')[:20]
    )

    # GeoData by collector (top 20)
    geodata_by_collector = list(
        geodata_qs.values('collected_by__username')
        .annotate(count=Count('id'))
        .order_by('-count')[:20]
    )

    # GeoData by date (last 30 days)
    geodata_by_date = list(
        geodata_qs.filter(created_at__gte=thirty_days_ago)
        .annotate(date=TruncDate('created_at'))
        .values('date')
        .annotate(count=Count('id'))
        .order_by('date')
    )
    # Convert date objects to strings
    for item in geodata_by_date:
        item['date'] = item['date'].isoformat() if item['date'] else None

    # GeoData by geometry type
    geodata_by_geometry = list(
        geodata_qs.values('project__geometry_type')
        .annotate(count=Count('id'))
        .order_by('-count')
    )

    # Sync activity (last 30 days)
    sync_activity = list(
        SyncLog.objects.filter(created_at__gte=thirty_days_ago)
        .annotate(date=TruncDate('created_at'))
        .values('date', 'status')
        .annotate(count=Count('id'))
        .order_by('date')
    )
    for item in sync_activity:
        item['date'] = item['date'].isoformat() if item['date'] else None

    # Recent activity from audit log
    recent_logs = AuditLog.objects.select_related('user').all()[:20]
    recent_activity = AuditLogSerializer(recent_logs, many=True).data

    return Response({
        'geodata_by_project': geodata_by_project,
        'geodata_by_collector': geodata_by_collector,
        'geodata_by_date': geodata_by_date,
        'geodata_by_geometry': geodata_by_geometry,
        'sync_activity': sync_activity,
        'recent_activity': recent_activity,
    })


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AuditLogSerializer
    filterset_class = AuditLogFilter
    search_fields = ['object_repr', 'model_name']
    ordering_fields = ['created_at', 'action', 'model_name']

    def get_queryset(self):
        return AuditLog.objects.select_related('user').all()

    @action(detail=False, methods=['get'])
    def recent_activity(self, request):
        """Returns the last 50 audit log entries."""
        qs = self.get_queryset()[:50]
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def record_history(self, request):
        """Returns audit history for a specific record.
        Query params: model_name, object_id
        """
        model_name = request.query_params.get('model_name')
        object_id = request.query_params.get('object_id')
        if not model_name or not object_id:
            return Response(
                {'detail': 'model_name and object_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        qs = self.get_queryset().filter(model_name=model_name, object_id=object_id)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# Vector Tile helpers
# ---------------------------------------------------------------------------

def _tile_to_bbox(z, x, y):
    """Convert tile coords (z/x/y) to EPSG:3857 bounding box."""
    n = 2.0 ** z
    lon_min = x / n * 360.0 - 180.0
    lat_max = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / n))))
    lon_max = (x + 1) / n * 360.0 - 180.0
    lat_min = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * (y + 1) / n))))

    def _to_3857(lon, lat):
        mx = lon * 20037508.34 / 180.0
        my = math.log(math.tan((90 + lat) * math.pi / 360.0)) / (math.pi / 180.0)
        my = my * 20037508.34 / 180.0
        return mx, my

    xmin, ymin = _to_3857(lon_min, lat_min)
    xmax, ymax = _to_3857(lon_max, lat_max)
    return xmin, ymin, xmax, ymax


def _generate_tile_from_db(project_mobile_ids, z, x, y):
    """Generate MVT tile via PostgreSQL function get_geodata_tile()."""
    xmin, ymin, xmax, ymax = _tile_to_bbox(z, x, y)

    sql = "SELECT public.get_geodata_tile(%s, %s, %s, %s, %s, %s, %s, %s::text[]);"
    params = [z, x, y, xmin, ymin, xmax, ymax, project_mobile_ids]

    with connection.cursor() as cursor:
        cursor.execute(sql, params)
        row = cursor.fetchone()

    tile_bytes = row[0] if row and row[0] else None
    if tile_bytes is None:
        return b''
    if isinstance(tile_bytes, memoryview):
        return bytes(tile_bytes)
    return bytes(tile_bytes)


# ---------------------------------------------------------------------------
# Vector Tile endpoint
# ---------------------------------------------------------------------------

TILE_CACHE_TTL = 3600

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vector_tile(request, z, x, y):
    """
    Serve Mapbox Vector Tiles (MVT / .pbf) from GeoData.

    Query params:
      - project_id: mobile_id of a single project
      - group_id: id of a ProjectGroup
    """
    project_id = request.query_params.get('project_id')
    group_id = request.query_params.get('group_id')

    if not project_id and not group_id:
        return HttpResponse('project_id or group_id parameter is required', status=400)

    project_mobile_ids = []

    # Get accessible project ids for permission check
    accessible_ids = get_accessible_project_mobile_ids(request.user)

    if group_id:
        try:
            group = ProjectGroup.objects.get(id=group_id, is_active=True, is_deleted=False)
        except ProjectGroup.DoesNotExist:
            return HttpResponse('Project group not found', status=404)

        # Check group access
        user = request.user
        if not (user.is_superuser or user.is_staff):
            if not (group.created_by == user or group.access_by.filter(id=user.id).exists()):
                return HttpResponse('Forbidden', status=403)

        project_mobile_ids = list(
            group.projects.filter(is_active=True, is_deleted=False)
            .values_list('mobile_id', flat=True)
        )
        if not project_mobile_ids:
            return HttpResponse(b'', content_type='application/x-protobuf')

    elif project_id:
        # Check project access
        if accessible_ids is not None and project_id not in accessible_ids:
            return HttpResponse('Forbidden', status=403)
        project_mobile_ids = [project_id]

    try:
        tile_data = _generate_tile_from_db(project_mobile_ids, z, x, y)
    except Exception as e:
        return HttpResponse(
            f'Tile generation error: {str(e)}',
            status=500,
            content_type='text/plain'
        )

    response = HttpResponse(tile_data, content_type='application/x-protobuf')
    response['Access-Control-Allow-Origin'] = '*'
    response['Cache-Control'] = f'public, max-age={TILE_CACHE_TTL}'
    return response


# ---------------------------------------------------------------------------
# Tile Proxy
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([AllowAny])
def tile_proxy(request):
    """
    Proxy endpoint for tile server.
    GET /api/mobile/proxy?tile=/tms/tile/geoportal/fu_ebl_2025/+4326/{z}/{x}/{y}.png
    """
    tile_path = request.GET.get('tile', '')
    if not tile_path:
        return HttpResponse('Missing tile parameter', status=400)

    if tile_path.startswith('/'):
        tile_path = tile_path[1:]

    target_url = f'http://portal-gis.tap-agri.com/{tile_path}'

    try:
        response = http_requests.get(target_url, timeout=60)
        django_response = HttpResponse(
            response.content,
            status=response.status_code,
            content_type=response.headers.get('Content-Type', 'image/png')
        )
        for header in ['Cache-Control', 'ETag', 'Last-Modified']:
            if header in response.headers:
                django_response[header] = response.headers[header]
        return django_response
    except http_requests.exceptions.Timeout:
        return HttpResponse('Request timeout', status=504)
    except http_requests.exceptions.RequestException as e:
        return HttpResponse(f'Proxy error: {str(e)}', status=502)
    except Exception as e:
        return HttpResponse(f'Server error: {str(e)}', status=500)


# ---------------------------------------------------------------------------
# Auth / Me endpoint — validates token and returns user info + permissions
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """
    Returns the authenticated user's info and permissions.
    Used by the frontend to validate the token and get role info.
    """
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'groups': list(user.groups.values_list('name', flat=True)),
        'permissions': list(user.get_all_permissions()),
    })


# ---------------------------------------------------------------------------
# Spatial Query endpoint
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def spatial_query(request):
    """
    Radius search for GeoData features.
    Query params: lng, lat, radius_m, project_id (optional)
    Returns GeoJSON FeatureCollection.
    """
    from django.contrib.gis.geos import Point as GeoPoint
    from django.contrib.gis.measure import D

    try:
        lng = float(request.query_params.get('lng', 0))
        lat = float(request.query_params.get('lat', 0))
        radius = float(request.query_params.get('radius_m', 1000))
    except (ValueError, TypeError):
        return Response({'detail': 'Invalid lng/lat/radius_m parameters'}, status=400)

    center = GeoPoint(lng, lat, srid=4326)

    qs = GeoData.objects.filter(
        is_deleted=False,
        geom__distance_lte=(center, D(m=radius))
    ).select_related('project', 'collected_by')

    # Apply row-level permissions
    qs = filter_geodata_for_user(qs, request.user)

    # Optional project filter
    project_id = request.query_params.get('project_id')
    if project_id:
        qs = qs.filter(project__mobile_id=project_id)

    features = []
    for gd in qs[:500]:  # Limit results
        if not gd.geom:
            continue
        features.append({
            'type': 'Feature',
            'geometry': {
                'type': gd.geom.geom_type,
                'coordinates': gd.geom.coords,
            },
            'properties': {
                'id': gd.id,
                'mobile_id': gd.mobile_id,
                'project_name': gd.project.name if gd.project else None,
                'collected_by': gd.collected_by.username if gd.collected_by else None,
                'approval_status': gd.approval_status,
                'created_at': gd.created_at.isoformat() if gd.created_at else None,
            },
        })

    return Response({
        'type': 'FeatureCollection',
        'features': features,
        'total': len(features),
        'center': [lng, lat],
        'radius_m': radius,
    })
