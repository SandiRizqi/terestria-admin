import React from 'react';
import {
    Edit, SimpleForm, TextInput,
    ReferenceArrayInput, SelectArrayInput, TopToolbar,
} from 'react-admin';
import DeleteWithConfirmButton from '../components/DeleteWithConfirmButton';

const GroupEdit = (props) => (
    <Edit {...props} actions={<TopToolbar><DeleteWithConfirmButton basePath="/groups" /></TopToolbar>}>
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

export default GroupEdit;
