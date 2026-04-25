import React from 'react';
import {
    Edit, SimpleForm, TextInput, NumberInput, BooleanInput, TopToolbar,
    usePermissions,
} from 'react-admin';
import DeleteWithConfirmButton from '../components/DeleteWithConfirmButton';
import AccessDenied from '../components/AccessDenied';

const TMSLayerEdit = (props) => {
    const { permissions } = usePermissions();
    if (!permissions) return null;
    if (!permissions.is_staff && !permissions.is_superuser) return <AccessDenied />;

    return (
        <Edit {...props} actions={<TopToolbar><DeleteWithConfirmButton hardDelete /></TopToolbar>}>
            <SimpleForm>
                <TextInput source="name" />
                <TextInput source="code" label="Code" />
                <TextInput source="description" multiline rows={3} fullWidth />
                <TextInput source="owner" />
                <TextInput source="tms_url" label="TMS URL Pattern" fullWidth />
                <TextInput source="base_url" label="Base URL" fullWidth />
                <NumberInput source="min_zoom" label="Min Zoom"
                    inputProps={{ min: 0, max: 24 }} />
                <NumberInput source="max_zoom" label="Max Zoom"
                    inputProps={{ min: 0, max: 24 }} />
                <BooleanInput source="is_active" />
            </SimpleForm>
        </Edit>
    );
};

export default TMSLayerEdit;
