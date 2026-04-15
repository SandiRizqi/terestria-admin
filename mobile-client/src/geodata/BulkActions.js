import React from 'react';
import { useNotify, useRefresh, useUnselectAll } from 'react-admin';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';

const BulkDeleteButton = ({ selectedIds }) => {
    const notify = useNotify();
    const refresh = useRefresh();
    const unselectAll = useUnselectAll();

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedIds.length} records?`)) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/mobile/geodata/bulk_delete/', {
                method: 'POST',
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: selectedIds }),
            });
            const data = await response.json();
            notify(`Deleted ${data.deleted} records`, 'info');
            unselectAll('geodata');
            refresh();
        } catch (e) {
            notify('Bulk delete failed', 'error');
        }
    };

    return (
        <Button
            size="small"
            startIcon={<DeleteIcon />}
            onClick={handleBulkDelete}
            style={{ color: '#c62828' }}
        >
            Delete Selected ({selectedIds.length})
        </Button>
    );
};

const BulkActions = (props) => (
    <BulkDeleteButton {...props} />
);

export default BulkActions;
