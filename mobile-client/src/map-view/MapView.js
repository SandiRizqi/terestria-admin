import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDataProvider, Title } from 'react-admin';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import RoomIcon from '@material-ui/icons/Room';
import LayersIcon from '@material-ui/icons/Layers';
import SearchIcon from '@material-ui/icons/Search';
import EditIcon from '@material-ui/icons/Edit';
import { makeStyles } from '@material-ui/core/styles';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';
import LayerControlPanel from './LayerControlPanel';
import RadiusSearchControl from './RadiusSearchControl';
import DrawControl from './DrawControl';

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)',
    },
    controls: {
        padding: '12px 24px',
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e0ece0',
        flexWrap: 'wrap',
    },
    formControl: {
        minWidth: 280,
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f6faf6',
        border: 'none',
        boxShadow: 'none',
    },
    placeholderIcon: {
        fontSize: 64,
        color: '#c8e6c9',
        marginBottom: 16,
    },
    detailPanel: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 340,
        maxHeight: 'calc(100% - 32px)',
        overflowY: 'auto',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 10,
    },
    detailHeader: {
        padding: '16px 20px 12px',
        borderBottom: '1px solid #e0ece0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailTitle: {
        fontWeight: 700,
        color: '#1b5e20',
        fontSize: 15,
    },
    detailClose: {
        cursor: 'pointer',
        color: '#9ab89a',
        fontSize: 20,
        fontWeight: 700,
        border: 'none',
        background: 'none',
        padding: '0 4px',
        '&:hover': { color: '#388e3c' },
    },
    detailBody: {
        padding: '12px 20px 16px',
    },
    detailRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '6px 0',
        borderBottom: '1px solid #f0f5f0',
        fontSize: 13,
    },
    detailKey: {
        color: '#6b8f6b',
        fontWeight: 600,
        flex: '0 0 auto',
        marginRight: 12,
    },
    detailValue: {
        color: '#1a2e1a',
        textAlign: 'right',
        wordBreak: 'break-word',
    },
    editButton: {
        display: 'block',
        width: '100%',
        padding: '10px 0',
        marginTop: 12,
        backgroundColor: '#388e3c',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        fontWeight: 700,
        fontSize: 14,
        cursor: 'pointer',
        textAlign: 'center',
        textDecoration: 'none',
        fontFamily: 'inherit',
    },
    orLabel: {
        color: '#9ab89a',
        fontWeight: 600,
        fontSize: 13,
        alignSelf: 'center',
    },
    toolbarButtons: {
        display: 'flex',
        gap: 4,
        marginLeft: 'auto',
    },
    toolButton: {
        backgroundColor: '#ffffff',
        border: '1px solid #e0ece0',
        borderRadius: 8,
        '&:hover': {
            backgroundColor: '#e8f5e9',
        },
    },
});

