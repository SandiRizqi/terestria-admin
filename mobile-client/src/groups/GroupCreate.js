import React from 'react';
import {
    Create, SimpleForm, TextInput,
    ReferenceArrayInput, SelectArrayInput,
} from 'react-admin';

const GroupCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="name" />
            <ReferenceArrayInput
                source="permissions"
                reference="permissions"
                label="Permissions"
                perPage={200}
                sort={{ field: 'codename', order: 'ASC' }}
            >
                <SelectArrayInput optionText={(record) =>
                    record ? `${record.content_type_name} | ${record.name}` : ''
                } />
            </ReferenceArrayInput>
        </SimpleForm>
    </Create>
);

export default GroupCreate;
