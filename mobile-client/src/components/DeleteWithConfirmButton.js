import React, { useState } from 'react';
import {
    Button, useRecordContext,
} from 'react-admin';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import { Delete } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
    deleteButton: {
        color: '#f44336',
    },
}));

const DeleteWithConfirmButton = ({ basePath }) => {
    const [open, setOpen] = useState(false);
    const record = useRecordContext();
    const classes = useStyles();

    if (!record) return null;

    const handleDelete = () => {
        const token = localStorage.getItem('token');
        fetch(`/api/mobile/${record.id}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
            },
            body: JSON.stringify({ is_deleted: true }),
        })
            .then(() => {
                setOpen(false);
                window.location.href = `/${basePath}`;
            })
            .catch((err) => {
                console.error('Delete error:', err);
                setOpen(false);
            });
    };

    return (
        <>
            <Button
                className={classes.deleteButton}
                onClick={() => setOpen(true)}
                label="Delete"
            >
                <Delete />
            </Button>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete <strong>{record.name || `ID ${record.id}`}</strong>? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleDelete}
                        label="Confirm"
                        className={classes.deleteButton}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DeleteWithConfirmButton;
