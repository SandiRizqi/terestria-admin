import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import MyLocationIcon from '@material-ui/icons/MyLocation';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import * as turf from '@turf/turf';

const useStyles = makeStyles({
    root: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 300,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 10,
        maxHeight: 'calc(100% - 32px)',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px 8px',
        borderBottom: '1px solid #e0ece0',
    },
    title: {
        fontWeight: 700,
        color: '#1b5e20',
        fontSize: 14,
    },
    body: {
        padding: '12px 16px',
    },
    instructions: {
        fontSize: 12,
        color: '#6b8f6b',
        marginBottom: 8,
    },
    coordDisplay: {
        fontSize: 11,
        color: '#388e3c',
        fontFamily: 'monospace',
        marginBottom: 8,
    },
    sliderLabel: {
        fontSize: 12,
        color: '#6b8f6b',
        marginTop: 8,
    },
    searchBtn: {
        marginTop: 12,
        width: '100%',
    },
    results: {
        borderTop: '1px solid #e0ece0',
        overflowY: 'auto',
        maxHeight: 300,
    },
    resultCount: {
        fontSize: 11,
        fontWeight: 700,
        color: '#6b8f6b',
        padding: '8px 16px 0',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
    },
});

const RadiusSearchControl = ({ map, visible, onClose, onFeatureSelect }) => {
    const classes = useStyles();
    const [center, setCenter] = useState(null);
    const [radius, setRadius] = useState(500);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [clickMode, setClickMode] = useState(false);

    if (!visible || !map) return null;

    const enableClickMode = () => {
        setClickMode(true);
        map.getCanvas().style.cursor = 'crosshair';

        const handleClick = (e) => {
            const { lng, lat } = e.lngLat;
            setCenter([lng, lat]);
            setClickMode(false);
            map.getCanvas().style.cursor = '';
            map.off('click', handleClick);

            // Draw circle on map
            drawCircle(lng, lat, radius);
        };

        map.on('click', handleClick);
    };

    const drawCircle = (lng, lat, radiusM) => {
        const circle = turf.circle([lng, lat], radiusM / 1000, { units: 'kilometers', steps: 64 });

        if (map.getSource('radius-circle')) {
            map.getSource('radius-circle').setData(circle);
        } else {
            map.addSource('radius-circle', { type: 'geojson', data: circle });
            map.addLayer({
                id: 'radius-circle-fill',
                type: 'fill',
                source: 'radius-circle',
                paint: {
                    'fill-color': '#e65100',
                    'fill-opacity': 0.1,
                },
            });
            map.addLayer({
                id: 'radius-circle-outline',
                type: 'line',
                source: 'radius-circle',
                paint: {
                    'line-color': '#e65100',
                    'line-width': 2,
                    'line-dasharray': [3, 2],
                },
            });
        }
    };

    const handleRadiusChange = (e, val) => {
        setRadius(val);
        if (center) {
            drawCircle(center[0], center[1], val);
        }
    };

    const handleSearch = async () => {
        if (!center) return;
        setLoading(true);

        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
            lng: center[0],
            lat: center[1],
            radius_m: radius,
        });

        try {
            const response = await fetch(`/api/mobile/spatial-query/?${params}`, {
                headers: { Authorization: `Token ${token}` },
            });
            const data = await response.json();
            setResults(data.features || []);
        } catch (e) {
            console.error('Spatial query failed:', e);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        // Cleanup circle layer
        if (map.getLayer('radius-circle-fill')) map.removeLayer('radius-circle-fill');
        if (map.getLayer('radius-circle-outline')) map.removeLayer('radius-circle-outline');
        if (map.getSource('radius-circle')) map.removeSource('radius-circle');
        setCenter(null);
        setResults([]);
        onClose();
    };

    return (
        <div className={classes.root}>
            <div className={classes.header}>
                <span className={classes.title}>Radius Search</span>
                <IconButton size="small" onClick={handleClose}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </div>
            <div className={classes.body}>
                <div className={classes.instructions}>
                    {clickMode
                        ? 'Click on the map to set the center point...'
                        : 'Set a center point, then search for nearby features.'
                    }
                </div>

                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<MyLocationIcon />}
                    onClick={enableClickMode}
                    disabled={clickMode}
                    fullWidth
                    style={{ marginBottom: 8, color: '#e65100', borderColor: '#e65100' }}
                >
                    {center ? 'Reset Center Point' : 'Set Center Point'}
                </Button>

                {center && (
                    <div className={classes.coordDisplay}>
                        {center[1].toFixed(6)}, {center[0].toFixed(6)}
                    </div>
                )}

                <Typography className={classes.sliderLabel}>
                    Radius: {radius >= 1000 ? `${(radius / 1000).toFixed(1)} km` : `${radius} m`}
                </Typography>
                <Slider
                    value={radius}
                    onChange={handleRadiusChange}
                    min={50}
                    max={10000}
                    step={50}
                    style={{ color: '#e65100' }}
                />

                <Button
                    variant="contained"
                    size="small"
                    onClick={handleSearch}
                    disabled={!center || loading}
                    fullWidth
                    className={classes.searchBtn}
                    style={{ backgroundColor: center ? '#e65100' : undefined, color: center ? '#fff' : undefined }}
                >
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Search'}
                </Button>
            </div>

            {results.length > 0 && (
                <div className={classes.results}>
                    <div className={classes.resultCount}>{results.length} features found</div>
                    <List dense>
                        {results.map((feature, i) => (
                            <ListItem
                                key={i}
                                button
                                onClick={() => onFeatureSelect && onFeatureSelect(feature)}
                            >
                                <ListItemText
                                    primary={feature.properties?.project_name || `Feature #${feature.properties?.gid || i}`}
                                    secondary={`${feature.geometry?.type || 'Unknown'} · ID: ${feature.properties?.gid || '-'}`}
                                    primaryTypographyProps={{ style: { fontSize: 13, fontWeight: 600 } }}
                                    secondaryTypographyProps={{ style: { fontSize: 11 } }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </div>
            )}
        </div>
    );
};

export default RadiusSearchControl;
