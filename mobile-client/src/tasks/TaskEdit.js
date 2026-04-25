import React from 'react';
import {
    Edit, SimpleForm, TextInput, ReferenceInput,
    SelectInput, DateTimeInput, TopToolbar,
} from 'react-admin';
import DeleteWithConfirmButton from '../components/DeleteWithConfirmButton';

const TaskEdit = (props) => (
    <Edit {...props} actions={<TopToolbar><DeleteWithConfirmButton hardDelete /></TopToolbar>}>
        <SimpleForm>
            <TextInput source="title" fullWidth />
            <TextInput source="description" multiline rows={3} fullWidth />
            <ReferenceInput source="assigned_to" reference="users" label="Assign To">
                <SelectInput optionText="username" />
            </ReferenceInput>
            <ReferenceInput source="project" reference="projects" label="Project" allowEmpty>
                <SelectInput optionText="name" />
            </ReferenceInput>
            <SelectInput source="status" choices={[
                { id: 'pending', name: 'Pending' },
                { id: 'in_progress', name: 'In Progress' },
                { id: 'completed', name: 'Completed' },
                { id: 'cancelled', name: 'Cancelled' },
            ]} />
            <SelectInput source="priority" choices={[
                { id: 'low', name: 'Low' },
                { id: 'medium', name: 'Medium' },
                { id: 'high', name: 'High' },
            ]} />
            <DateTimeInput source="due_date" label="Due Date" />
        </SimpleForm>
    </Edit>
);

export default TaskEdit;
