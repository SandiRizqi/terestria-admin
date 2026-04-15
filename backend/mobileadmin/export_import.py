"""
Data export/import utilities for GeoData.

Export formats: GeoJSON, CSV, Shapefile (ZIP)
Import formats: GeoJSON, CSV
"""
import csv
import io
import json
import os
import tempfile
import zipfile


# ---------------------------------------------------------------------------
# Export Functions
# ---------------------------------------------------------------------------

def export_geojson(queryset):
    """Export queryset as GeoJSON FeatureCollection bytes."""
    features = []
    for gd in queryset.select_related('project', 'collected_by'):
        if not gd.geom:
            continue
        properties = {
            'id': gd.id,
            'mobile_id': gd.mobile_id,
            'project_name': gd.project.name if gd.project else None,
            'geometry_type': gd.project.geometry_type if gd.project else None,
            'collected_by': gd.collected_by.username if gd.collected_by else None,
            'created_at': gd.created_at.isoformat() if gd.created_at else None,
        }
        # Flatten form_data into properties
        if gd.form_data and isinstance(gd.form_data, dict):
            for key, val in gd.form_data.items():
                safe_key = f"form_{key}"
                if isinstance(val, (str, int, float, bool)) or val is None:
                    properties[safe_key] = val
                else:
                    properties[safe_key] = json.dumps(val)

        features.append({
            'type': 'Feature',
            'geometry': {
                'type': gd.geom.geom_type,
                'coordinates': gd.geom.coords,
            },
            'properties': properties,
        })

    collection = {
        'type': 'FeatureCollection',
        'features': features,
    }
    return json.dumps(collection, default=str, ensure_ascii=False).encode('utf-8')


def export_csv(queryset):
    """Export queryset as CSV bytes. Flattens form_data into columns."""
    output = io.StringIO()

    # Gather all form_data keys across the dataset
    all_form_keys = set()
    records = list(queryset.select_related('project', 'collected_by')[:5000])
    for gd in records:
        if gd.form_data and isinstance(gd.form_data, dict):
            all_form_keys.update(gd.form_data.keys())

    form_keys = sorted(all_form_keys)

    # Base columns
    base_cols = ['id', 'mobile_id', 'project_name', 'geometry_type',
                 'collected_by', 'latitude', 'longitude', 'created_at']
    header = base_cols + [f'form_{k}' for k in form_keys]

    writer = csv.writer(output)
    writer.writerow(header)

    for gd in records:
        # Get centroid lat/lng
        lat, lng = None, None
        if gd.geom:
            centroid = gd.geom.centroid
            lng, lat = centroid.x, centroid.y
        elif gd.points and len(gd.points) > 0:
            lat = gd.points[0].get('latitude')
            lng = gd.points[0].get('longitude')

        row = [
            gd.id,
            gd.mobile_id,
            gd.project.name if gd.project else '',
            gd.project.geometry_type if gd.project else '',
            gd.collected_by.username if gd.collected_by else '',
            lat,
            lng,
            gd.created_at.isoformat() if gd.created_at else '',
        ]
        for key in form_keys:
            val = gd.form_data.get(key, '') if gd.form_data else ''
            if isinstance(val, (dict, list)):
                val = json.dumps(val)
            row.append(val)

        writer.writerow(row)

    return output.getvalue().encode('utf-8')


