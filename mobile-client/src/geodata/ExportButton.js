import React, { useState } from 'react';
import { useListContext, useNotify } from 'react-admin';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import GetAppIcon from '@material-ui/icons/GetApp';
import CircularProgress from '@material-ui/core/CircularProgress';

const FORMATS = [
    { id: 'geojson', label: 'GeoJSON (.geojson)', ext: 'geojson' },
    { id: 'csv', label: 'CSV (.csv)', ext: 'csv' },
    { id: 'shapefile', label: 'Shapefile (.zip)', ext: 'zip' },
];

const ExportButton = () => {
    const { filterValues } = useListContext();
    const notify = useNotify();
    const [anchorEl, setAnchorEl] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleExport = async (format) => {
        setAnchorEl(null);
        setLoading(true);

        const token = localStorage.getItem('token');
        const params = new URLSearchParams();
        params.set('format', format);

        // Map react-admin filter keys to DRF filter params
        if (filterValues) {
            Object.entries(filterValues).forEach(([key, value]) => {
                if (value !== '' && value !== null && value !== undefined) {
                    params.set(key, value);
                }
            });
        }

        try {
            const response = await fetch(`/api/mobile/geodata/export/?${params.toString()}`, {
                headers: { Authorization: `Token ${token}` },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Export failed');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const ext = FORMATS.find((f) => f.id === format)?.ext || 'geojson';
            a.href = url;
            a.download = `geodata_export.${ext}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            notify('Export downloaded successfully', 'info');
        } catch (e) {
            console.error('Export error:', e);
            notify('Export failed. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                size="small"
                startIcon={loading ? <CircularProgress size={16} /> : <GetAppIcon />}
                onClick={(e) => setAnchorEl(e.currentTarget)}
                disabled={loading}
                style={{ color: '#2e7d32' }}
            >
                Export
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                {FORMATS.map((f) => (
                    <MenuItem key={f.id} onClick={() => handleExport(f.id)}>
                        {f.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default ExportButton;
