import React, { useState, useEffect } from 'react';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import PersonIcon from '@material-ui/icons/Person';
import SendIcon from '@material-ui/icons/Send';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    root: {
        marginTop: 16,
    },
    title: {
        fontWeight: 700,
        color: '#1b5e20',
        fontSize: 16,
        marginBottom: 12,
    },
    commentList: {
        maxHeight: 400,
        overflowY: 'auto',
    },
    comment: {
        display: 'flex',
        gap: 12,
        padding: '10px 0',
        borderBottom: '1px solid #f0f5f0',
    },
    avatar: {
        width: 32,
        height: 32,
        backgroundColor: '#e8f5e9',
    },
    commentContent: {
        flex: 1,
    },
    commentHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    commentUser: {
        fontWeight: 700,
        color: '#1b5e20',
        fontSize: 13,
    },
    commentTime: {
        fontSize: 11,
        color: '#9ab89a',
    },
    commentText: {
        fontSize: 13,
        color: '#333',
        lineHeight: 1.5,
    },
    addForm: {
        display: 'flex',
        gap: 8,
        marginTop: 12,
        alignItems: 'flex-start',
    },
    empty: {
        color: '#9ab89a',
        fontSize: 13,
        textAlign: 'center',
        padding: '16px 0',
    },
});

function timeAgo(dateStr) {
    const now = new Date();
    const then = new Date(dateStr);
    const diffMin = Math.floor((now - then) / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return then.toLocaleDateString();
}

const CommentSection = ({ record }) => {
    const classes = useStyles();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    const geodataId = record && record.id;

    useEffect(() => {
        if (!geodataId) return;
        const token = localStorage.getItem('token');
        fetch(`/api/mobile/geodata-comments/?geodata=${geodataId}&ordering=-created_at`, {
            headers: { Authorization: `Token ${token}` },
        })
            .then((r) => r.json())
            .then((data) => setComments(data.results || []))
            .catch(() => {});
    }, [geodataId]);

    const handleSubmit = async () => {
        if (!newComment.trim() || !geodataId) return;
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/mobile/geodata-comments/', {
                method: 'POST',
                headers: {
                    Authorization: `Token ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ geodata: geodataId, text: newComment }),
            });
            if (response.ok) {
                const comment = await response.json();
                setComments((prev) => [comment, ...prev]);
                setNewComment('');
            }
        } catch (e) {
            // ignore
        } finally {
            setLoading(false);
        }
    };

    if (!record) return null;

    return (
        <div className={classes.root}>
            <Typography className={classes.title}>
                Comments ({comments.length})
            </Typography>

            <div className={classes.addForm}>
                <TextField
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    variant="outlined"
                    size="small"
                    fullWidth
                    multiline
                    rowsMax={3}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                />
                <Button
                    onClick={handleSubmit}
                    disabled={loading || !newComment.trim()}
                    variant="contained"
                    size="small"
                    style={{ backgroundColor: '#388e3c', color: '#fff', minWidth: 40, height: 40 }}
                >
                    <SendIcon fontSize="small" />
                </Button>
            </div>

            <div className={classes.commentList}>
                {comments.length === 0 ? (
                    <div className={classes.empty}>No comments yet</div>
                ) : (
                    comments.map((c) => (
                        <div key={c.id} className={classes.comment}>
                            <Avatar className={classes.avatar}>
                                <PersonIcon style={{ color: '#388e3c', fontSize: 18 }} />
                            </Avatar>
                            <div className={classes.commentContent}>
                                <div className={classes.commentHeader}>
                                    <span className={classes.commentUser}>{c.user_username || 'Unknown'}</span>
                                    <span className={classes.commentTime}>{timeAgo(c.created_at)}</span>
                                </div>
                                <div className={classes.commentText}>{c.text}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentSection;
