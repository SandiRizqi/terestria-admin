"""
Row-level permissions for Terestria Mobile Admin.
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.db.models import Q


def get_workspace_id(request):
    """Read workspace ID from X-Workspace header or ?workspace= query param."""
    ws = request.META.get('HTTP_X_WORKSPACE') or request.query_params.get('workspace')
    if ws:
        try:
            return int(ws)
        except (ValueError, TypeError):
            pass
    return None


class IsProjectMember(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_superuser or user.is_staff:
            return True
        return obj.created_by == user or obj.collectors.filter(id=user.id).exists()


class IsProjectGroupMember(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_superuser or user.is_staff:
            return True
        return obj.created_by == user or obj.access_by.filter(id=user.id).exists()


class IsGeoDataProjectMember(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_superuser or user.is_staff:
            return True
        project = obj.project
        return (
            project.created_by == user
            or project.collectors.filter(id=user.id).exists()
            or obj.collected_by == user
        )


# ---------------------------------------------------------------------------
# Queryset helpers
# ---------------------------------------------------------------------------

def _workspace_qs(qs, user, workspace_id, workspace_field='workspace_id'):
    """Apply workspace filter to a queryset."""
    from .models import WorkspaceMember
    if user.is_superuser or user.is_staff:
        if workspace_id:
            return qs.filter(**{workspace_field: workspace_id})
        return qs
    # Non-staff: restrict to workspaces user belongs to
    member_ws_ids = WorkspaceMember.objects.filter(user=user).values_list('workspace_id', flat=True)
    if workspace_id and workspace_id in list(member_ws_ids):
        return qs.filter(**{workspace_field: workspace_id})
    return qs.filter(**{f"{workspace_field}__in": member_ws_ids})


def filter_projects_for_user(qs, user, workspace_id=None):
    if user.is_superuser or user.is_staff:
        if workspace_id:
            return qs.filter(workspace_id=workspace_id)
        return qs
    from .models import WorkspaceMember
    member_ws_ids = list(WorkspaceMember.objects.filter(user=user).values_list('workspace_id', flat=True))
    base = qs.filter(
        Q(created_by=user) | Q(collectors=user) | Q(workspace_id__in=member_ws_ids)
    ).distinct()
    if workspace_id and workspace_id in member_ws_ids:
        return base.filter(workspace_id=workspace_id)
    return base


def filter_project_groups_for_user(qs, user, workspace_id=None):
    if user.is_superuser or user.is_staff:
        if workspace_id:
            return qs.filter(workspace_id=workspace_id)
        return qs
    from .models import WorkspaceMember
    member_ws_ids = list(WorkspaceMember.objects.filter(user=user).values_list('workspace_id', flat=True))
    base = qs.filter(
        Q(created_by=user) | Q(access_by=user) | Q(workspace_id__in=member_ws_ids)
    ).distinct()
    if workspace_id and workspace_id in member_ws_ids:
        return base.filter(workspace_id=workspace_id)
    return base


def get_accessible_project_mobile_ids(user, workspace_id=None):
    from .models import Project
    if user.is_superuser or user.is_staff:
        if workspace_id:
            return list(Project.objects.filter(workspace_id=workspace_id).values_list('mobile_id', flat=True))
        return None
    from .models import WorkspaceMember
    member_ws_ids = list(WorkspaceMember.objects.filter(user=user).values_list('workspace_id', flat=True))
    qs = Project.objects.filter(
        Q(created_by=user) | Q(collectors=user) | Q(workspace_id__in=member_ws_ids)
    )
    if workspace_id and workspace_id in member_ws_ids:
        qs = qs.filter(workspace_id=workspace_id)
    return list(qs.values_list('mobile_id', flat=True).distinct())


def filter_geodata_for_user(qs, user, workspace_id=None):
    if user.is_superuser or user.is_staff:
        if workspace_id:
            return qs.filter(project__workspace_id=workspace_id)
        return qs
    from .models import WorkspaceMember
    member_ws_ids = list(WorkspaceMember.objects.filter(user=user).values_list('workspace_id', flat=True))
    base = qs.filter(
        Q(project__created_by=user)
        | Q(project__collectors=user)
        | Q(collected_by=user)
        | Q(project__workspace_id__in=member_ws_ids)
    ).distinct()
    if workspace_id and workspace_id in member_ws_ids:
        return base.filter(project__workspace_id=workspace_id)
    return base


class IsStaffOrSuperuser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and (request.user.is_staff or request.user.is_superuser))


class IsStaffOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and (request.user.is_staff or request.user.is_superuser))
