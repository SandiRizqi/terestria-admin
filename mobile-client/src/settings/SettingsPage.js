import React, { useState, useEffect, useCallback } from 'react';
import { useDataProvider, useNotify, Title } from 'react-admin';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
// import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import SaveIcon from '@material-ui/icons/Save';
import PaletteIcon from '@material-ui/icons/Palette';
import MapIcon from '@material-ui/icons/Map';
import BrandingWatermarkIcon from '@material-ui/icons/BrandingWatermark';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: { padding: 24 },
    card: {
        borderRadius: 12,
        border: '1px solid #e0ece0',
        boxShadow: '0 2px 8px rgba(46,125,50,0.06)',
        marginBottom: 24,
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sectionIcon: {
        color: '#388e3c',
    },
    sectionTitle: {
        fontWeight: 700,
        color: '#1b5e20',
    },
    colorPreview: {
        display: 'inline-block',
        width: 32,
        height: 32,
        borderRadius: 6,
        border: '2px solid #e0ece0',
        verticalAlign: 'middle',
        marginRight: 8,
        cursor: 'pointer',
    },
    colorInput: {
        width: 0,
        height: 0,
        opacity: 0,
        position: 'absolute',
    },
    colorField: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    saveButton: {
        marginTop: 16,
    },
    previewBar: {
        height: 48,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        color: '#fff',
        fontWeight: 700,
        fontSize: 14,
        marginTop: 16,
    },
    previewSidebar: {
        height: 120,
        borderRadius: 8,
        padding: 16,
        color: '#e8f5e9',
        fontSize: 13,
        marginTop: 8,
    },
}));

const ColorField = ({ label, value, onChange, classes }) => {
    const inputId = `color-${label.replace(/\s/g, '')}`;
    return (
        <div className={classes.colorField}>
            <label htmlFor={inputId}>
                <div
                    className={classes.colorPreview}
                    style={{ backgroundColor: value }}
                />
            </label>
            <input
                id={inputId}
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={classes.colorInput}
            />
            <TextField
                label={label}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                size="small"
                variant="outlined"
                style={{ width: 140 }}
                inputProps={{ maxLength: 7 }}
            />
        </div>
    );
};

