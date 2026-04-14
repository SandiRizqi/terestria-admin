import React from 'react';
import {
    Edit, SimpleForm, TextInput, SelectInput,
    BooleanInput, ReferenceArrayInput, SelectArrayInput,
} from 'react-admin';
import JsonInput from '../components/JsonInput';

const ProjectEdit = (props) => (
    <Edit {...props}>
        <SimpleForm>
            <TextInput source="mobile_id" label="Mobile ID" disabled />
            <TextInput source="name" />
            <TextInput source="description" multiline rows={3} fullWidth />
            <SelectInput source="geometry_type" choices={[
                { id: 'point', name: 'Point' },
                { id: 'line', name: 'Line' },
                { id: 'polygon', name: 'Polygon' },
            ]} />
            <JsonInput source="form_fields" label="Form Fields (JSON)" />
            <ReferenceArrayInput source="collectors" reference="users" label="Collectors">
                <SelectArrayInput optionText="username" />
            </ReferenceArrayInput>
            <BooleanInput source="is_active" />
            <BooleanInput source="is_deleted" />
        </SimpleForm>
    </Edit>
);

export default ProjectEdit;
