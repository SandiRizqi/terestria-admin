import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

const AccessDenied = () => (
    <Box display="flex" flexDirection="column" alignItems="center" style={{ padding: 64 }}>
        <Typography variant="h6" style={{ color: '#c62828', fontWeight: 700, marginBottom: 8 }}>
            Access Denied
        </Typography>
        <Typography variant="body2" color="textSecondary">
            You need administrator privileges to access this page.
        </Typography>
    </Box>
);

export default AccessDenied;
