import React from 'react';
import {
    Edit, SimpleForm, TextInput, NumberInput, BooleanInput,
} from 'react-admin';

const AppVersionEdit = (props) => (
    <Edit {...props}>
        <SimpleForm>
            <TextInput source="version" label="Version" />
            <NumberInput source="version_code" label="Version Code" />
            <TextInput source="apk_url" label="APK URL" fullWidth />
            <NumberInput source="file_size" label="File Size (bytes)" />
            <TextInput source="checksum" label="Checksum" />
            <TextInput source="release_notes" label="Release Notes" multiline rows={4} fullWidth />
            <BooleanInput source="is_mandatory" label="Mandatory Update" />
            <BooleanInput source="is_active" label="Active" />
        </SimpleForm>
    </Edit>
);

export default AppVersionEdit;
