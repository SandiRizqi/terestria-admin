import React from 'react';
import {
    Show, SimpleShowLayout, TextField, BooleanField,
    DateField, NumberField,
} from 'react-admin';
import GeometryTypeField from '../components/GeometryTypeField';
import JsonField from '../components/JsonField';
// import VectorTileMap from '../components/VectorTileMap';

const ProjectShow = (props) => (
    <Show {...props}>
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
