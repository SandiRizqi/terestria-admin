from rest_framework import serializers
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType
from .models import (
    Project, ProjectGroup, GeoData, SyncLog,
    MobileAppVersion, FCMToken, TMSLayer, MobileNotification,
    AdminSettings, AuditLog, GeoDataComment, Task,
    Workspace, WorkspaceMember,
)


class WorkspaceMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = WorkspaceMember
        fields = ['id', 'user', 'username', 'email', 'role', 'joined_at']
        read_only_fields = ['joined_at']


class WorkspaceSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    member_count = serializers.SerializerMethodField()
    members_detail = WorkspaceMemberSerializer(source='workspace_members', many=True, read_only=True)
    role = serializers.SerializerMethodField()

    class Meta:
        model = Workspace
        fields = [
            'id', 'name', 'slug', 'description',
            'owner', 'owner_username', 'member_count', 'members_detail',
            'role', 'is_active', 'created_at', 'updated_at',
        ]
        read_only_fields = ['slug', 'owner', 'created_at', 'updated_at']

    def get_member_count(self, obj):
        return obj.workspace_members.count()

    def get_role(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        member = obj.workspace_members.filter(user=request.user).first()
        return member.role if member else None


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    workspace_name = serializers.CharField(max_length=255)
    workspace_description = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username sudah digunakan.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email sudah terdaftar.')
        return value


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class PermissionSerializer(serializers.ModelSerializer):
    content_type_name = serializers.SerializerMethodField()

    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename', 'content_type', 'content_type_name']

    def get_content_type_name(self, obj):
        return f"{obj.content_type.app_label}.{obj.content_type.model}"


class GroupSerializer(serializers.ModelSerializer):
    permissions = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Permission.objects.all(), required=False
    )
    permission_names = serializers.SerializerMethodField()
    user_count = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions', 'permission_names', 'user_count']

    def get_permission_names(self, obj):
        return list(obj.permissions.values_list('codename', flat=True))

    def get_user_count(self, obj):
        return obj.user_set.count()


class UserManagementSerializer(serializers.ModelSerializer):
    project_count = serializers.SerializerMethodField()
    groups = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Group.objects.all(), required=False
    )
    group_names = serializers.SerializerMethodField()
    user_permissions = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Permission.objects.all(), required=False
    )
    permission_names = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_active', 'is_staff', 'is_superuser',
            'date_joined', 'last_login', 'project_count',
            'groups', 'group_names', 'user_permissions', 'permission_names',
            'password',
        ]
        read_only_fields = ['date_joined', 'last_login']

    def get_project_count(self, obj):
        return obj.mobile_created_projects.count()

    def get_group_names(self, obj):
        return list(obj.groups.values_list('name', flat=True))

    def get_permission_names(self, obj):
        return list(obj.user_permissions.values_list('codename', flat=True))

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        groups = validated_data.pop('groups', [])
        user_permissions = validated_data.pop('user_permissions', [])
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        if groups:
            user.groups.set(groups)
        if user_permissions:
            user.user_permissions.set(user_permissions)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        groups = validated_data.pop('groups', None)
        user_permissions = validated_data.pop('user_permissions', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        if groups is not None:
            instance.groups.set(groups)
        if user_permissions is not None:
            instance.user_permissions.set(user_permissions)
        return instance


class AdminSettingsSerializer(serializers.ModelSerializer):
    logo_image_url = serializers.SerializerMethodField()

    class Meta:
        model = AdminSettings
        fields = [
            'id', 'app_name', 'logo_url', 'logo_image', 'logo_image_url',
            'primary_color', 'primary_dark', 'primary_light',
            'sidebar_color', 'accent_color', 'background_color',
            'font_family',
            'default_map_center_lng', 'default_map_center_lat', 'default_map_zoom',
        ]

    def get_logo_image_url(self, obj):
        if obj.logo_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo_image.url)
            return obj.logo_image.url
        return None


class ProjectSerializer(serializers.ModelSerializer):
    geodata_count = serializers.IntegerField(read_only=True, default=0)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True, default=None)
    workspace_name = serializers.CharField(source='workspace.name', read_only=True, default=None)

    class Meta:
        model = Project
        fields = [
            'id', 'mobile_id', 'name', 'description', 'geometry_type',
            'form_fields', 'created_by', 'created_by_username', 'collectors',
            'workspace', 'workspace_name',
            'map_color', 'created_at', 'updated_at', 'synced_at',
            'is_active', 'is_deleted', 'geodata_count',
        ]
        read_only_fields = ['created_at', 'updated_at', 'synced_at']


