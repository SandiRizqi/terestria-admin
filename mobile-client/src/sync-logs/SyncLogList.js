import React from 'react';
import {
    List, Datagrid, TextField, DateField, NumberField,
    Filter, SelectInput, DateInput,
} from 'react-admin';
import StatusField from '../components/StatusField';

const SyncLogFilter = (props) => (
    <Filter {...props}>
        <SelectInput source="sync_type" alwaysOn choices={[
            { id: 'project_upload', name: 'Project Upload' },
            { id: 'project_download', name: 'Project Download' },
            { id: 'geodata_upload', name: 'GeoData Upload' },
            { id: 'geodata_download', name: 'GeoData Download' },
            { id: 'geodata_delete', name: 'GeoData Delete' },
        ]} />
        <SelectInput source="status" choices={[
            { id: 'success', name: 'Success' },
            { id: 'failed', name: 'Failed' },
            { id: 'partial', name: 'Partial' },
        ]} />
        <DateInput source="start_date" label="From Date" />
        <DateInput source="end_date" label="To Date" />
    </Filter>
);

const SyncLogList = (props) => (
    <List {...props} filters={<SyncLogFilter />} sort={{ field: 'created_at', order: 'DESC' }}>
        <Datagrid>
            <TextField source="id" />
            <TextField source="user_username" label="User" />
            <TextField source="sync_type" label="Type" />
            <StatusField source="status" />
            <NumberField source="items_count" label="Items" />
            <TextField source="error_message" label="Error" />
            <DateField source="created_at" showTime />
        </Datagrid>
    </List>
);

export default SyncLogList;
