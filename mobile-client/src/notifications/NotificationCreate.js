import React from 'react';
import {
    Create, SimpleForm, TextInput, ImageInput, ImageField,
    ReferenceArrayInput, SelectArrayInput,
} from 'react-admin';
import JsonInput from '../components/JsonInput';

const NotificationCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="title" fullWidth />
            <TextInput source="body" multiline rows={4} fullWidth />
            <ImageInput source="image" label="Image" accept="image/*">
                <ImageField source="src" title="title" />
            </ImageInput>
            <JsonInput source="data" label="Additional Data (JSON)" />
            <ReferenceArrayInput source="receivers" reference="fcm-tokens" label="Receivers (FCM Tokens)">
                <SelectArrayInput optionText={(record) =>
                    record ? `${record.user_username || 'Unknown'} - ${record.device_name || record.device_id}` : ''
                } />
            </ReferenceArrayInput>
        </SimpleForm>
    </Create>
);

export default NotificationCreate;