class ProjectGroupSerializer(serializers.ModelSerializer):
    project_count = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True, default=None)
    workspace_name = serializers.CharField(source='workspace.name', read_only=True, default=None)

    class Meta:
        model = ProjectGroup
        fields = [
            'id', 'name', 'description', 'projects', 'geometry_type',
            'json_template', 'created_by', 'created_by_username',
            'workspace', 'workspace_name',
            'access_by', 'created_at', 'updated_at',
            'is_active', 'is_deleted', 'project_count',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_project_count(self, obj):
        return obj.projects.count()


class GeoDataSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True, default=None)
    collected_by_username = serializers.CharField(source='collected_by.username', read_only=True, default=None)
    reviewed_by_username = serializers.CharField(source='reviewed_by.username', read_only=True, default=None)
    geom_geojson = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = GeoData
        fields = [
            'id', 'mobile_id', 'project', 'project_name',
            'form_data', 'points',
            'collected_by', 'collected_by_username',
            'approval_status', 'reviewed_by', 'reviewed_by_username',
            'reviewed_at', 'review_notes',
            'created_at', 'updated_at', 'synced_at',
            'is_deleted', 'geom_geojson', 'comment_count',
        ]
        read_only_fields = ['synced_at', 'geom_geojson', 'comment_count']

    def get_comment_count(self, obj):
        return obj.comments.count()

    def get_geom_geojson(self, obj):
        if obj.geom:
            return {
                'type': obj.geom.geom_type,
                'coordinates': obj.geom.coords,
            }
        return None


class SyncLogSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True, default=None)

    class Meta:
        model = SyncLog
        fields = [
            'id', 'user', 'user_username', 'sync_type', 'status',
            'project_mobile_id', 'geodata_mobile_id',
            'items_count', 'error_message', 'request_data',
            'device_info', 'ip_address', 'created_at',
        ]
        read_only_fields = ['created_at']


class MobileAppVersionSerializer(serializers.ModelSerializer):
    released_by_username = serializers.CharField(source='released_by.username', read_only=True, default=None)

    class Meta:
        model = MobileAppVersion
        fields = [
            'id', 'version', 'version_code', 'apk_url',
            'file_size', 'checksum', 'release_notes',
            'is_mandatory', 'is_active', 'released_at',
            'released_by', 'released_by_username',
            'download_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['released_at', 'download_count', 'created_at', 'updated_at']


class FCMTokenSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True, default=None)

    class Meta:
        model = FCMToken
        fields = [
            'id', 'user', 'user_username', 'device_id', 'fcm_token',
            'platform', 'device_name', 'app_version', 'os_version',
            'is_active', 'created_at', 'updated_at', 'last_used_at',
        ]
        read_only_fields = ['created_at', 'updated_at', 'last_used_at']


class TMSLayerSerializer(serializers.ModelSerializer):
    full_url = serializers.SerializerMethodField()
    workspace_name = serializers.CharField(source='workspace.name', read_only=True, default=None)

    class Meta:
        model = TMSLayer
        fields = [
            'id', 'name', 'code', 'description', 'owner',
            'workspace', 'workspace_name',
            'tms_url', 'base_url', 'min_zoom', 'max_zoom',
            'is_active', 'created_at', 'updated_at', 'full_url',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_full_url(self, obj):
        return obj.get_full_url()


class MobileNotificationSerializer(serializers.ModelSerializer):
    receiver_count = serializers.SerializerMethodField()

    class Meta:
        model = MobileNotification
        fields = [
            'id', 'title', 'body', 'image', 'data',
            'receivers', 'created_at', 'updated_at', 'receiver_count',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_receiver_count(self, obj):
        return obj.receivers.count()


class GeoDataCommentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True, default=None)

    class Meta:
        model = GeoDataComment
        fields = ['id', 'geodata', 'user', 'user_username', 'text', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True, default=None)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True, default=None)
    project_name = serializers.CharField(source='project.name', read_only=True, default=None)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description',
            'assigned_to', 'assigned_to_username',
            'created_by', 'created_by_username',
            'project', 'project_name', 'geodata',
            'status', 'priority', 'due_date',
            'completed_at', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class AuditLogSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True, default=None)

    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'user_username', 'action',
            'model_name', 'object_id', 'object_repr',
            'changes', 'ip_address', 'created_at',
        ]
        read_only_fields = fields
