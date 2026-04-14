import math
import requests as http_requests

from django.db import connection
from django.db.models import Count
from django.http import HttpResponse, JsonResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from django.contrib.auth.models import User, Group, Permission

from .models import (
    Project, ProjectGroup, GeoData, SyncLog,
    MobileAppVersion, FCMToken, TMSLayer, MobileNotification,
    AdminSettings,
)
from .serializers import (
    ProjectSerializer, ProjectGroupSerializer, GeoDataSerializer,
    SyncLogSerializer, MobileAppVersionSerializer, FCMTokenSerializer,
    TMSLayerSerializer, MobileNotificationSerializer,
    UserManagementSerializer, GroupSerializer, PermissionSerializer,
    AdminSettingsSerializer,
)
from .filters import (
    ProjectFilter, ProjectGroupFilter, GeoDataFilter,
    SyncLogFilter, MobileAppVersionFilter, FCMTokenFilter,
    TMSLayerFilter,
)


# ---------------------------------------------------------------------------
# ViewSets
# ---------------------------------------------------------------------------

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    filterset_class = ProjectFilter
    search_fields = ['name', 'description', 'mobile_id']
    ordering_fields = ['name', 'created_at', 'updated_at', 'geometry_type']

    def get_queryset(self):
        return Project.objects.annotate(
            geodata_count=Count('geo_data')
        ).select_related('created_by').all()

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


class ProjectGroupViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectGroupSerializer
    filterset_class = ProjectGroupFilter
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']

    def get_queryset(self):
        return ProjectGroup.objects.select_related('created_by').all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class GeoDataViewSet(viewsets.ModelViewSet):
    serializer_class = GeoDataSerializer
    filterset_class = GeoDataFilter
    search_fields = ['mobile_id', 'search_text']
    ordering_fields = ['created_at', 'updated_at', 'mobile_id']

    def get_queryset(self):
        return GeoData.objects.select_related('project', 'collected_by').all()

    def perform_create(self, serializer):
        serializer.save(collected_by=self.request.user)

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

    if group_id:
        try:
            group = ProjectGroup.objects.get(id=group_id, is_active=True, is_deleted=False)
        except ProjectGroup.DoesNotExist:
            return HttpResponse('Project group not found', status=404)

        project_mobile_ids = list(
            group.projects.filter(is_active=True, is_deleted=False)
            .values_list('mobile_id', flat=True)
        )
        if not project_mobile_ids:
            return HttpResponse(b'', content_type='application/x-protobuf')

    elif project_id:
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
