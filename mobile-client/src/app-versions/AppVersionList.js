import React from 'react';
import {
    List, Datagrid, TextField, BooleanField, DateField,
    NumberField, Filter, BooleanInput,
} from 'react-admin';

const AppVersionFilter = (props) => (
    <Filter {...props}>
        <BooleanInput source="is_active" alwaysOn />
        <BooleanInput source="is_mandatory" />
    </Filter>
);

const AppVersionList = (props) => (
    <List {...props} filters={<AppVersionFilter />} sort={{ field: 'version_code', order: 'DESC' }}>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="version" />
            <NumberField source="version_code" label="Code" />
            <BooleanField source="is_mandatory" label="Mandatory" />
            <BooleanField source="is_active" label="Active" />
            <NumberField source="download_count" label="Downloads" />
            <TextField source="released_by_username" label="Released By" />
            <DateField source="released_at" showTime />
        </Datagrid>
    </List>
);

export default AppVersionList;
