import React from 'react';
import {
    List, Datagrid, TextField, DateField,
    Filter, TextInput, SelectInput, ReferenceInput, usePermissions,
} from 'react-admin';
import Chip from '@material-ui/core/Chip';

const ACTION_COLORS = {
    create: { backgroundColor: '#e8f5e9', color: '#2e7d32' },
    update: { backgroundColor: '#e3f2fd', color: '#1565c0' },
    delete: { backgroundColor: '#ffebee', color: '#c62828' },
    status_change: { backgroundColor: '#fff3e0', color: '#e65100' },
};

const ActionField = ({ record }) => {
    if (!record) return null;
    const style = ACTION_COLORS[record.action] || { backgroundColor: '#f5f5f5', color: '#616161' };
    return (
        <Chip
            label={record.action}
            size="small"
            style={{ ...style, fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}
        />
    );
};
ActionField.defaultProps = { label: 'Action' };

const AuditLogFilter = (props) => {
    const { permissions } = usePermissions();
    const isStaff = permissions && (permissions.is_staff || permissions.is_superuser);

    return (
        <Filter {...props}>
            <TextInput label="Search" source="search" alwaysOn />
            {isStaff && (
                <ReferenceInput source="user" reference="users" label="User" alwaysOn>
                    <SelectInput optionText="username" />
                </ReferenceInput>
            )}
            <SelectInput source="action" choices={[
                { id: 'create', name: 'Create' },
                { id: 'update', name: 'Update' },
                { id: 'delete', name: 'Delete' },
                { id: 'status_change', name: 'Status Change' },
            ]} />
            <SelectInput source="model_name" choices={[
                { id: 'Project', name: 'Project' },
                { id: 'ProjectGroup', name: 'Project Group' },
                { id: 'GeoData', name: 'GeoData' },
                { id: 'Task', name: 'Task' },
            ]} />
        </Filter>
    );
};

const AuditLogList = (props) => (
    <List
        {...props}
        filters={<AuditLogFilter />}
        sort={{ field: 'created_at', order: 'DESC' }}
        bulkActionButtons={false}
        title="Audit Logs"
    >
        <Datagrid>
            <DateField source="created_at" showTime label="Time" />
            <TextField source="user_username" label="User" />
            <ActionField source="action" />
            <TextField source="model_name" label="Model" />
            <TextField source="object_repr" label="Object" />
            <TextField source="ip_address" label="IP" />
        </Datagrid>
    </List>
);

export default AuditLogList;
