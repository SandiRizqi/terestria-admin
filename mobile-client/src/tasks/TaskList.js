import React from 'react';
import {
    List, Datagrid, TextField, DateField,
    Filter, TextInput, SelectInput, ReferenceInput,
} from 'react-admin';
import Chip from '@material-ui/core/Chip';

const STATUS_COLORS = {
    pending: { backgroundColor: '#fff3e0', color: '#e65100' },
    in_progress: { backgroundColor: '#e3f2fd', color: '#1565c0' },
    completed: { backgroundColor: '#e8f5e9', color: '#2e7d32' },
    cancelled: { backgroundColor: '#f5f5f5', color: '#616161' },
};

const PRIORITY_COLORS = {
    high: { backgroundColor: '#ffebee', color: '#c62828' },
    medium: { backgroundColor: '#fff3e0', color: '#e65100' },
    low: { backgroundColor: '#e8f5e9', color: '#2e7d32' },
};

const StatusField = ({ record }) => {
    if (!record) return null;
    const style = STATUS_COLORS[record.status] || {};
    return <Chip label={record.status} size="small" style={{ ...style, fontWeight: 600, fontSize: 11 }} />;
};
StatusField.defaultProps = { label: 'Status' };

const PriorityField = ({ record }) => {
    if (!record) return null;
    const style = PRIORITY_COLORS[record.priority] || {};
    return <Chip label={record.priority} size="small" style={{ ...style, fontWeight: 600, fontSize: 11 }} />;
};
PriorityField.defaultProps = { label: 'Priority' };

const TaskFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search" source="search" alwaysOn />
        <SelectInput source="status" choices={[
            { id: 'pending', name: 'Pending' },
            { id: 'in_progress', name: 'In Progress' },
            { id: 'completed', name: 'Completed' },
            { id: 'cancelled', name: 'Cancelled' },
        ]} alwaysOn />
        <SelectInput source="priority" choices={[
            { id: 'high', name: 'High' },
            { id: 'medium', name: 'Medium' },
            { id: 'low', name: 'Low' },
        ]} />
        <ReferenceInput source="assigned_to" reference="users" label="Assigned To">
            <SelectInput optionText="username" />
        </ReferenceInput>
    </Filter>
);

const TaskList = (props) => (
    <List {...props} filters={<TaskFilter />} sort={{ field: 'created_at', order: 'DESC' }}>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="title" />
            <TextField source="assigned_to_username" label="Assigned To" />
            <TextField source="project_name" label="Project" />
            <StatusField source="status" />
            <PriorityField source="priority" />
            <DateField source="due_date" label="Due Date" />
            <DateField source="created_at" showTime />
        </Datagrid>
    </List>
);

export default TaskList;
