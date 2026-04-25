import React from 'react';
import {
    List, Datagrid, TextField, DateField, NumberField, usePermissions,
} from 'react-admin';
import AccessDenied from '../components/AccessDenied';

const NotificationList = (props) => {
    const { permissions } = usePermissions();
    if (!permissions) return null;
    if (!permissions.is_staff && !permissions.is_superuser) return <AccessDenied />;

    return (
        <List {...props} sort={{ field: 'created_at', order: 'DESC' }}>
            <Datagrid rowClick="show">
                <TextField source="id" />
                <TextField source="title" />
                <TextField source="body" />
                <NumberField source="receiver_count" label="Receivers" />
                <DateField source="created_at" showTime />
            </Datagrid>
        </List>
    );
};

export default NotificationList;
