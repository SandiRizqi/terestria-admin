import React from 'react';
import {
    Show, SimpleShowLayout, TextField, DateField,
    NumberField, ImageField,
} from 'react-admin';
import JsonField from '../components/JsonField';

const NotificationShow = (props) => (
    <Show {...props}>
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

export default NotificationShow;
