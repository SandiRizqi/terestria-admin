import React, { useState } from 'react';
import { useDataProvider, useNotify, useRefresh } from 'react-admin';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import PublishIcon from '@material-ui/icons/Publish';
import Alert from '@material-ui/lab/Alert';

const ImportDialog = () => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const refresh = useRefresh();
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [projectId, setProjectId] = useState('');
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    const handleOpen = () => {
        setOpen(true);
        setFile(null);
        setProjectId('');
        setPreview(null);
        // Fetch projects
        dataProvider.getList('projects', {
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'name', order: 'ASC' },
            filter: {},
        }).then(({ data }) => setProjects(data)).catch(() => {});
    };

    const handlePreview = async () => {
        if (!file || !projectId) return;
        setLoading(true);

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project_id', projectId);

        try {
            const response = await fetch('/api/mobile/geodata/import_data/?dry_run=true', {
                method: 'POST',
                headers: { Authorization: `Token ${token}` },
                body: formData,
            });
            const data = await response.json();
            setPreview(data);
        } catch (e) {
            notify('Preview failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!file || !projectId) return;
        setLoading(true);

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project_id', projectId);

        try {
            const response = await fetch('/api/mobile/geodata/import_data/', {
                method: 'POST',
                headers: { Authorization: `Token ${token}` },
                body: formData,
            });
            const data = await response.json();
            notify(`Imported ${data.imported} records`, 'info');
            setOpen(false);
            refresh();
        } catch (e) {
            notify('Import failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                size="small"
                startIcon={<PublishIcon />}
                onClick={handleOpen}
                style={{ color: '#1565c0' }}
            >
                Import
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle style={{ color: '#1b5e20', fontWeight: 700 }}>
                    Import GeoData
                </DialogTitle>
                <DialogContent>
                    <FormControl fullWidth variant="outlined" size="small" style={{ marginBottom: 16 }}>
                        <InputLabel>Target Project</InputLabel>
                        <Select
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            label="Target Project"
                        >
                            {projects.map((p) => (
                                <MenuItem key={p.id} value={p.id}>{p.name} ({p.geometry_type})</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <input
                        type="file"
                        accept=".geojson,.json,.csv"
                        onChange={(e) => { setFile(e.target.files[0]); setPreview(null); }}
                        style={{ marginBottom: 16, display: 'block' }}
                    />

                    {file && (
                        <Typography variant="body2" style={{ color: '#6b8f6b', marginBottom: 8 }}>
                            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </Typography>
                    )}

                    {preview && (
                        <div style={{ marginTop: 16 }}>
                            <Alert severity={preview.error_count > 0 ? 'warning' : 'success'} style={{ marginBottom: 8 }}>
                                Valid: {preview.valid_count} | Errors: {preview.error_count}
                            </Alert>
                            {preview.errors && preview.errors.length > 0 && (
                                <div style={{ maxHeight: 150, overflow: 'auto', fontSize: 12, color: '#c62828' }}>
                                    {preview.errors.slice(0, 10).map((err, i) => (
                                        <div key={i}>Row {err.row}: {err.errors.join(', ')}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handlePreview}
                        disabled={!file || !projectId || loading}
                        style={{ color: '#e65100' }}
                    >
                        {loading ? <CircularProgress size={20} /> : 'Preview'}
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={!file || !projectId || loading}
                        variant="contained"
                        style={{ backgroundColor: '#388e3c', color: '#fff' }}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : 'Import'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ImportDialog;
