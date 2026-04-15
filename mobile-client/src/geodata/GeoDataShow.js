import React from 'react';
import {
    Show, SimpleShowLayout, TextField, DateField, BooleanField,
} from 'react-admin';
import JsonField from '../components/JsonField';
import MapField from '../components/MapField';
import ApprovalActions from './ApprovalActions';
import CommentSection from './CommentSection';

const GeoDataShowLayout = ({ record, ...props }) => (
    <SimpleShowLayout record={record} {...props}>
        <ApprovalActions record={record} />
        <TextField source="id" />
        <TextField source="mobile_id" label="Mobile ID" />
        <TextField source="project_name" label="Project" />
        <TextField source="collected_by_username" label="Collected By" />
        <TextField source="approval_status" label="Status" />
        <BooleanField source="is_deleted" />
        <DateField source="created_at" showTime />
        <DateField source="updated_at" showTime />
        <DateField source="synced_at" showTime />
        <JsonField source="form_data" label="Form Data" />
        <JsonField source="points" label="Points" />
        <MapField source="geom_geojson" label="Geometry" />
        <CommentSection record={record} />
    </SimpleShowLayout>
);

const GeoDataShow = (props) => (
    <Show {...props}>
        <GeoDataShowLayout />
    </Show>
);

export default GeoDataShow;