const MapView = () => {
    const classes = useStyles();
    const dataProvider = useDataProvider();
    const [projects, setProjects] = useState([]);
    const [projectGroups, setProjectGroups] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [showLayers, setShowLayers] = useState(false);
    const [showRadiusSearch, setShowRadiusSearch] = useState(false);
    const [showDraw, setShowDraw] = useState(false);
    const [layers, setLayers] = useState({ points: true, lines: true, polygons: true });
    const [heatmapEnabled, setHeatmapEnabled] = useState(false);
    const [polygonOpacity, setPolygonOpacity] = useState(0.25);
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);

    // Fetch projects and project groups
    useEffect(() => {
        dataProvider.getList('projects', {
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'name', order: 'ASC' },
            filter: {},
        }).then(({ data }) => setProjects(data))
          .catch(() => {});

        dataProvider.getList('project-groups', {
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'name', order: 'ASC' },
            filter: {},
        }).then(({ data }) => setProjectGroups(data))
          .catch(() => {});
    }, [dataProvider]);

    const handleFeatureClick = useCallback((feature) => {
        if (!feature || !feature.properties) return;
        const props = feature.properties;

        let formData = {};
        if (props.form_data_text) {
            try {
                formData = JSON.parse(props.form_data_text);
            } catch (e) {
                formData = { data: props.form_data_text };
            }
        }

        setSelectedFeature({
            id: props.gid,
            mobile_id: props.mobile_id,
            project_name: props.project_name,
            geometry_type: props.geometry_type,
            formData,
        });
        setShowRadiusSearch(false);
    }, []);

    // Build the tile URL param based on selection
    const tileParam = selectedProject
        ? `project_id=${selectedProject}`
        : selectedGroup
        ? `group_id=${selectedGroup}`
        : null;

    // Initialize/recreate map when selection changes
    useEffect(() => {
        if (!tileParam || !mapContainerRef.current) return;

        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }

        const token = localStorage.getItem('token');

        const map = new maplibregl.Map({
            container: mapContainerRef.current,
            style: {
                version: 8,
                sources: {
                    osm: {
                        type: 'raster',
                        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                        tileSize: 256,
                        attribution: '&copy; OpenStreetMap contributors',
                    },
                    geodata: {
                        type: 'vector',
                        tiles: [`${window.location.origin}/api/mobile/tiles/{z}/{x}/{y}.pbf?${tileParam}`],
                        maxzoom: 18,
                    },
                },
                layers: [
                    { id: 'osm', type: 'raster', source: 'osm' },
                    // Polygon fill
                    {
                        id: 'geodata-polygon',
                        type: 'fill',
                        source: 'geodata',
                        'source-layer': 'geodata',
                        filter: ['==', '$type', 'Polygon'],
                        paint: {
                            'fill-color': '#4caf50',
                            'fill-opacity': 0.25,
                        },
                    },
                    // Polygon outline
                    {
                        id: 'geodata-polygon-outline',
                        type: 'line',
                        source: 'geodata',
                        'source-layer': 'geodata',
                        filter: ['==', '$type', 'Polygon'],
                        paint: {
                            'line-color': '#2e7d32',
                            'line-width': 2,
                        },
                    },
                    // Lines
                    {
                        id: 'geodata-line',
                        type: 'line',
                        source: 'geodata',
                        'source-layer': 'geodata',
                        filter: ['==', '$type', 'LineString'],
                        paint: {
                            'line-color': '#1565c0',
                            'line-width': 3,
                        },
                    },
                    // Points
                    {
                        id: 'geodata-point',
                        type: 'circle',
                        source: 'geodata',
                        'source-layer': 'geodata',
                        filter: ['==', '$type', 'Point'],
                        paint: {
                            'circle-radius': 7,
                            'circle-color': '#e53935',
                            'circle-stroke-width': 2,
                            'circle-stroke-color': '#ffffff',
                        },
                    },
                    // Heatmap layer (hidden by default)
                    {
                        id: 'geodata-heatmap',
                        type: 'heatmap',
                        source: 'geodata',
                        'source-layer': 'geodata',
                        filter: ['==', '$type', 'Point'],
                        layout: {
                            visibility: 'none',
                        },
                        paint: {
                            'heatmap-weight': 1,
                            'heatmap-intensity': [
                                'interpolate', ['linear'], ['zoom'],
                                0, 1,
                                18, 3,
                            ],
                            'heatmap-color': [
                                'interpolate', ['linear'], ['heatmap-density'],
                                0, 'rgba(33,102,172,0)',
                                0.2, 'rgb(103,169,207)',
                                0.4, 'rgb(209,229,240)',
                                0.6, 'rgb(253,219,199)',
                                0.8, 'rgb(239,138,98)',
                                1, 'rgb(178,24,43)',
                            ],
                            'heatmap-radius': [
                                'interpolate', ['linear'], ['zoom'],
                                0, 2,
                                18, 30,
                            ],
                            'heatmap-opacity': 0.8,
                        },
                    },
                ],
            },
            center: [110.5, -2.5],
            zoom: 10,
            transformRequest: (url) => {
                if (url.includes('/api/mobile/tiles/') && token) {
                    return { url, headers: { Authorization: `Token ${token}` } };
                }
                return { url };
            },
        });

        map.addControl(new maplibregl.NavigationControl(), 'top-left');

        const clickLayers = ['geodata-point', 'geodata-line', 'geodata-polygon'];

        map.on('click', clickLayers, (e) => {
            if (e.features && e.features.length > 0) {
                handleFeatureClick(e.features[0]);
            }
        });

        map.on('mouseenter', clickLayers, () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', clickLayers, () => {
            map.getCanvas().style.cursor = '';
        });

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [tileParam, handleFeatureClick]);

    // Cleanup on deselect
    useEffect(() => {
        if (!tileParam) {
            setSelectedFeature(null);
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        }
    }, [tileParam]);

    // Layer toggle handler
    const handleLayerToggle = useCallback((layerType) => {
        setLayers((prev) => {
            const newState = { ...prev, [layerType]: !prev[layerType] };
            const map = mapRef.current;
            if (!map) return newState;

            const visibility = newState[layerType] ? 'visible' : 'none';

            if (layerType === 'points') {
                if (map.getLayer('geodata-point')) map.setLayoutProperty('geodata-point', 'visibility', visibility);
            } else if (layerType === 'lines') {
                if (map.getLayer('geodata-line')) map.setLayoutProperty('geodata-line', 'visibility', visibility);
            } else if (layerType === 'polygons') {
                if (map.getLayer('geodata-polygon')) map.setLayoutProperty('geodata-polygon', 'visibility', visibility);
                if (map.getLayer('geodata-polygon-outline')) map.setLayoutProperty('geodata-polygon-outline', 'visibility', visibility);
            }

            return newState;
        });
    }, []);

    // Heatmap toggle handler
    const handleHeatmapToggle = useCallback(() => {
        setHeatmapEnabled((prev) => {
            const newVal = !prev;
            const map = mapRef.current;
            if (!map) return newVal;

            if (map.getLayer('geodata-heatmap')) {
                map.setLayoutProperty('geodata-heatmap', 'visibility', newVal ? 'visible' : 'none');
            }
            // When heatmap is on, optionally hide points so they don't overlap
            if (map.getLayer('geodata-point')) {
                map.setLayoutProperty('geodata-point', 'visibility', newVal ? 'none' : (layers.points ? 'visible' : 'none'));
            }

            return newVal;
        });
    }, [layers.points]);

    // Polygon opacity handler
    const handleOpacityChange = useCallback((val) => {
        setPolygonOpacity(val);
        const map = mapRef.current;
        if (map && map.getLayer('geodata-polygon')) {
            map.setPaintProperty('geodata-polygon', 'fill-opacity', val);
        }
    }, []);

    // Handle feature select from radius search results
    const handleRadiusFeatureSelect = useCallback((feature) => {
        if (feature && feature.geometry) {
            const coords = feature.geometry.coordinates;
            const map = mapRef.current;
            if (map) {
                if (feature.geometry.type === 'Point') {
                    map.flyTo({ center: coords, zoom: 16 });
                } else {
                    // For lines/polygons, get centroid
                    try {
                        const centroid = turf.centroid(feature);
                        map.flyTo({ center: centroid.geometry.coordinates, zoom: 16 });
                    } catch (e) {
                        // Fallback for multi-coordinates
                        const flat = coords.flat(Infinity);
                        if (flat.length >= 2) {
                            map.flyTo({ center: [flat[0], flat[1]], zoom: 16 });
                        }
                    }
                }
            }
        }
        if (feature && feature.properties) {
            handleFeatureClick(feature);
        }
    }, [handleFeatureClick]);

    const handleProjectChange = (e) => {
        setSelectedProject(e.target.value);
        setSelectedGroup('');
        setSelectedFeature(null);
    };

    const handleGroupChange = (e) => {
        setSelectedGroup(e.target.value);
        setSelectedProject('');
        setSelectedFeature(null);
    };

    const hasSelection = selectedProject || selectedGroup;

    return (
        <div className={classes.root}>
            <Title title="Map View" />
            <div className={classes.controls}>
                <FormControl className={classes.formControl} variant="outlined" size="small">
                    <InputLabel>Select Project</InputLabel>
                    <Select
                        value={selectedProject}
                        onChange={handleProjectChange}
                        label="Select Project"
                    >
                        <MenuItem value=""><em>-- Select Project --</em></MenuItem>
                        {projects.map((p) => (
                            <MenuItem key={p.id} value={p.mobile_id}>
                                {p.name} ({p.geometry_type})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <span className={classes.orLabel}>OR</span>
                <FormControl className={classes.formControl} variant="outlined" size="small">
                    <InputLabel>Select Project Group</InputLabel>
                    <Select
                        value={selectedGroup}
                        onChange={handleGroupChange}
                        label="Select Project Group"
                    >
                        <MenuItem value=""><em>-- Select Group --</em></MenuItem>
                        {projectGroups.map((g) => (
                            <MenuItem key={g.id} value={g.id}>
                                {g.name} ({g.project_count} projects)
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {hasSelection && (
                    <div className={classes.toolbarButtons}>
                        <Tooltip title="Layer Controls">
                            <IconButton
                                className={classes.toolButton}
                                size="small"
                                onClick={() => { setShowLayers(!showLayers); setShowRadiusSearch(false); }}
                                style={showLayers ? { backgroundColor: '#e8f5e9', borderColor: '#388e3c' } : {}}
                            >
                                <LayersIcon style={{ color: '#388e3c', fontSize: 20 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Radius Search">
                            <IconButton
                                className={classes.toolButton}
                                size="small"
                                onClick={() => { setShowRadiusSearch(!showRadiusSearch); setShowLayers(false); setSelectedFeature(null); }}
                                style={showRadiusSearch ? { backgroundColor: '#fff3e0', borderColor: '#e65100' } : {}}
                            >
                                <SearchIcon style={{ color: '#e65100', fontSize: 20 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Draw Geometry">
                            <IconButton
                                className={classes.toolButton}
                                size="small"
                                onClick={() => { setShowDraw(!showDraw); setShowLayers(false); setShowRadiusSearch(false); }}
                                style={showDraw ? { backgroundColor: '#e3f2fd', borderColor: '#1565c0' } : {}}
                            >
                                <EditIcon style={{ color: '#1565c0', fontSize: 20 }} />
                            </IconButton>
                        </Tooltip>
                    </div>
                )}
            </div>
            <div className={classes.mapContainer}>
                {hasSelection ? (
                    <>
                        <div ref={mapContainerRef} className={classes.map} />

                        {/* Layer Control Panel */}
                        <LayerControlPanel
                            map={mapRef.current}
                            visible={showLayers}
                            onClose={() => setShowLayers(false)}
                            layers={layers}
                            onToggle={handleLayerToggle}
                            heatmapEnabled={heatmapEnabled}
                            onHeatmapToggle={handleHeatmapToggle}
                            opacity={polygonOpacity}
                            onOpacityChange={handleOpacityChange}
                        />

                        {/* Radius Search Control */}
                        <RadiusSearchControl
                            map={mapRef.current}
                            visible={showRadiusSearch}
                            onClose={() => setShowRadiusSearch(false)}
                            onFeatureSelect={handleRadiusFeatureSelect}
                        />

                        {/* Draw Control */}
                        <DrawControl
                            map={mapRef.current}
                            visible={showDraw}
                            onClose={() => setShowDraw(false)}
                            projects={projects}
                            onSave={() => {
                                // Reload tiles by recreating the source
                                const map = mapRef.current;
                                if (map && map.getSource('geodata')) {
                                    const source = map.getSource('geodata');
                                    const tiles = source._options && source._options.tiles;
                                    if (tiles) {
                                        source.setTiles(tiles.map((t) => t + '&_t=' + Date.now()));
                                    }
                                }
                            }}
                        />

                        {/* Feature Detail Panel */}
                        {selectedFeature && !showRadiusSearch && (
                            <div className={classes.detailPanel}>
                                <div className={classes.detailHeader}>
                                    <span className={classes.detailTitle}>
                                        {selectedFeature.project_name || 'GeoData'} #{selectedFeature.id}
                                    </span>
                                    <button
                                        className={classes.detailClose}
                                        onClick={() => setSelectedFeature(null)}
                                    >
                                        &times;
                                    </button>
                                </div>
                                <div className={classes.detailBody}>
                                    <div className={classes.detailRow}>
                                        <span className={classes.detailKey}>ID</span>
                                        <span className={classes.detailValue}>{selectedFeature.id}</span>
                                    </div>
                                    {selectedFeature.mobile_id && (
                                        <div className={classes.detailRow}>
                                            <span className={classes.detailKey}>Mobile ID</span>
                                            <span className={classes.detailValue} style={{ fontSize: 11 }}>
                                                {selectedFeature.mobile_id}
                                            </span>
                                        </div>
                                    )}
                                    <div className={classes.detailRow}>
                                        <span className={classes.detailKey}>Type</span>
                                        <span className={classes.detailValue}>{selectedFeature.geometry_type}</span>
                                    </div>
                                    {Object.entries(selectedFeature.formData).map(([key, val]) => (
                                        <div key={key} className={classes.detailRow}>
                                            <span className={classes.detailKey}>{key}</span>
                                            <span className={classes.detailValue}>
                                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                            </span>
                                        </div>
                                    ))}
                                    <a
                                        href={`#/geodata/${selectedFeature.id}`}
                                        className={classes.editButton}
                                    >
                                        View / Edit GeoData
                                    </a>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <Card className={classes.placeholder}>
                        <CardContent style={{ textAlign: 'center' }}>
                            <RoomIcon className={classes.placeholderIcon} />
                            <Typography variant="h6" style={{ color: '#6b8f6b', fontWeight: 600 }}>
                                Select a project or group to view data on the map
                            </Typography>
                            <Typography variant="body2" style={{ color: '#9ab89a', marginTop: 8 }}>
                                Vector tiles will be loaded for the selected project or all projects in the group
                            </Typography>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default MapView;
