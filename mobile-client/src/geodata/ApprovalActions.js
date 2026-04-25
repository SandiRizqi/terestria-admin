import React, { useState } from 'react';
import { useNotify, useRefresh, usePermissions } from 'react-admin';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

const STATUS_CONFIG = {
    draft: { label: 'Draft', color: '#616161', bg: '#f5f5f5' },
    review: { label: 'In Review', color: '#e65100', bg: '#fff3e0' },
    approved: { label: 'Approved', color: '#2e7d32', bg: '#e8f5e9' },
    rejected: { label: 'Rejected', color: '#c62828', bg: '#ffebee' },
};

const useStyles = makeStyles({
    root: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 0',
        flexWrap: 'wrap',
    },
    reviewInfo: {
        fontSize: 13,
        color: '#6b8f6b',
        fontStyle: 'italic',
    },
});

const ApprovalActions = ({ record }) => {
    const classes = useStyles();
    const notify = useNotify();
    const refresh = useRefresh();
    const { permissions } = usePermissions();
    const isStaff = permissions && (permissions.is_staff || permissions.is_superuser);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [notes, setNotes] = useState('');

    if (!record) return null;

    const config = STATUS_CONFIG[record.approval_status] || STATUS_CONFIG.draft;

    const callAction = async (action, body = {}) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/mobile/geodata/${record.id}/${action}/`, {
                method: 'POST',
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            if (response.ok) {
                notify(`Status changed to ${action}`, 'info');
                refresh();
            } else {
                notify('Action failed', 'error');
            }
        } catch (e) {
            notify('Action failed', 'error');
        }
    };

    return (
        <div className={classes.root}>
            <Typography variant="body2" style={{ fontWeight: 600, color: '#1b5e20' }}>
                Approval Status:
            </Typography>
            <Chip
                label={config.label}
                size="small"
                style={{
                    backgroundColor: config.bg,
                    color: config.color,
                    fontWeight: 700,
                    fontSize: 12,
                }}
            />

            {record.approval_status === 'draft' && (
                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => callAction('submit_for_review')}
                    style={{ color: '#e65100', borderColor: '#e65100' }}
                >
                    Submit for Review
                </Button>
            )}

            {record.approval_status === 'review' && isStaff && (
                <>
                    <Button
                        size="small"
                        variant="contained"
                        onClick={() => callAction('approve')}
                        style={{ backgroundColor: '#2e7d32', color: '#fff' }}
                    >
                        Approve
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setRejectOpen(true)}
                        style={{ color: '#c62828', borderColor: '#c62828' }}
                    >
                        Reject
                    </Button>
                </>
            )}

            {record.approval_status === 'rejected' && (
                <Button
                    size="small"
                    variant="outlined"
                    onClick={() => callAction('submit_for_review')}
                    style={{ color: '#e65100', borderColor: '#e65100' }}
                >
                    Resubmit for Review
                </Button>
            )}

            {record.reviewed_by_username && (
                <span className={classes.reviewInfo}>
                    Reviewed by {record.reviewed_by_username}
                    {record.reviewed_at && ` on ${new Date(record.reviewed_at).toLocaleDateString()}`}
                </span>
            )}

            {record.review_notes && (
                <span className={classes.reviewInfo}>
                    Notes: {record.review_notes}
                </span>
            )}

            {/* Reject Dialog */}
            <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle style={{ color: '#c62828' }}>Reject GeoData</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Rejection Notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
                    <Button
                        onClick={() => {
                            callAction('reject', { notes });
                            setRejectOpen(false);
                            setNotes('');
                        }}
                        style={{ color: '#c62828' }}
                    >
                        Reject
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ApprovalActions;
