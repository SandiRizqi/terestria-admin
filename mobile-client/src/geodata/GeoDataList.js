import React from 'react';
import {
    List, Datagrid, TextField, DateField, BooleanField,
    Filter, TextInput, ReferenceInput, SelectInput, DateInput,
} from 'react-admin';

const GeoDataFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search" source="search" alwaysOn />
        <ReferenceInput source="project_id" reference="projects" label="Project" alwaysOn>
            <SelectInput optionText="name" />
        </ReferenceInput>
        <DateInput source="start_date" label="From Date" />
        <DateInput source="end_date" label="To Date" />
    </Filter>
);

const GeoDataList = (props) => (
    <List {...props} filters={<GeoDataFilter />} sort={{ field: 'created_at', order: 'DESC' }}>
        <Datagrid rowClick="show">
            <TextField source="id" />
            <TextField source="mobile_id" label="Mobile ID" />
            <TextField source="project_name" label="Project" />
            <TextField source="collected_by_username" label="Collected By" />
            <BooleanField source="is_deleted" />
            <DateField source="created_at" showTime />
        </Datagrid>
    </List>
);

export default GeoDataList;
