import React from 'react';
import {
    Edit, SimpleForm, TextInput, BooleanInput,
    ReferenceInput, SelectInput, DateTimeInput,
} from 'react-admin';
import JsonInput from '../components/JsonInput';

const GeoDataEdit = (props) => (
    <Edit {...props}>
        <SimpleForm>
            <TextInput source="mobile_id" label="Mobile ID" disabled />
            <ReferenceInput source="project" reference="projects" label="Project">
                <SelectInput optionText="name" />
            </ReferenceInput>
            <JsonInput source="form_data" label="Form Data (JSON)" />
            <JsonInput source="points" label="Points (JSON)" />
            <DateTimeInput source="created_at" />
            <DateTimeInput source="updated_at" />
            <BooleanInput source="is_deleted" />
        </SimpleForm>
    </Edit>
);

export default GeoDataEdit;
