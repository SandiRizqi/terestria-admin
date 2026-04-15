"""
Row-level permissions for Terestria Mobile Admin.

Non-superusers can only see/edit projects they created or are assigned to.
Superusers and staff have full access.
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.db.models import Q


class IsProjectMember(BasePermission):
    """
    Object-level permission: user must be the creator or a collector of the project.
    Superusers and staff bypass this check.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_superuser or user.is_staff:
            return True
        return obj.created_by == user or obj.collectors.filter(id=user.id).exists()


class IsProjectGroupMember(BasePermission):
    """
    Object-level permission: user must be the creator or in access_by of the group.
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.is_superuser or user.is_staff:
            return True
        return obj.created_by == user or obj.access_by.filter(id=user.id).exists()


class IsGeoDataProjectMember(BasePermission):
    """
    Object-level permission: user must have access to the geodata's project.
    """

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
# Queryset helpers (used in ViewSet.get_queryset)
# ---------------------------------------------------------------------------

def filter_projects_for_user(qs, user):
    """Return only projects the user created or is a collector of."""
    if user.is_superuser or user.is_staff:
        return qs
    return qs.filter(
        Q(created_by=user) | Q(collectors=user)
    ).distinct()


def filter_project_groups_for_user(qs, user):
    """Return only groups the user created or has access to."""
    if user.is_superuser or user.is_staff:
        return qs
    return qs.filter(
        Q(created_by=user) | Q(access_by=user)
    ).distinct()


def get_accessible_project_mobile_ids(user):
    """Get list of project mobile_ids that the user can access."""
    from .models import Project
    if user.is_superuser or user.is_staff:
        return None  # None means "all"
    return list(
        Project.objects.filter(
            Q(created_by=user) | Q(collectors=user)
        ).values_list('mobile_id', flat=True).distinct()
    )


def filter_geodata_for_user(qs, user):
    """Filter geodata to only include those from accessible projects."""
    if user.is_superuser or user.is_staff:
        return qs
    return qs.filter(
        Q(project__created_by=user)
        | Q(project__collectors=user)
        | Q(collected_by=user)
    ).distinct()
