import React from 'react';
import {
    Create, SimpleForm, TextInput, BooleanInput,
    ReferenceArrayInput, SelectArrayInput,
} from 'react-admin';

const UserCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="username" />
            <TextInput source="email" type="email" />
            <TextInput source="first_name" label="First Name" />
            <TextInput source="last_name" label="Last Name" />
            <TextInput source="password" type="password" />
            <BooleanInput source="is_active" label="Active" defaultValue={true} />
            <BooleanInput source="is_staff" label="Staff" />
            <BooleanInput source="is_superuser" label="Superuser" />

            <ReferenceArrayInput
                source="groups"
                reference="groups"
                label="Groups"
                perPage={100}
                sort={{ field: 'name', order: 'ASC' }}
            >
                <SelectArrayInput optionText="name" />
            </ReferenceArrayInput>

            <ReferenceArrayInput
                source="user_permissions"
                reference="permissions"
                label="User Permissions"
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

export default UserCreate;
