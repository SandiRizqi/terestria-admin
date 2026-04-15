import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import { makeStyles } from '@material-ui/core/styles';

const ACTION_CONFIG = {
    create: { icon: AddCircleIcon, color: '#2e7d32', bg: '#e8f5e9', label: 'Created' },
    update: { icon: EditIcon, color: '#1565c0', bg: '#e3f2fd', label: 'Updated' },
    delete: { icon: DeleteIcon, color: '#c62828', bg: '#ffebee', label: 'Deleted' },
    status_change: { icon: SwapHorizIcon, color: '#e65100', bg: '#fff3e0', label: 'Status Changed' },
};

const useStyles = makeStyles({
    root: {
        padding: 0,
    },
    listItem: {
        borderBottom: '1px solid #f0f5f0',
        padding: '8px 0',
    },
    timestamp: {
        fontSize: 11,
        color: '#9ab89a',
    },
    model: {
        fontSize: 12,
        color: '#6b8f6b',
        fontWeight: 600,
    },
});

function timeAgo(dateStr) {
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return then.toLocaleDateString();
}

const ActivityFeed = ({ items = [], maxItems = 20 }) => {
    const classes = useStyles();

    if (!items || items.length === 0) {
        return (
            <Typography variant="body2" style={{ color: '#9ab89a', padding: '16px 0', textAlign: 'center' }}>
                No activity yet
            </Typography>
        );
    }

    const displayItems = items.slice(0, maxItems);

    return (
        <List className={classes.root} dense>
            {displayItems.map((item, idx) => {
                const config = ACTION_CONFIG[item.action] || ACTION_CONFIG.update;
                const IconComponent = config.icon;
                return (
                    <ListItem key={item.id || idx} className={classes.listItem} disableGutters>
                        <ListItemAvatar>
                            <Avatar style={{ backgroundColor: config.bg, width: 34, height: 34 }}>
                                <IconComponent style={{ color: config.color, fontSize: 18 }} />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <span>
                                    <strong style={{ color: '#1a2e1a' }}>{item.user_username || 'System'}</strong>
                                    {' '}
                                    <span style={{ color: config.color, fontWeight: 600, fontSize: 13 }}>
                                        {config.label.toLowerCase()}
                                    </span>
                                    {' '}
                                    <span className={classes.model}>{item.model_name}</span>
                                </span>
                            }
                            secondary={
                                <span>
                                    <span style={{ color: '#6b8f6b', fontSize: 12 }}>{item.object_repr}</span>
                                    {' · '}
                                    <span className={classes.timestamp}>{timeAgo(item.created_at)}</span>
                                </span>
                            }
                        />
                    </ListItem>
                );
            })}
        </List>
    );
};

export default ActivityFeed;
