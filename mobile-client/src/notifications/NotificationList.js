import React from 'react';
import {
    List, Datagrid, TextField, DateField, NumberField,
} from 'react-admin';

const NotificationList = (props) => (
    <List {...props} sort={{ field: 'created_at', order: 'DESC' }}>
        <Datagrid rowClick="show">
            <TextField source="id" />
            <TextField source="title" />
            <TextField source="body" />
            <NumberField source="receiver_count" label="Receivers" />
            <DateField source="created_at" showTime />
        </Datagrid>
    </List>
);

export default NotificationList;
