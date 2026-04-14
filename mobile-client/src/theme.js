import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#388e3c',
            dark: '#2e7d32',
            light: '#66bb6a',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#4caf50',
            dark: '#388e3c',
            light: '#81c784',
        },
        background: {
            default: '#f6faf6',
        },
        text: {
            primary: '#1a2e1a',
            secondary: '#3d5a3d',
        },
    },
    typography: {
        fontFamily: '"Plus Jakarta Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    overrides: {
        MuiAppBar: {
            colorSecondary: {
                backgroundColor: '#2e7d32',
                color: '#ffffff',
            },
        },
        MuiDrawer: {
            paper: {
                backgroundColor: '#1b5e20',
                color: '#e8f5e9',
            },
        },
        MuiButton: {
            containedPrimary: {
                backgroundColor: '#388e3c',
                '&:hover': {
                    backgroundColor: '#2e7d32',
                },
            },
        },
        RaMenuItemLink: {
            root: {
                color: '#c8e6c9',
                '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.08)',
                },
                '& .MuiListItemIcon-root': {
                    color: '#a5d6a7',
                },
            },
            active: {
                color: '#ffffff',
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderLeft: '3px solid #66bb6a',
                '& .MuiListItemIcon-root': {
                    color: '#ffffff',
                },
            },
        },
        RaSidebar: {
            drawerPaper: {
                backgroundColor: '#1b5e20',
            },
        },
        RaLayout: {
            content: {
                backgroundColor: '#f6faf6',
            },
        },
    },
});

export default theme;
