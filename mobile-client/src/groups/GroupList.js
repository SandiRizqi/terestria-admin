import React from 'react';
import {
    List, Datagrid, TextField, NumberField, EditButton,
    Filter, TextInput,
} from 'react-admin';

const GroupFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search" source="search" alwaysOn />
    </Filter>
);

const GroupList = (props) => (
    <List {...props} filters={<GroupFilter />} sort={{ field: 'name', order: 'ASC' }}>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="name" />
            <NumberField source="user_count" label="Users" />
            <EditButton />
        </Datagrid>
    </List>
);

export default GroupList;
