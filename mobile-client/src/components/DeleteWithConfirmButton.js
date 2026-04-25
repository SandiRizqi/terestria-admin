import React, { useState } from 'react';
import { useRecordContext, useRefresh, useNotify } from 'react-admin';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import { Delete, Warning } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
    deleteButton: {
        color: '#f44336',
        padding: '5px',
        borderRadius: 4,
        '&:hover': {
            backgroundColor: 'rgba(244, 67, 54, 0.08)',
        },
    },
    dialogPaper: {
        borderRadius: 12,
        minWidth: 360,
    },
    dialogTitle: {
        backgroundColor: '#fff3e0',
        paddingBottom: 12,
    },
    dialogContent: {
        paddingTop: 8,
        paddingBottom: 8,
    },
    dialogContentText: {
        color: '#3d5a3d',
        lineHeight: 1.6,
    },
    warningIcon: {
        color: '#e65100',
        marginRight: 8,
        fontSize: 22,
        verticalAlign: 'middle',
    },
    recordName: {
        fontWeight: 700,
        color: '#1b5e20',
    },
    cancelButton: {
        color: '#78909c',
    },
}));

const DeleteWithConfirmButton = ({ resource: resourceProp }) => {
    const [open, setOpen] = useState(false);
    const record = useRecordContext();
    const refresh = useRefresh();
    const notify = useNotify();
    const classes = useStyles();

    // Fallback to determine resource from URL or prop
    const getResourceFromPath = () => {
        const path = window.location.pathname;
        if (path.includes('/projects')) return 'projects';
        if (path.includes('/project-groups')) return 'project-groups';
        if (path.includes('/geodata')) return 'geodata';
        if (path.includes('/tms-layers')) return 'tms-layers';
        if (path.includes('/users')) return 'users';
        if (path.includes('/groups')) return 'groups';
        if (path.includes('/notifications')) return 'notifications';
        if (path.includes('/tasks')) return 'tasks';
        return resourceProp || 'unknown';
    };

    if (!record) return null;

    const resource = resourceProp || getResourceFromPath();

    const getEndpoint = () => {
        const endpointMap = {
            'projects': 'projects',
            'project-groups': 'project-groups',
            'geodata': 'geodata',
            'tms-layers': 'tms-layers',
            'users': 'users',
            'groups': 'groups',
            'notifications': 'notifications',
            'app-versions': 'app-versions',
            'fcm-tokens': 'fcm-tokens',
            'tasks': 'tasks',
            'sync-logs': 'sync-logs',
            'audit-logs': 'audit-logs',
            'admin-settings': 'admin-settings',
        };
        const endpoint = endpointMap[resource] || resource;
        return `/api/mobile/${endpoint}/${record.id}/`;
    };

    const handleDelete = () => {
        const token = localStorage.getItem('token');
        fetch(getEndpoint(), {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            },
            body: JSON.stringify({ is_deleted: true }),
        })
            .then((response) => {
                if (response.ok) {
                    setOpen(false);
                    notify('Record deleted successfully', 'info');
                    refresh();
                } else {
                    throw new Error('Delete failed');
                }
            })
            .catch(() => {
                setOpen(false);
                notify('Delete failed', 'error');
            });
    };

    const getRecordName = () => {
        if (record.name) return record.name;
        if (record.title) return record.title;
        if (record.username) return record.username;
        if (record.mobile_id) return record.mobile_id;
        return `ID ${record.id}`;
    };

    const handleClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        e.nativeEvent.stopImmediatePropagation();
        setOpen(true);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
        }
    };

    return (
        <>
            <span
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                role="button"
                tabIndex={0}
                aria-label="Delete"
            >
                <Delete className={classes.deleteButton} />
            </span>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                classes={{ paper: classes.dialogPaper }}
            >
                <DialogTitle className={classes.dialogTitle}>
                    <Warning className={classes.warningIcon} />
                    Confirm Delete
                </DialogTitle>
                <DialogContent className={classes.dialogContent}>
                    <DialogContentText className={classes.dialogContentText}>
                        Are you sure you want to delete{' '}
                        <strong className={classes.recordName}>{getRecordName()}</strong>?
                        <br />
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px' }}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpen(false);
                        }}
                        className={classes.cancelButton}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px 16px',
                            fontSize: 14,
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                        }}
                        style={{
                            backgroundColor: '#c62828',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px 16px',
                            borderRadius: 4,
                            fontSize: 14,
                            fontWeight: 600,
                        }}
                    >
                        Delete
                    </button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DeleteWithConfirmButton;