const SettingsPage = () => {
    const classes = useStyles();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadSettings = useCallback(async () => {
        try {
            const { data } = await dataProvider.getList('admin-settings', {
                pagination: { page: 1, perPage: 1 },
                sort: { field: 'id', order: 'ASC' },
                filter: {},
            });
            if (data && data.length > 0) {
                setSettings(data[0]);
            }
        } catch (e) {
            notify('Failed to load settings', 'error');
        } finally {
            setLoading(false);
        }
    }, [dataProvider, notify]);

    useEffect(() => { loadSettings(); }, [loadSettings]);

    const handleChange = (field) => (value) => {
        setSettings((prev) => ({ ...prev, [field]: typeof value === 'object' ? value.target.value : value }));
    };

    const handleTextChange = (field) => (e) => {
        setSettings((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { logo_image, logo_image_url, ...data } = settings;
            await dataProvider.update('admin-settings', {
                id: settings.id,
                data,
            });
            notify('Settings saved successfully');
        } catch (e) {
            notify('Failed to save settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
                <CircularProgress style={{ color: '#388e3c' }} />
            </div>
        );
    }

    if (!settings) {
        return (
            <div style={{ padding: 24 }}>
                <Typography color="error">Could not load settings. Make sure migrations have been run.</Typography>
            </div>
        );
    }

    return (
        <div className={classes.root}>
            <Title title="Admin Settings" />
            <Typography variant="h5" style={{ fontWeight: 800, color: '#1b5e20', marginBottom: 24 }}>
                Admin Settings
            </Typography>

            <Grid container spacing={3}>
                {/* Branding */}
                <Grid item xs={12} md={6}>
                    <Card className={classes.card}>
                        <CardContent>
                            <div className={classes.sectionHeader}>
                                <BrandingWatermarkIcon className={classes.sectionIcon} />
                                <Typography variant="h6" className={classes.sectionTitle}>Branding</Typography>
                            </div>
                            <TextField
                                label="Application Name"
                                value={settings.app_name || ''}
                                onChange={handleTextChange('app_name')}
                                fullWidth
                                variant="outlined"
                                size="small"
                                style={{ marginBottom: 16 }}
                            />
                            <TextField
                                label="Logo URL"
                                value={settings.logo_url || ''}
                                onChange={handleTextChange('logo_url')}
                                fullWidth
                                variant="outlined"
                                size="small"
                                placeholder="https://example.com/logo.png"
                                style={{ marginBottom: 16 }}
                            />
                            <TextField
                                label="Font Family"
                                value={settings.font_family || ''}
                                onChange={handleTextChange('font_family')}
                                fullWidth
                                variant="outlined"
                                size="small"
                            />

                            {/* Preview */}
                            <Box mt={3}>
                                <Typography variant="subtitle2" style={{ color: '#6b8f6b', marginBottom: 4 }}>
                                    Preview
                                </Typography>
                                <div
                                    className={classes.previewBar}
                                    style={{ backgroundColor: settings.primary_dark || '#2e7d32' }}
                                >
                                    {settings.app_name || 'Terestria Mobile Admin'}
                                </div>
                                <div
                                    className={classes.previewSidebar}
                                    style={{ backgroundColor: settings.sidebar_color || '#1b5e20' }}
                                >
                                    Sidebar preview
                                </div>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Colors */}
                <Grid item xs={12} md={6}>
                    <Card className={classes.card}>
                        <CardContent>
                            <div className={classes.sectionHeader}>
                                <PaletteIcon className={classes.sectionIcon} />
                                <Typography variant="h6" className={classes.sectionTitle}>Colors</Typography>
                            </div>
                            <ColorField label="Primary" value={settings.primary_color || '#388e3c'} onChange={handleChange('primary_color')} classes={classes} />
                            <ColorField label="Primary Dark" value={settings.primary_dark || '#2e7d32'} onChange={handleChange('primary_dark')} classes={classes} />
                            <ColorField label="Primary Light" value={settings.primary_light || '#66bb6a'} onChange={handleChange('primary_light')} classes={classes} />
                            <ColorField label="Sidebar" value={settings.sidebar_color || '#1b5e20'} onChange={handleChange('sidebar_color')} classes={classes} />
                            <ColorField label="Accent" value={settings.accent_color || '#4caf50'} onChange={handleChange('accent_color')} classes={classes} />
                            <ColorField label="Background" value={settings.background_color || '#f6faf6'} onChange={handleChange('background_color')} classes={classes} />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Map Defaults */}
                <Grid item xs={12} md={6}>
                    <Card className={classes.card}>
                        <CardContent>
                            <div className={classes.sectionHeader}>
                                <MapIcon className={classes.sectionIcon} />
                                <Typography variant="h6" className={classes.sectionTitle}>Default Map View</Typography>
                            </div>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Center Longitude"
                                        value={settings.default_map_center_lng || 0}
                                        onChange={handleTextChange('default_map_center_lng')}
                                        type="number"
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        inputProps={{ step: 0.01 }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Center Latitude"
                                        value={settings.default_map_center_lat || 0}
                                        onChange={handleTextChange('default_map_center_lat')}
                                        type="number"
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        inputProps={{ step: 0.01 }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Default Zoom"
                                        value={settings.default_map_zoom || 10}
                                        onChange={handleTextChange('default_map_zoom')}
                                        type="number"
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        inputProps={{ min: 0, max: 22 }}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                className={classes.saveButton}
            >
                {saving ? 'Saving...' : 'Save Settings'}
            </Button>
        </div>
    );
};

export default SettingsPage;
