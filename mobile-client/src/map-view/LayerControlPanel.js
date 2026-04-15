import React from 'react';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    root: {
        position: 'absolute',
        top: 16,
        left: 56,
        width: 240,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 10,
        padding: '12px 16px',
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
    section: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 700,
        color: '#6b8f6b',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 4,
    },
    switchLabel: {
        '& .MuiFormControlLabel-label': {
            fontSize: 13,
        },
    },
    sliderLabel: {
        fontSize: 12,
        color: '#6b8f6b',
        marginTop: 4,
    },
});

const LayerControlPanel = ({ map, visible, onClose, layers, onToggle, heatmapEnabled, onHeatmapToggle, opacity, onOpacityChange }) => {
    const classes = useStyles();

    if (!visible || !map) return null;

    return (
        <div className={classes.root}>
            <div className={classes.header}>
                <span className={classes.title}>Layers</span>
                <IconButton size="small" onClick={onClose}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </div>

            <div className={classes.section}>
                <div className={classes.sectionTitle}>Feature Layers</div>
                <FormControlLabel
                    className={classes.switchLabel}
                    control={
                        <Switch
                            checked={layers.points}
                            onChange={() => onToggle('points')}
                            size="small"
                            style={{ color: '#e53935' }}
                        />
                    }
                    label="Points"
                />
                <FormControlLabel
                    className={classes.switchLabel}
                    control={
                        <Switch
                            checked={layers.lines}
                            onChange={() => onToggle('lines')}
                            size="small"
                            style={{ color: '#1565c0' }}
                        />
                    }
                    label="Lines"
                />
                <FormControlLabel
                    className={classes.switchLabel}
                    control={
                        <Switch
                            checked={layers.polygons}
                            onChange={() => onToggle('polygons')}
                            size="small"
                            style={{ color: '#2e7d32' }}
                        />
                    }
                    label="Polygons"
                />
            </div>

            <div className={classes.section}>
                <div className={classes.sectionTitle}>Visualization</div>
                <FormControlLabel
                    className={classes.switchLabel}
                    control={
                        <Switch
                            checked={heatmapEnabled}
                            onChange={onHeatmapToggle}
                            size="small"
                            style={{ color: '#e65100' }}
                        />
                    }
                    label="Heatmap"
                />
            </div>

            <div className={classes.section}>
                <Typography className={classes.sliderLabel}>Polygon Opacity</Typography>
                <Slider
                    value={opacity}
                    onChange={(e, val) => onOpacityChange(val)}
                    min={0}
                    max={1}
                    step={0.05}
                    size="small"
                    style={{ color: '#388e3c' }}
                />
            </div>
        </div>
    );
};

export default LayerControlPanel;
