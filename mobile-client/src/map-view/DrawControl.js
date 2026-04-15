import React, { useState, useEffect, useRef } from 'react';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import AddLocationIcon from '@material-ui/icons/AddLocation';
import TimelineIcon from '@material-ui/icons/Timeline';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    root: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 10,
        padding: '12px 16px',
        width: 260,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontWeight: 700,
        color: '#1b5e20',
        fontSize: 14,
    },
    drawButtons: {
        display: 'flex',
        gap: 8,
        marginBottom: 12,
    },
    drawBtn: {
        flex: 1,
        fontSize: 11,
        textTransform: 'none',
    },
    instructions: {
        fontSize: 12,
        color: '#6b8f6b',
        marginBottom: 8,
    },
    coordsList: {
        maxHeight: 120,
        overflowY: 'auto',
        fontSize: 11,
        fontFamily: 'monospace',
        color: '#388e3c',
        marginBottom: 8,
    },
});

/**
 * Simple draw control for MapLibre GL JS.
 * Supports placing a single point or drawing a polyline by clicking vertices.
 * Polygons can be drawn as closed polylines (first point = last point auto-close).
 */
const DrawControl = ({ map, visible, onClose, projects, onSave }) => {
    const classes = useStyles();
    const [drawMode, setDrawMode] = useState(null); // 'point' | 'line' | null
    const [coords, setCoords] = useState([]);
    const [projectId, setProjectId] = useState('');
    const [saving, setSaving] = useState(false);
    const clickHandlerRef = useRef(null);

    // Cleanup draw state
    useEffect(() => {
        return () => {
            if (map && clickHandlerRef.current) {
                map.off('click', clickHandlerRef.current);
            }
        };
    }, [map]);

    if (!visible || !map) return null;

    const startDraw = (mode) => {
        // Remove previous handler
        if (clickHandlerRef.current) {
            map.off('click', clickHandlerRef.current);
        }

        setDrawMode(mode);
        setCoords([]);
        map.getCanvas().style.cursor = 'crosshair';

        // Clean previous draw markers
        cleanDrawLayer();

        const handler = (e) => {
            const { lng, lat } = e.lngLat;

            if (mode === 'point') {
                setCoords([[lng, lat]]);
                updateDrawLayer('Point', [[lng, lat]]);
                map.getCanvas().style.cursor = '';
                map.off('click', handler);
                clickHandlerRef.current = null;
            } else {
                setCoords((prev) => {
                    const newCoords = [...prev, [lng, lat]];
                    updateDrawLayer('LineString', newCoords);
                    return newCoords;
                });
            }
        };

        clickHandlerRef.current = handler;
        map.on('click', handler);
    };

    const finishLine = () => {
        if (clickHandlerRef.current) {
            map.off('click', clickHandlerRef.current);
            clickHandlerRef.current = null;
        }
        map.getCanvas().style.cursor = '';
        setDrawMode(null);
    };

    const cleanDrawLayer = () => {
        if (map.getLayer('draw-preview-point')) map.removeLayer('draw-preview-point');
        if (map.getLayer('draw-preview-line')) map.removeLayer('draw-preview-line');
        if (map.getSource('draw-preview')) map.removeSource('draw-preview');
    };

    const updateDrawLayer = (type, coordinates) => {
        let geometry;
        if (type === 'Point') {
            geometry = { type: 'Point', coordinates: coordinates[0] };
        } else {
            geometry = { type: 'LineString', coordinates };
        }

        const geojson = { type: 'Feature', geometry, properties: {} };

        if (map.getSource('draw-preview')) {
            map.getSource('draw-preview').setData(geojson);
        } else {
            map.addSource('draw-preview', { type: 'geojson', data: geojson });
            map.addLayer({
                id: 'draw-preview-point',
                type: 'circle',
                source: 'draw-preview',
                filter: ['==', '$type', 'Point'],
                paint: {
                    'circle-radius': 8,
                    'circle-color': '#e65100',
                    'circle-stroke-width': 3,
                    'circle-stroke-color': '#ffffff',
                },
            });
            map.addLayer({
                id: 'draw-preview-line',
                type: 'line',
                source: 'draw-preview',
                filter: ['==', '$type', 'LineString'],
                paint: {
                    'line-color': '#e65100',
                    'line-width': 3,
                    'line-dasharray': [3, 2],
                },
            });
        }
    };

    const handleSave = async () => {
        if (!coords.length || !projectId) return;
        setSaving(true);

        const token = localStorage.getItem('token');
        let geometry;
        if (coords.length === 1) {
            geometry = { type: 'Point', coordinates: coords[0] };
        } else {
            geometry = { type: 'LineString', coordinates: coords };
        }

        try {
            const response = await fetch('/api/mobile/geodata/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify({
                    project_mobile_id: projectId,
                    geom: geometry,
                    form_data: {},
                }),
            });

            if (response.ok) {
                cleanDrawLayer();
                setCoords([]);
                setDrawMode(null);
                if (onSave) onSave();
            }
        } catch (e) {
            console.error('Failed to save geometry:', e);
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        cleanDrawLayer();
        if (clickHandlerRef.current) {
            map.off('click', clickHandlerRef.current);
            clickHandlerRef.current = null;
        }
        map.getCanvas().style.cursor = '';
        setDrawMode(null);
        setCoords([]);
        onClose();
    };

    return (
        <div className={classes.root}>
            <div className={classes.header}>
                <span className={classes.title}>Draw Geometry</span>
                <IconButton size="small" onClick={handleClose}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </div>

            <div className={classes.instructions}>
                {drawMode === 'point' && 'Click on the map to place a point.'}
                {drawMode === 'line' && `Click to add vertices. ${coords.length} point(s) placed.`}
                {!drawMode && coords.length === 0 && 'Choose a draw mode to start.'}
                {!drawMode && coords.length > 0 && 'Ready to save.'}
            </div>

            <div className={classes.drawButtons}>
                <Button
                    variant={drawMode === 'point' ? 'contained' : 'outlined'}
                    size="small"
                    className={classes.drawBtn}
                    startIcon={<AddLocationIcon />}
                    onClick={() => startDraw('point')}
                    style={drawMode === 'point' ? { backgroundColor: '#e65100', color: '#fff' } : { borderColor: '#e65100', color: '#e65100' }}
                >
                    Point
                </Button>
                <Button
                    variant={drawMode === 'line' ? 'contained' : 'outlined'}
                    size="small"
                    className={classes.drawBtn}
                    startIcon={<TimelineIcon />}
                    onClick={() => startDraw('line')}
                    style={drawMode === 'line' ? { backgroundColor: '#1565c0', color: '#fff' } : { borderColor: '#1565c0', color: '#1565c0' }}
                >
                    Line
                </Button>
            </div>

            {drawMode === 'line' && coords.length >= 2 && (
                <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={finishLine}
                    style={{ marginBottom: 8, borderColor: '#388e3c', color: '#388e3c' }}
                >
                    Finish Drawing ({coords.length} pts)
                </Button>
            )}

            {coords.length > 0 && (
                <div className={classes.coordsList}>
                    {coords.map((c, i) => (
                        <div key={i}>{i + 1}. [{c[0].toFixed(6)}, {c[1].toFixed(6)}]</div>
                    ))}
                </div>
            )}

            {coords.length > 0 && !drawMode && (
                <>
                    <FormControl fullWidth variant="outlined" size="small" style={{ marginBottom: 8 }}>
                        <InputLabel>Save to Project</InputLabel>
                        <Select
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            label="Save to Project"
                        >
                            {(projects || []).map((p) => (
                                <MenuItem key={p.id} value={p.mobile_id}>{p.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        onClick={handleSave}
                        disabled={!projectId || saving}
                        style={{ backgroundColor: '#388e3c', color: '#fff' }}
                    >
                        {saving ? <CircularProgress size={18} color="inherit" /> : 'Save GeoData'}
                    </Button>
                </>
            )}
        </div>
    );
};

export default DrawControl;
