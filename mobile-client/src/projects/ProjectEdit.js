import React from 'react';
import {
    Edit, SimpleForm, TextInput, SelectInput,
    BooleanInput, ReferenceArrayInput, SelectArrayInput, TopToolbar,
} from 'react-admin';
import JsonInput from '../components/JsonInput';
import DeleteWithConfirmButton from '../components/DeleteWithConfirmButton';

const ProjectEdit = (props) => (
    <Edit {...props} actions={<TopToolbar><DeleteWithConfirmButton basePath="/projects" /></TopToolbar>}>
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
        </SimpleForm>
    </Edit>
);

export default ProjectEdit;
