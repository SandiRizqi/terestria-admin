import React from 'react';
import {
    List, Datagrid, TextField, DateField, BooleanField,
    Filter, TextInput, ReferenceInput, SelectInput, DateInput,
    TopToolbar, CreateButton,
} from 'react-admin';
import Chip from '@material-ui/core/Chip';
import ExportButton from './ExportButton';
import ImportDialog from './ImportDialog';
import BulkActions from './BulkActions';

const STATUS_COLORS = {
    draft: { backgroundColor: '#f5f5f5', color: '#616161' },
    review: { backgroundColor: '#fff3e0', color: '#e65100' },
    approved: { backgroundColor: '#e8f5e9', color: '#2e7d32' },
    rejected: { backgroundColor: '#ffebee', color: '#c62828' },
};

const ApprovalStatusField = ({ record }) => {
    if (!record) return null;
    const style = STATUS_COLORS[record.approval_status] || {};
    return <Chip label={record.approval_status || 'draft'} size="small" style={{ ...style, fontWeight: 600, fontSize: 11 }} />;
};
ApprovalStatusField.defaultProps = { label: 'Status' };

const GeoDataFilter = (props) => (
    <Filter {...props}>
        <TextInput label="Search" source="search" alwaysOn />
        <ReferenceInput source="project_id" reference="projects" label="Project" alwaysOn>
            <SelectInput optionText="name" />
        </ReferenceInput>
        <SelectInput source="approval_status" label="Status" choices={[
            { id: 'draft', name: 'Draft' },
            { id: 'review', name: 'In Review' },
            { id: 'approved', name: 'Approved' },
            { id: 'rejected', name: 'Rejected' },
        ]} />
        <DateInput source="start_date" label="From Date" />
        <DateInput source="end_date" label="To Date" />
    </Filter>
);

const ListActions = () => (
    <TopToolbar>
        <ExportButton />
        <ImportDialog />
        <CreateButton />
    </TopToolbar>
);

const GeoDataList = (props) => (
    <List
        {...props}
        filters={<GeoDataFilter />}
        sort={{ field: 'created_at', order: 'DESC' }}
        actions={<ListActions />}
        bulkActionButtons={<BulkActions />}
    >
        <Datagrid rowClick="show">
            <TextField source="id" />
            <TextField source="mobile_id" label="Mobile ID" />
            <TextField source="project_name" label="Project" />
            <TextField source="collected_by_username" label="Collected By" />
            <ApprovalStatusField source="approval_status" />
            <BooleanField source="is_deleted" />
            <DateField source="created_at" showTime />
        </Datagrid>
    </List>
);

export default GeoDataList;
