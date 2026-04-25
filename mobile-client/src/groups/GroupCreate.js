import React from 'react';
import {
    Create, SimpleForm, TextInput,
    ReferenceArrayInput, SelectArrayInput, usePermissions,
} from 'react-admin';
import AccessDenied from '../components/AccessDenied';

const GroupCreate = (props) => {
    const { permissions } = usePermissions();
    if (!permissions) return null;
    if (!permissions.is_staff && !permissions.is_superuser) return <AccessDenied />;

    return (
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
};

export default GroupCreate;