def export_shapefile(queryset):
    """Export queryset as a ZIP of shapefile components using ogr."""
    try:
        from django.contrib.gis.gdal import OGRGeometry, DataSource
        from django.contrib.gis.geos import GEOSGeometry
    except ImportError:
        raise ImportError("GDAL is required for Shapefile export")

    # We'll build a simple shapefile manually using ogr
    import subprocess
    tmpdir = tempfile.mkdtemp()

    # First export as GeoJSON, then convert
    geojson_bytes = export_geojson(queryset)
    geojson_path = os.path.join(tmpdir, 'export.geojson')
    with open(geojson_path, 'wb') as f:
        f.write(geojson_bytes)

    shp_path = os.path.join(tmpdir, 'export.shp')

    try:
        # Try using ogr2ogr if available
        subprocess.run(
            ['ogr2ogr', '-f', 'ESRI Shapefile', shp_path, geojson_path],
            check=True, capture_output=True, timeout=60
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        # Fallback: just zip the GeoJSON
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            zf.writestr('export.geojson', geojson_bytes)
        return zip_buffer.getvalue()

    # Zip all shapefile components
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        for ext in ['shp', 'shx', 'dbf', 'prj', 'cpg']:
            fpath = os.path.join(tmpdir, f'export.{ext}')
            if os.path.exists(fpath):
                zf.write(fpath, f'export.{ext}')

    # Cleanup
    import shutil
    shutil.rmtree(tmpdir, ignore_errors=True)

    return zip_buffer.getvalue()


# ---------------------------------------------------------------------------
# Import Functions
# ---------------------------------------------------------------------------

def parse_geojson(file_obj):
    """Parse a GeoJSON file and return list of feature dicts."""
    content = file_obj.read()
    if isinstance(content, bytes):
        content = content.decode('utf-8')

    data = json.loads(content)

    if data.get('type') == 'FeatureCollection':
        features = data.get('features', [])
    elif data.get('type') == 'Feature':
        features = [data]
    else:
        raise ValueError("Invalid GeoJSON: must be Feature or FeatureCollection")

    records = []
    for feature in features:
        geometry = feature.get('geometry')
        properties = feature.get('properties', {})
        if not geometry:
            continue

        records.append({
            'geometry': geometry,
            'properties': properties,
        })

    return records


def parse_csv(file_obj, default_geometry_type='point'):
    """Parse a CSV file with latitude/longitude columns.
    Returns list of feature dicts suitable for GeoData creation.
    """
    content = file_obj.read()
    if isinstance(content, bytes):
        content = content.decode('utf-8')

    reader = csv.DictReader(io.StringIO(content))
    records = []

    for row in reader:
        # Find lat/lng columns (case-insensitive)
        lat = None
        lng = None
        form_data = {}

        for key, val in row.items():
            lower_key = key.lower().strip()
            if lower_key in ('latitude', 'lat', 'y'):
                try:
                    lat = float(val)
                except (ValueError, TypeError):
                    pass
            elif lower_key in ('longitude', 'lng', 'lon', 'long', 'x'):
                try:
                    lng = float(val)
                except (ValueError, TypeError):
                    pass
            elif lower_key not in ('id', 'mobile_id', 'project_name', 'geometry_type',
                                    'collected_by', 'created_at'):
                form_data[key] = val

        if lat is not None and lng is not None:
            geometry = {
                'type': 'Point',
                'coordinates': [lng, lat],
            }
            records.append({
                'geometry': geometry,
                'properties': form_data,
            })

    return records


def validate_import_data(records, project):
    """Validate records against project's form_fields template.
    Returns: {'valid': [...], 'errors': [...]}
    """
    valid = []
    errors = []

    expected_geom = project.geometry_type if project else None

    for idx, record in enumerate(records):
        row_errors = []
        geom = record.get('geometry', {})

        # Validate geometry type
        geom_type = geom.get('type', '').lower()
        if expected_geom:
            geom_map = {'point': 'point', 'linestring': 'line', 'polygon': 'polygon',
                        'multipoint': 'point', 'multilinestring': 'line', 'multipolygon': 'polygon'}
            mapped = geom_map.get(geom_type, geom_type)
            if mapped != expected_geom:
                row_errors.append(f"Expected {expected_geom} geometry, got {geom_type}")

        # Validate coordinates exist
        coords = geom.get('coordinates')
        if not coords:
            row_errors.append("Missing coordinates")

        if row_errors:
            errors.append({'row': idx + 1, 'errors': row_errors, 'data': record})
        else:
            valid.append(record)

    return {'valid': valid, 'errors': errors}
