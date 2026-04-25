import React from 'react';
import {
    List, Datagrid, TextField, BooleanField, DateField,
    NumberField, Filter, TextInput, SelectInput, BooleanInput,
} from 'react-admin';
import GeometryTypeField from '../components/GeometryTypeField';
import DeleteWithConfirmButton from '../components/DeleteWithConfirmButton';
import BulkActions from './BulkActions';

const ProjectFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search" source="search" alwaysOn />
        <SelectInput source="geometry_type" choices={[
            { id: 'point', name: 'Point' },
            { id: 'line', name: 'Line' },
            { id: 'polygon', name: 'Polygon' },
        ]} />
        <BooleanInput source="is_active" />
    </Filter>
);

const ProjectList = (props) => (
    <List {...props} filters={<ProjectFilter />} sort={{ field: 'created_at', order: 'DESC' }} bulkActionButtons={<BulkActions />}>
        <Datagrid rowClick="show">
            <TextField source="id" />
            <TextField source="name" />
            <GeometryTypeField source="geometry_type" />
            <NumberField source="geodata_count" label="GeoData" />
            <TextField source="created_by_username" label="Created By" />
            <BooleanField source="is_active" />
            <DateField source="created_at" showTime />
            <DeleteWithConfirmButton />
        </Datagrid>
    </List>
);

export default ProjectList;
