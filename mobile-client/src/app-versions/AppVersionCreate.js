import React from 'react';
import {
    Create, SimpleForm, TextInput, NumberInput, BooleanInput,
} from 'react-admin';

const AppVersionCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="version" label="Version (e.g., 1.3.0)" />
            <NumberInput source="version_code" label="Version Code (integer)" />
            <TextInput source="apk_url" label="APK URL" fullWidth />
            <NumberInput source="file_size" label="File Size (bytes)" />
            <TextInput source="checksum" label="Checksum (MD5/SHA256)" />
            <TextInput source="release_notes" label="Release Notes" multiline rows={4} fullWidth />
            <BooleanInput source="is_mandatory" label="Mandatory Update" />
            <BooleanInput source="is_active" label="Active" defaultValue={true} />
        </SimpleForm>
    </Create>
);

export default AppVersionCreate;
