import React from 'react';
import {
    Show, SimpleShowLayout, TextField, BooleanField,
    DateField, NumberField,
} from 'react-admin';
import JsonField from '../components/JsonField';

const ProjectGroupShow = (props) => (
    <Show {...props}>
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
