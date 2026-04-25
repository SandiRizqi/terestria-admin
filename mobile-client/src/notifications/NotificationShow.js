import React from 'react';
import {
    Show, SimpleShowLayout, TextField, DateField,
    NumberField, ImageField, TopToolbar, usePermissions,
} from 'react-admin';
import JsonField from '../components/JsonField';
import AccessDenied from '../components/AccessDenied';
import DeleteWithConfirmButton from '../components/DeleteWithConfirmButton';

const NotificationShow = (props) => {
    const { permissions } = usePermissions();
    if (!permissions) return null;
    if (!permissions.is_staff && !permissions.is_superuser) return <AccessDenied />;

    return (
        <Show {...props} actions={<TopToolbar><DeleteWithConfirmButton hardDelete /></TopToolbar>}>
            <SimpleShowLayout>
                <TextField source="id" />
                <TextField source="title" />
                <TextField source="body" />
                <ImageField source="image" label="Image" />
                <JsonField source="data" label="Additional Data" />
                <NumberField source="receiver_count" label="Receiver Count" />
                <DateField source="created_at" showTime />
                <DateField source="updated_at" showTime />
            </SimpleShowLayout>
        </Show>
    );
};

export default NotificationShow;
