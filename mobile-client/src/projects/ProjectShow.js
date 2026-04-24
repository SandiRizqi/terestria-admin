import React from 'react';
import {
    Show, SimpleShowLayout, TextField, BooleanField,
    DateField, NumberField, TopToolbar,
} from 'react-admin';
import JsonField from '../components/JsonField';
import GeometryTypeField from '../components/GeometryTypeField';
import DeleteWithConfirmButton from '../components/DeleteWithConfirmButton';

const ProjectShow = (props) => (
    <Show {...props} actions={<TopToolbar><DeleteWithConfirmButton basePath="/projects" /></TopToolbar>}>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="mobile_id" label="Mobile ID" />
            <TextField source="name" />
            <TextField source="description" />
            <GeometryTypeField source="geometry_type" />
            <JsonField source="form_fields" label="Form Fields" />
            <NumberField source="geodata_count" label="GeoData Count" />
            <TextField source="created_by_username" label="Created By" />
            <BooleanField source="is_active" />
            <BooleanField source="is_deleted" />
            <DateField source="created_at" showTime />
            <DateField source="updated_at" showTime />
        </SimpleShowLayout>
    </Show>
);

export default ProjectShow;
