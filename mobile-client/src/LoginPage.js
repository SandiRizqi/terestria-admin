import React, { useState } from 'react';
import { useLogin, useNotify } from 'react-admin';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import RoomIcon from '@material-ui/icons/Room';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    root: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f6faf6',
    },
    leftPanel: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    rightPanel: {
        flex: 1,
        background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        padding: 60,
        '@media (max-width: 960px)': {
            display: 'none',
        },
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
    },
    logoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 40,
    },
    logoIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#388e3c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 24,
        fontWeight: 800,
        color: '#1b5e20',
        letterSpacing: '-0.02em',
    },
    logoDot: {
        color: '#66bb6a',
    },
    title: {
        fontSize: 28,
        fontWeight: 800,
        color: '#1b5e20',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b8f6b',
        marginBottom: 32,
    },
    textField: {
        marginBottom: 20,
        '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '&:hover fieldset': { borderColor: '#66bb6a' },
            '&.Mui-focused fieldset': { borderColor: '#388e3c' },
        },
        '& .MuiInputLabel-root.Mui-focused': { color: '#388e3c' },
    },
    submitButton: {
        width: '100%',
        padding: '12px 0',
        borderRadius: 10,
        fontSize: 15,
        fontWeight: 700,
        textTransform: 'none',
        backgroundColor: '#388e3c',
        color: '#ffffff',
        '&:hover': {
            backgroundColor: '#2e7d32',
        },
    },
    // Right panel
    heroTitle: {
        fontSize: 36,
        fontWeight: 800,
        marginBottom: 16,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 14,
        fontFamily: '"JetBrains Mono", monospace',
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 40,
        textAlign: 'center',
    },
    featureList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    featureItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
        fontSize: 15,
        color: 'rgba(255,255,255,0.9)',
    },
    featureDot: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: '#66bb6a',
        flexShrink: 0,
    },
});

const LoginPage = () => {
    const classes = useStyles();
    const login = useLogin();
    const notify = useNotify();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        login({ username, password })
            .catch(() => {
                notify('Invalid username or password', 'error');
            })
            .finally(() => setLoading(false));
    };

    return (
        <div className={classes.root}>
            <div className={classes.leftPanel}>
                <div className={classes.formContainer}>
                    <div className={classes.logoRow}>
                        <div className={classes.logoIcon}>
                            <RoomIcon style={{ color: '#ffffff', fontSize: 26 }} />
                        </div>
                        <span className={classes.logoText}>
                            Terestria<span className={classes.logoDot}>.</span>
                        </span>
                    </div>

                    <div className={classes.title}>Welcome back</div>
                    <div className={classes.subtitle}>Sign in to the Mobile Admin panel</div>

                    <form onSubmit={handleSubmit}>
                        <TextField
                            className={classes.textField}
                            label="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            variant="outlined"
                            fullWidth
                            autoFocus
                            autoComplete="username"
                        />
                        <TextField
                            className={classes.textField}
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            variant="outlined"
                            fullWidth
                            autoComplete="current-password"
                        />
                        <Button
                            type="submit"
                            className={classes.submitButton}
                            disabled={loading}
                            variant="contained"
                            disableElevation
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>
                </div>
            </div>

            <div className={classes.rightPanel}>
                <div className={classes.heroTitle}>Mobile GIS<br />Admin Panel</div>
                <div className={classes.heroSubtitle}>// Offline-First &middot; PostGIS &middot; Vector Tiles</div>
                <ul className={classes.featureList}>
                    <li className={classes.featureItem}>
                        <span className={classes.featureDot} />
                        Manage survey projects and field data
                    </li>
                    <li className={classes.featureItem}>
                        <span className={classes.featureDot} />
                        View and edit GeoData with interactive maps
                    </li>
                    <li className={classes.featureItem}>
                        <span className={classes.featureDot} />
                        Monitor sync activity and device status
                    </li>
                    <li className={classes.featureItem}>
                        <span className={classes.featureDot} />
                        Control app versions and push notifications
                    </li>
                    <li className={classes.featureItem}>
                        <span className={classes.featureDot} />
                        User authorization with groups and permissions
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default LoginPage;
