import React from 'react';
import {
    Create, SimpleForm, TextInput, ReferenceInput,
    SelectInput, DateTimeInput,
} from 'react-admin';

const TaskCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="title" fullWidth />
            <TextInput source="description" multiline rows={3} fullWidth />
            <ReferenceInput source="assigned_to" reference="users" label="Assign To">
                <SelectInput optionText="username" />
            </ReferenceInput>
            <ReferenceInput source="project" reference="projects" label="Project" allowEmpty>
                <SelectInput optionText="name" />
            </ReferenceInput>
            <SelectInput source="priority" choices={[
                { id: 'low', name: 'Low' },
                { id: 'medium', name: 'Medium' },
                { id: 'high', name: 'High' },
            ]} defaultValue="medium" />
            <DateTimeInput source="due_date" label="Due Date" />
        </SimpleForm>
    </Create>
);

export default TaskCreate;
