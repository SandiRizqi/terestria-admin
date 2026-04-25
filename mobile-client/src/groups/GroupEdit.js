import React from 'react';
import {
    Edit, SimpleForm, TextInput,
    ReferenceArrayInput, SelectArrayInput, TopToolbar,
    usePermissions,
} from 'react-admin';
import DeleteWithConfirmButton from '../components/DeleteWithConfirmButton';
import AccessDenied from '../components/AccessDenied';

const GroupEdit = (props) => {
    const { permissions } = usePermissions();
    if (!permissions) return null;
    if (!permissions.is_staff && !permissions.is_superuser) return <AccessDenied />;

    return (
        <Edit {...props} actions={<TopToolbar><DeleteWithConfirmButton hardDelete /></TopToolbar>}>
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
        </Edit>
    );
};

export default GroupEdit;
