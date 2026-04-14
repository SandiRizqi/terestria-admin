import React from 'react';
import {
    List, Datagrid, TextField, BooleanField, DateField,
    Filter, SelectInput, BooleanInput,
} from 'react-admin';

const FCMTokenFilter = (props) => (
    <Filter {...props}>
        <SelectInput source="platform" alwaysOn choices={[
            { id: 'android', name: 'Android' },
            { id: 'ios', name: 'iOS' },
            { id: 'web', name: 'Web' },
        ]} />
        <BooleanInput source="is_active" />
    </Filter>
);

const FCMTokenList = (props) => (
    <List {...props} filters={<FCMTokenFilter />} sort={{ field: 'updated_at', order: 'DESC' }}>
        <Datagrid>
            <TextField source="id" />
            <TextField source="user_username" label="User" />
            <TextField source="device_name" label="Device" />
            <TextField source="platform" />
            <TextField source="app_version" label="App Ver" />
            <TextField source="os_version" label="OS Ver" />
            <BooleanField source="is_active" />
            <DateField source="last_used_at" label="Last Used" showTime />
            <DateField source="updated_at" showTime />
        </Datagrid>
    </List>
);

export default FCMTokenList;
