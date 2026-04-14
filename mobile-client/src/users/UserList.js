import React from 'react';
import {
    List, Datagrid, TextField, EmailField, BooleanField,
    DateField, NumberField, Filter, TextInput, BooleanInput,
    EditButton,
} from 'react-admin';

const UserFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search" source="search" alwaysOn />
        <BooleanInput source="is_active" label="Active" />
        <BooleanInput source="is_staff" label="Staff" />
    </Filter>
);

const UserList = (props) => (
    <List {...props} filters={<UserFilter />} sort={{ field: 'date_joined', order: 'DESC' }}>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="username" />
            <EmailField source="email" />
            <TextField source="first_name" label="First Name" />
            <TextField source="last_name" label="Last Name" />
            <BooleanField source="is_active" label="Active" />
            <BooleanField source="is_staff" label="Staff" />
            <NumberField source="project_count" label="Projects" />
            <DateField source="date_joined" label="Joined" showTime />
            <DateField source="last_login" label="Last Login" showTime />
            <EditButton />
        </Datagrid>
    </List>
);

export default UserList;
