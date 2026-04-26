import React from 'react';
import {
    List, Datagrid, TextField, DateField, BooleanField,
    EditButton, ShowButton, usePermissions,
} from 'react-admin';
import AccessDenied from '../components/AccessDenied';

const WorkspaceList = (props) => {
    const { permissions } = usePermissions();
    if (!permissions) return null;

    return (
        <List {...props} bulkActionButtons={false}>
            <Datagrid rowClick="show">
                <TextField source="id" />
                <TextField source="name" />
                <TextField source="slug" />
                <TextField source="owner_username" label="Owner" />
                <TextField source="member_count" label="Members" />
                <BooleanField source="is_active" />
                <DateField source="created_at" showTime />
                <ShowButton />
                <EditButton />
            </Datagrid>
        </List>
    );
};

export default WorkspaceList;
