import React from 'react';
import {
    Edit, SimpleForm, TextInput, BooleanInput,
    ReferenceArrayInput, SelectArrayInput, TopToolbar,
    usePermissions,
} from 'react-admin';
import DeleteWithConfirmButton from '../components/DeleteWithConfirmButton';
import AccessDenied from '../components/AccessDenied';

const UserEdit = (props) => {
    const { permissions } = usePermissions();
    if (!permissions) return null;
    if (!permissions.is_staff && !permissions.is_superuser) return <AccessDenied />;

    return (
        <Edit {...props} actions={<TopToolbar><DeleteWithConfirmButton hardDelete /></TopToolbar>}>
            <SimpleForm>
                <TextInput source="username" />
                <TextInput source="email" type="email" />
                <TextInput source="first_name" label="First Name" />
                <TextInput source="last_name" label="Last Name" />
                <TextInput source="password" type="password" label="New Password (leave blank to keep)" />
                <BooleanInput source="is_active" label="Active" />
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
        </Edit>
    );
};

export default UserEdit;
