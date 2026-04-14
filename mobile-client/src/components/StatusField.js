import React from 'react';
import Chip from '@material-ui/core/Chip';

const STATUS_COLORS = {
    success: '#4caf50',
    failed: '#f44336',
    partial: '#ff9800',
    active: '#4caf50',
    inactive: '#9e9e9e',
};

const StatusField = ({ record, source }) => {
    const value = record && record[source];
    if (!value) return null;

    const color = STATUS_COLORS[value.toLowerCase()] || '#9e9e9e';

    return (
        <Chip
            label={value}
            size="small"
            style={{ backgroundColor: color, color: '#fff', fontWeight: 'bold' }}
        />
    );
};

StatusField.defaultProps = { addLabel: true };

export default StatusField;
