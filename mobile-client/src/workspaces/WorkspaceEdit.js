import React from 'react';
import {
    Edit, SimpleForm, TextInput, BooleanInput,
    TopToolbar, ListButton, required,
} from 'react-admin';

const WorkspaceEditActions = ({ basePath }) => (
    <TopToolbar>
        <ListButton basePath={basePath} />
    </TopToolbar>
);

const WorkspaceEdit = (props) => (
    <Edit {...props} actions={<WorkspaceEditActions />}>
        <SimpleForm>
            <TextInput source="name" validate={required()} fullWidth />
            <TextInput source="description" multiline rows={3} fullWidth />
            <BooleanInput source="is_active" />
        </SimpleForm>
    </Edit>
);

export default WorkspaceEdit;
