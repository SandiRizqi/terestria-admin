import React from 'react';
import {
    Create, SimpleForm, TextInput, NumberInput, BooleanInput,
} from 'react-admin';

const TMSLayerCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="name" />
            <TextInput source="code" label="Code (unique)" />
            <TextInput source="description" multiline rows={3} fullWidth />
            <TextInput source="owner" />
            <TextInput source="tms_url" label="TMS URL Pattern" fullWidth
                helperText="e.g., /tms/tile/geoportal/layer/{z}/{x}/{y}.png" />
            <TextInput source="base_url" label="Base URL" fullWidth
                defaultValue="https://portal-gis.tap-agri.com" />
            <NumberInput source="min_zoom" label="Min Zoom" defaultValue={0}
                inputProps={{ min: 0, max: 24 }} />
            <NumberInput source="max_zoom" label="Max Zoom" defaultValue={18}
                inputProps={{ min: 0, max: 24 }} />
            <BooleanInput source="is_active" defaultValue={true} />
        </SimpleForm>
    </Create>
);

export default TMSLayerCreate;
