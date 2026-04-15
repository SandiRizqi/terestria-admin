"""
Audit logging utilities for Terestria Mobile Admin.

Provides:
- log_change() — create an audit log entry
- compute_changes() — diff two serialized states
- AuditMixin — mixin for DRF ViewSets to auto-log create/update/delete
"""
from .models import AuditLog


def get_client_ip(request):
    """Extract client IP from request."""
    if not request:
        return None
    xff = request.META.get('HTTP_X_FORWARDED_FOR')
    if xff:
        return xff.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def log_change(user, action, instance, changes=None, request=None):
    """Create an AuditLog entry."""
    model_name = instance.__class__.__name__
    object_id = str(instance.pk)
    object_repr = str(instance)[:255]

    AuditLog.objects.create(
        user=user,
        action=action,
        model_name=model_name,
        object_id=object_id,
        object_repr=object_repr,
        changes=changes,
        ip_address=get_client_ip(request),
    )


def compute_changes(old_data, new_data):
    """
    Given two dicts (serialized model state), return the diff.
    Returns: {field_name: {'old': old_val, 'new': new_val}} for changed fields.
    """
    if not old_data or not new_data:
        return None

    changes = {}
    all_keys = set(list(old_data.keys()) + list(new_data.keys()))

    # Skip noisy fields
    skip_fields = {'updated_at', 'synced_at', 'search_text', 'search_vector', 'geom_3857'}

    for key in all_keys:
        if key in skip_fields:
            continue
        old_val = old_data.get(key)
        new_val = new_data.get(key)
        if old_val != new_val:
            changes[key] = {
                'old': _serialize_value(old_val),
                'new': _serialize_value(new_val),
            }

    return changes if changes else None


def _serialize_value(val):
    """Make a value JSON-serializable for audit log storage."""
    if val is None:
        return None
    if isinstance(val, (str, int, float, bool)):
        return val
    if isinstance(val, (list, dict)):
        return val
    return str(val)


def _instance_to_dict(instance, serializer_class=None):
    """Convert a model instance to a dict for comparison."""
    if serializer_class:
        try:
            return serializer_class(instance).data
        except Exception:
            pass
    # Fallback: use model fields
    data = {}
    for field in instance._meta.fields:
        try:
            val = getattr(instance, field.name)
            data[field.name] = _serialize_value(val)
        except Exception:
            pass
    return data


class AuditMixin:
    """
    Mixin for DRF ModelViewSets that automatically logs
    create, update, and destroy actions.

    Add to your ViewSet:
        class MyViewSet(AuditMixin, viewsets.ModelViewSet):
            ...
    """

    def perform_create(self, serializer):
        super().perform_create(serializer)
        instance = serializer.instance
        log_change(
            user=self.request.user,
            action='create',
            instance=instance,
            changes=None,
            request=self.request,
        )

    def perform_update(self, serializer):
        # Capture pre-update state
        instance = self.get_object()
        old_data = _instance_to_dict(instance)

        super().perform_update(serializer)

        # Capture post-update state
        instance.refresh_from_db()
        new_data = _instance_to_dict(instance)
        changes = compute_changes(old_data, new_data)

        log_change(
            user=self.request.user,
            action='update',
            instance=instance,
            changes=changes,
            request=self.request,
        )

    def perform_destroy(self, instance):
        log_change(
            user=self.request.user,
            action='delete',
            instance=instance,
            changes=None,
            request=self.request,
        )
        super().perform_destroy(instance)
