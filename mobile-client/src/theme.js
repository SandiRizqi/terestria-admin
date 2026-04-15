import { createMuiTheme } from '@material-ui/core/styles';

/**
 * Create a Terestria theme dynamically from AdminSettings values.
 * Falls back to defaults if no settings are provided.
 */
export function createTerestriaTheme(settings = {}) {
    const primary = settings.primary_color || '#388e3c';
    const primaryDark = settings.primary_dark || '#2e7d32';
    const primaryLight = settings.primary_light || '#66bb6a';
    const sidebar = settings.sidebar_color || '#1b5e20';
    const accent = settings.accent_color || '#4caf50';
    const background = settings.background_color || '#f6faf6';
    const fontFamily = settings.font_family || 'Plus Jakarta Sans';

    return createMuiTheme({
        palette: {
            primary: {
                main: primary,
                dark: primaryDark,
                light: primaryLight,
                contrastText: '#ffffff',
            },
            secondary: {
                main: accent,
                dark: primary,
                light: '#81c784',
            },
            background: {
                default: background,
            },
            text: {
                primary: '#1a2e1a',
                secondary: '#3d5a3d',
            },
        },
        typography: {
            fontFamily: `"${fontFamily}", "Roboto", "Helvetica", "Arial", sans-serif`,
        },
        overrides: {
            MuiAppBar: {
                colorSecondary: {
                    backgroundColor: primaryDark,
                    color: '#ffffff',
                },
            },
            MuiDrawer: {
                paper: {
                    backgroundColor: sidebar,
                    color: '#e8f5e9',
                },
            },
            MuiButton: {
                containedPrimary: {
                    backgroundColor: primary,
                    '&:hover': {
                        backgroundColor: primaryDark,
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
                    borderLeft: `3px solid ${primaryLight}`,
                    '& .MuiListItemIcon-root': {
                        color: '#ffffff',
                    },
                },
            },
            RaSidebar: {
                drawerPaper: {
                    backgroundColor: sidebar,
                },
            },
            RaLayout: {
                content: {
                    backgroundColor: background,
                },
            },
        },
    });
}

// Default theme (used as fallback)
const theme = createTerestriaTheme();

export default theme;
