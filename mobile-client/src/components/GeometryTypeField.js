import React from 'react';
import Chip from '@material-ui/core/Chip';
import RoomIcon from '@material-ui/icons/Room';
import TimelineIcon from '@material-ui/icons/Timeline';
import CropSquareIcon from '@material-ui/icons/CropSquare';

const ICONS = {
    point: RoomIcon,
    line: TimelineIcon,
    polygon: CropSquareIcon,
};

const COLORS = {
    point: '#388e3c',
    line: '#1565c0',
    polygon: '#2e7d32',
};

const GeometryTypeField = ({ record, source = 'geometry_type' }) => {
    const value = record && record[source];
    if (!value) return null;

    const Icon = ICONS[value] || RoomIcon;
    const color = COLORS[value] || '#9e9e9e';

    return (
        <Chip
            icon={<Icon style={{ color }} />}
            label={value}
            size="small"
            variant="outlined"
            style={{ borderColor: color, color }}
        />
    );
};

GeometryTypeField.defaultProps = { addLabel: true };

export default GeometryTypeField;
