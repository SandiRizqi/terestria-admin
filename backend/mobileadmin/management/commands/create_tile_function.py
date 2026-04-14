from django.core.management.base import BaseCommand
from django.db import connection


CREATE_FUNCTION_SQL = """
CREATE OR REPLACE FUNCTION public.get_geodata_tile(
    p_z integer,
    p_x integer,
    p_y integer,
    p_minx double precision,
    p_miny double precision,
    p_maxx double precision,
    p_maxy double precision,
    p_project_ids text[]
)
RETURNS bytea AS
$$
DECLARE
    mvt bytea;
    bbox geometry;
    bbox_4326 geometry;
BEGIN
    bbox := ST_MakeEnvelope(p_minx, p_miny, p_maxx, p_maxy, 3857);
    bbox_4326 := ST_Transform(bbox, 4326);

    SELECT ST_AsMVT(tile, 'geodata', 4096, 'geom', 'gid')
    INTO mvt
    FROM (
        SELECT
            gd.id AS gid,
            gd.mobile_id,
            gd.project_mobile_id,
            p.name AS project_name,
            p.geometry_type,
            (
                SELECT COALESCE(jsonb_object_agg(kv.key, kv.value), '{}'::jsonb)
                FROM jsonb_each(gd.form_data) AS kv(key, value)
                WHERE jsonb_typeof(kv.value) <> 'array'
            )::text AS form_data_text,
            ST_AsMVTGeom(
                ST_Transform(gd.geom, 3857),
                bbox,
                4096,
                256,
                true
            ) AS geom
        FROM geoform_geodata gd
        JOIN geoform_projects p ON p.mobile_id = gd.project_mobile_id
        WHERE
            gd.is_deleted = false
            AND gd.geom IS NOT NULL
            AND gd.project_mobile_id = ANY(p_project_ids)
            AND gd.geom && bbox_4326
    ) tile
    WHERE tile.geom IS NOT NULL;

    RETURN COALESCE(mvt, ''::bytea);
END;
$$ LANGUAGE plpgsql STABLE STRICT;
"""


class Command(BaseCommand):
    help = 'Install the PostGIS get_geodata_tile() function for vector tile generation'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
            cursor.execute(CREATE_FUNCTION_SQL)
        self.stdout.write(self.style.SUCCESS('Successfully created get_geodata_tile() function'))
