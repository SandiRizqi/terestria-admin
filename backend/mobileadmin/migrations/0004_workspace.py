from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('mobileadmin', '0003_auto_20260415_1000'),
    ]

    operations = [
        # Create Workspace
        migrations.CreateModel(
            name='Workspace',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('slug', models.SlugField(max_length=120, unique=True)),
                ('description', models.TextField(blank=True, default='')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('owner', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='owned_workspaces',
                    to=settings.AUTH_USER_MODEL,
                )),
            ],
            options={
                'db_table': 'mobileadmin_workspaces',
                'ordering': ['name'],
            },
        ),
        # Create WorkspaceMember
        migrations.CreateModel(
            name='WorkspaceMember',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(
                    choices=[('owner', 'Owner'), ('admin', 'Admin'), ('member', 'Member')],
                    default='member',
                    max_length=20,
                )),
                ('joined_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='workspace_memberships',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('workspace', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='workspace_members',
                    to='mobileadmin.Workspace',
                )),
            ],
            options={
                'db_table': 'mobileadmin_workspace_members',
                'unique_together': {('workspace', 'user')},
            },
        ),
        # Add ManyToMany field (members) via WorkspaceMember
        migrations.AddField(
            model_name='workspace',
            name='members',
            field=models.ManyToManyField(
                blank=True,
                related_name='workspaces',
                through='mobileadmin.WorkspaceMember',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        # Add workspace FK to Project
        migrations.AddField(
            model_name='project',
            name='workspace',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='projects',
                to='mobileadmin.Workspace',
            ),
        ),
        # Add workspace FK to ProjectGroup
        migrations.AddField(
            model_name='projectgroup',
            name='workspace',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='project_groups',
                to='mobileadmin.Workspace',
            ),
        ),
        # Remove unique constraint on ProjectGroup.name (now per-workspace)
        migrations.AlterField(
            model_name='projectgroup',
            name='name',
            field=models.CharField(max_length=255),
        ),
        # Add workspace FK to TMSLayer
        migrations.AddField(
            model_name='tmslayer',
            name='workspace',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='tms_layers',
                to='mobileadmin.Workspace',
            ),
        ),
    ]
