import React from 'react';
import { Create, SimpleForm, TextInput, BooleanInput, required } from 'react-admin';

const WorkspaceCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="name" validate={required()} fullWidth />
            <TextInput source="description" multiline rows={3} fullWidth />
            <BooleanInput source="is_active" defaultValue={true} />
        </SimpleForm>
    </Create>
);

export default WorkspaceCreate;
