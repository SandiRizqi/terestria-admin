import React from 'react';
import {
    Show, SimpleShowLayout, TextField, BooleanField,
    DateField, NumberField, TopToolbar, EditButton,
} from 'react-admin';
import JsonField from '../components/JsonField';
import DeleteWithConfirmButton from '../components/DeleteWithConfirmButton';

const ProjectGroupShow = (props) => (
    <Show {...props} actions={<TopToolbar><EditButton /><DeleteWithConfirmButton /></TopToolbar>}>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="description" />
            <NumberField source="project_count" label="Project Count" />
            <JsonField source="json_template" label="JSON Template" />
            <TextField source="created_by_username" label="Created By" />
            <BooleanField source="is_active" />
            <BooleanField source="is_deleted" />
            <DateField source="created_at" showTime />
            <DateField source="updated_at" showTime />
        </SimpleShowLayout>
    </Show>
);

export default ProjectGroupShow;
