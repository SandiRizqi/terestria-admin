import React from 'react';
import {
    List, Datagrid, TextField, NumberField, EditButton,
    Filter, TextInput, usePermissions,
} from 'react-admin';
import AccessDenied from '../components/AccessDenied';

const GroupFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search" source="search" alwaysOn />
    </Filter>
);

const GroupList = (props) => {
    const { permissions } = usePermissions();
    if (!permissions) return null;
    if (!permissions.is_staff && !permissions.is_superuser) return <AccessDenied />;

    return (
        <List {...props} filters={<GroupFilter />} sort={{ field: 'name', order: 'ASC' }}>
            <Datagrid rowClick="edit">
                <TextField source="id" />
                <TextField source="name" />
                <NumberField source="user_count" label="Users" />
                <EditButton />
            </Datagrid>
        </List>
    );
};

export default GroupList;
