import uuid
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from mobileadmin.models import (
    Project, ProjectGroup, GeoData, SyncLog,
    MobileAppVersion, FCMToken, TMSLayer,
)


class Command(BaseCommand):
    help = 'Create sample data for mobile admin development'

    def handle(self, *args, **options):
        admin, _ = User.objects.get_or_create(
            username='admin',
            defaults={'is_staff': True, 'is_superuser': True}
        )
        if not admin.has_usable_password():
            admin.set_password('password')
            admin.save()

        collector, _ = User.objects.get_or_create(
            username='collector1',
            defaults={'is_staff': False}
        )
        if not collector.has_usable_password():
            collector.set_password('password')
            collector.save()

        # Projects
        projects_data = [
            {
                'mobile_id': str(uuid.uuid4()),
                'name': 'Tree Survey - Block A',
                'description': 'Mapping tree locations in Block A',
                'geometry_type': 'point',
                'form_fields': [
                    {'label': 'Species', 'type': 'text'},
                    {'label': 'Height (m)', 'type': 'number'},
                    {'label': 'Health', 'type': 'select', 'options': ['Good', 'Fair', 'Poor']},
                ],
            },
            {
                'mobile_id': str(uuid.uuid4()),
                'name': 'Road Assessment',
                'description': 'Surveying road conditions',
                'geometry_type': 'line',
                'form_fields': [
                    {'label': 'Road Name', 'type': 'text'},
                    {'label': 'Condition', 'type': 'select', 'options': ['Good', 'Damaged', 'Needs Repair']},
                    {'label': 'Width (m)', 'type': 'number'},
                ],
            },
            {
                'mobile_id': str(uuid.uuid4()),
                'name': 'Land Parcel Survey',
                'description': 'Mapping land parcels',
                'geometry_type': 'polygon',
                'form_fields': [
                    {'label': 'Owner', 'type': 'text'},
                    {'label': 'Area (ha)', 'type': 'number'},
                    {'label': 'Land Use', 'type': 'select', 'options': ['Agriculture', 'Residential', 'Commercial']},
                ],
            },
        ]

        created_projects = []
        for pd in projects_data:
            proj, created = Project.objects.get_or_create(
                mobile_id=pd['mobile_id'],
                defaults={**pd, 'created_by': admin}
            )
            proj.collectors.add(admin, collector)
            created_projects.append(proj)
            status = 'Created' if created else 'Exists'
            self.stdout.write(f'  {status}: {proj.name}')

        # Project Group
        group, created = ProjectGroup.objects.get_or_create(
            name='All Surveys',
            defaults={
                'description': 'All survey projects',
                'geometry_type': 'point',
                'created_by': admin,
            }
        )
        group.projects.set(created_projects)
        group.access_by.add(admin, collector)
        self.stdout.write(f'  ProjectGroup: {group.name}')

        # GeoData samples
        now = timezone.now()
        geodata_samples = [
            {
                'project': created_projects[0],
                'form_data': {'Species': 'Palm Oil', 'Height (m)': 12, 'Health': 'Good'},
                'points': [{'latitude': -2.5, 'longitude': 110.5, 'timestamp': now.isoformat()}],
            },
            {
                'project': created_projects[0],
                'form_data': {'Species': 'Rubber', 'Height (m)': 8, 'Health': 'Fair'},
                'points': [{'latitude': -2.51, 'longitude': 110.51, 'timestamp': now.isoformat()}],
            },
            {
                'project': created_projects[1],
                'form_data': {'Road Name': 'Jalan Utama', 'Condition': 'Good', 'Width (m)': 6},
                'points': [
                    {'latitude': -2.5, 'longitude': 110.5, 'timestamp': now.isoformat()},
                    {'latitude': -2.502, 'longitude': 110.503, 'timestamp': now.isoformat()},
                    {'latitude': -2.505, 'longitude': 110.508, 'timestamp': now.isoformat()},
                ],
            },
            {
                'project': created_projects[2],
                'form_data': {'Owner': 'PT Agri', 'Area (ha)': 25, 'Land Use': 'Agriculture'},
                'points': [
                    {'latitude': -2.5, 'longitude': 110.5, 'timestamp': now.isoformat()},
                    {'latitude': -2.5, 'longitude': 110.51, 'timestamp': now.isoformat()},
                    {'latitude': -2.51, 'longitude': 110.51, 'timestamp': now.isoformat()},
                    {'latitude': -2.51, 'longitude': 110.5, 'timestamp': now.isoformat()},
                ],
            },
        ]

        for gd in geodata_samples:
            mobile_id = str(uuid.uuid4())
            obj, created = GeoData.objects.get_or_create(
                mobile_id=mobile_id,
                defaults={
                    **gd,
                    'collected_by': collector,
                    'created_at': now,
                    'updated_at': now,
                }
            )
            status = 'Created' if created else 'Exists'
            self.stdout.write(f'  GeoData {status}: {mobile_id[:8]}...')

        # SyncLogs
        for sync_type, status_val in [('geodata_upload', 'success'), ('project_download', 'success'), ('geodata_upload', 'failed')]:
            SyncLog.objects.create(
                user=collector,
                sync_type=sync_type,
                status=status_val,
                items_count=5,
                error_message='Connection timeout' if status_val == 'failed' else None,
                device_info={'model': 'Samsung Galaxy A52', 'os': 'Android 12'},
            )
        self.stdout.write('  SyncLogs created')

        # MobileAppVersion
        versions = [
            {'version': '1.0.0', 'version_code': 10, 'release_notes': 'Initial release', 'is_active': False},
            {'version': '1.1.0', 'version_code': 20, 'release_notes': 'Bug fixes and improvements'},
            {'version': '1.2.0', 'version_code': 30, 'release_notes': 'Added offline support', 'is_mandatory': True},
        ]
        for v in versions:
            MobileAppVersion.objects.get_or_create(
                version=v['version'],
                defaults={
                    **v,
                    'apk_url': f'https://example.com/app-{v["version"]}.apk',
                    'file_size': 45_000_000,
                    'released_by': admin,
                }
            )
        self.stdout.write('  MobileAppVersions created')

        # FCMToken
        FCMToken.objects.get_or_create(
            user=collector,
            device_id='device-001',
            defaults={
                'fcm_token': 'sample_fcm_token_' + str(uuid.uuid4()),
                'platform': 'android',
                'device_name': 'Samsung Galaxy A52',
                'app_version': '1.2.0',
                'os_version': 'Android 12',
            }
        )
        self.stdout.write('  FCMToken created')

        # TMSLayer
        TMSLayer.objects.get_or_create(
            code='satellite_2025',
            defaults={
                'name': 'Satellite Imagery 2025',
                'description': 'High-res satellite imagery',
                'owner': 'GIS Team',
                'tms_url': '/tms/tile/satellite/2025/{z}/{x}/{y}.png',
                'min_zoom': 0,
                'max_zoom': 18,
            }
        )
        self.stdout.write('  TMSLayer created')

        self.stdout.write(self.style.SUCCESS('\nSeed data created successfully!'))
