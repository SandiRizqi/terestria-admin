import React from 'react';
import {
    List, Datagrid, TextField, BooleanField, DateField,
    NumberField, Filter, TextInput, BooleanInput, EditButton,
} from 'react-admin';
import DeleteWithConfirmButton from '../components/DeleteWithConfirmButton';
import BulkActions from './BulkActions';

const ProjectGroupFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search" source="search" alwaysOn />
        <BooleanInput source="is_active" />
    </Filter>
);

const ProjectGroupList = (props) => (
    <List {...props} filters={<ProjectGroupFilter />} sort={{ field: 'created_at', order: 'DESC' }} bulkActionButtons={<BulkActions />}>
        <Datagrid rowClick="show">
            <TextField source="id" />
            <TextField source="name" />
            <NumberField source="project_count" label="Projects" />
            <TextField source="created_by_username" label="Created By" />
            <BooleanField source="is_active" />
            <DateField source="created_at" showTime />
            <EditButton />
            <DeleteWithConfirmButton />
        </Datagrid>
    </List>
);

export default ProjectGroupList;
