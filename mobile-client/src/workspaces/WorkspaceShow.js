import React, { useState } from 'react';
import {
    Show, SimpleShowLayout, TextField, DateField, BooleanField,
    TopToolbar, EditButton, useNotify, useRefresh,
} from 'react-admin';
import { useRecordContext } from 'react-admin';
import Button from '@material-ui/core/Button';
import MuiTextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import DeleteIcon from '@material-ui/icons/Delete';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    section: { marginTop: 24 },
    addRow: { display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 },
});

const MemberManager = () => {
    const record = useRecordContext();
    const notify = useNotify();
    const refresh = useRefresh();
    const classes = useStyles();
    const [userId, setUserId] = useState('');
    const [role, setRole] = useState('member');

    if (!record) return null;

    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Token ${token}` };

    const addMember = async () => {
        if (!userId) return;
        const res = await fetch(`/api/mobile/workspaces/${record.id}/add_member/`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ user_id: parseInt(userId), role }),
        });
        if (res.ok) {
            notify('Member berhasil ditambahkan');
            refresh();
            setUserId('');
        } else {
            const err = await res.json();
            notify(err.detail || 'Gagal menambahkan member', 'error');
        }
    };

    const removeMember = async (memberId) => {
        const member = record.members_detail && record.members_detail.find(m => m.id === memberId);
        if (!member) return;
        const res = await fetch(`/api/mobile/workspaces/${record.id}/remove_member/`, {
            method: 'DELETE',
            headers,
            body: JSON.stringify({ user_id: member.user }),
        });
        if (res.ok || res.status === 204) {
            notify('Member dihapus');
            refresh();
        } else {
            notify('Gagal menghapus member', 'error');
        }
    };

    return (
        <div className={classes.section}>
            <Divider style={{ marginBottom: 16 }} />
            <Typography variant="subtitle1" style={{ fontWeight: 700, marginBottom: 8 }}>
                Members
            </Typography>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Username</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Joined</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {(record.members_detail || []).map((m) => (
                        <TableRow key={m.id}>
                            <TableCell>{m.username}</TableCell>
                            <TableCell>{m.email}</TableCell>
                            <TableCell>{m.role}</TableCell>
                            <TableCell>{m.joined_at ? new Date(m.joined_at).toLocaleDateString() : '-'}</TableCell>
                            <TableCell>
                                {m.role !== 'owner' && (
                                    <Button
                                        size="small"
                                        color="secondary"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => removeMember(m.id)}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className={classes.addRow}>
                <MuiTextField
                    label="User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    variant="outlined"
                    size="small"
                    style={{ width: 120 }}
                />
                <Select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    variant="outlined"
                    style={{ height: 40 }}
                >
                    <MenuItem value="member">Member</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                </Select>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PersonAddIcon />}
                    onClick={addMember}
                    disableElevation
                >
                    Add Member
                </Button>
            </div>
        </div>
    );
};

const WorkspaceShowActions = ({ basePath, data }) => (
    <TopToolbar>
        <EditButton basePath={basePath} record={data} />
    </TopToolbar>
);

const WorkspaceShow = (props) => (
    <Show {...props} actions={<WorkspaceShowActions />}>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="name" />
            <TextField source="slug" />
            <TextField source="description" />
            <TextField source="owner_username" label="Owner" />
            <BooleanField source="is_active" />
            <DateField source="created_at" showTime />
            <DateField source="updated_at" showTime />
            <MemberManager />
        </SimpleShowLayout>
    </Show>
);

export default WorkspaceShow;
