import React from 'react';
import {
    Edit, SimpleForm, TextInput,
    BooleanInput, ReferenceArrayInput, SelectArrayInput, TopToolbar,
} from 'react-admin';
import JsonInput from '../components/JsonInput';
import DeleteWithConfirmButton from '../components/DeleteWithConfirmButton';

const ProjectGroupEdit = (props) => (
    <Edit {...props} actions={<TopToolbar><DeleteWithConfirmButton basePath="/project-groups" /></TopToolbar>}>
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
            <BooleanInput source="is_active" />
            <BooleanInput source="is_deleted" />
        </SimpleForm>
    </Edit>
);

export default ProjectGroupEdit;
