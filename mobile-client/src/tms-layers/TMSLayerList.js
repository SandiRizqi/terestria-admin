import React from 'react';
import {
    List, Datagrid, TextField, BooleanField, DateField,
    NumberField, Filter, TextInput, BooleanInput, usePermissions,
} from 'react-admin';
import AccessDenied from '../components/AccessDenied';

const TMSLayerFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search" source="search" alwaysOn />
        <BooleanInput source="is_active" />
    </Filter>
);

const TMSLayerList = (props) => {
    const { permissions } = usePermissions();
    if (!permissions) return null;
    if (!permissions.is_staff && !permissions.is_superuser) return <AccessDenied />;

    return (
        <List {...props} filters={<TMSLayerFilter />} sort={{ field: 'code', order: 'ASC' }}>
            <Datagrid rowClick="edit">
                <TextField source="id" />
                <TextField source="name" />
                <TextField source="code" />
                <TextField source="owner" />
                <NumberField source="min_zoom" label="Min Zoom" />
                <NumberField source="max_zoom" label="Max Zoom" />
                <BooleanField source="is_active" />
                <DateField source="created_at" showTime />
            </Datagrid>
        </List>
    );
};

export default TMSLayerList;
