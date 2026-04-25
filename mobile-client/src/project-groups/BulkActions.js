import React, { useState } from 'react';
import { useNotify, useRefresh, useUnselectAll } from 'react-admin';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import DeleteIcon from '@material-ui/icons/Delete';
import { Warning } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
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
    },
    countNumber: {
        fontWeight: 700,
        color: '#1b5e20',
    },
    deleteButtonText: {
        color: '#c62828',
        fontWeight: 600,
    },
    cancelButton: {
        color: '#78909c',
    },
    actionButton: {
        backgroundColor: '#c62828',
        color: '#fff',
        '&:hover': {
            backgroundColor: '#b71c1c',
        },
    },
}));

const BulkDeleteButton = ({ selectedIds, resource }) => {
    const [open, setOpen] = useState(false);
    const notify = useNotify();
    const refresh = useRefresh();
    const unselectAll = useUnselectAll();
    const classes = useStyles();

    const resourceLabel = {
        'projects': 'project(s)',
        'project-groups': 'project group(s)',
        'geodata': 'geodata record(s)',
    }[resource] || 'item(s)';

    const handleConfirmDelete = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/mobile/${resource}/bulk_delete/`, {
                method: 'POST',
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedIds }),
            });
            const data = await response.json();
            notify(`Deleted ${data.deleted || selectedIds.length} ${resourceLabel}`, 'info');
            setOpen(false);
            unselectAll(resource);
            refresh();
        } catch (e) {
            notify('Bulk delete failed', 'error');
            setOpen(false);
        }
    };

    return (
        <>
            <Button
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => setOpen(true)}
                style={{ color: '#c62828' }}
            >
                Delete Selected ({selectedIds.length})
            </Button>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                classes={{ paper: classes.dialogPaper }}
            >
                <DialogTitle className={classes.dialogTitle}>
                    <Warning className={classes.warningIcon} />
                    Delete {selectedIds.length} {resourceLabel}?
                </DialogTitle>
                <DialogContent className={classes.dialogContent}>
                    <DialogContentText className={classes.dialogContentText}>
                        Are you sure you want to delete{' '}
                        <strong className={classes.countNumber}>{selectedIds.length}</strong>{' '}
                        selected {resourceLabel}?
                        <br />
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px' }}>
                    <Button
                        onClick={() => setOpen(false)}
                        className={classes.cancelButton}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        className={classes.actionButton}
                        variant="contained"
                    >
                        Delete {selectedIds.length} {resourceLabel}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const BulkActions = (props) => {
    const resource = props.resource || 'project-groups';
    return <BulkDeleteButton {...props} resource={resource} />;
};

export default BulkActions;
