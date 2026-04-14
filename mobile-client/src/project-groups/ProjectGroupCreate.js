import React from 'react';
import {
    Create, SimpleForm, TextInput,
    BooleanInput, ReferenceArrayInput, SelectArrayInput,
} from 'react-admin';
import JsonInput from '../components/JsonInput';

const ProjectGroupCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="name" />
            <TextInput source="description" multiline rows={3} fullWidth />
            <JsonInput source="json_template" label="JSON Template" />
            <ReferenceArrayInput source="projects" reference="projects" label="Projects">
                <SelectArrayInput optionText="name" />
            </ReferenceArrayInput>
            <ReferenceArrayInput source="access_by" reference="users" label="Access By">
                <SelectArrayInput optionText="username" />
            </ReferenceArrayInput>
            <BooleanInput source="is_active" defaultValue={true} />
        </SimpleForm>
    </Create>
);

export default ProjectGroupCreate;
