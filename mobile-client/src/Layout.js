import React from 'react';
import { Layout as RALayout, MenuItemLink, AppBar } from 'react-admin';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import FolderIcon from '@material-ui/icons/Folder';
import FolderSpecialIcon from '@material-ui/icons/FolderSpecial';
import RoomIcon from '@material-ui/icons/Room';
import SyncIcon from '@material-ui/icons/Sync';
import PhoneAndroidIcon from '@material-ui/icons/PhoneAndroid';
import DevicesIcon from '@material-ui/icons/Devices';
import LayersIcon from '@material-ui/icons/Layers';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MapIcon from '@material-ui/icons/Map';
import PeopleIcon from '@material-ui/icons/People';
import GroupIcon from '@material-ui/icons/Group';
import SettingsIcon from '@material-ui/icons/Settings';
import Divider from '@material-ui/core/Divider';

const useMenuStyles = makeStyles({
    menu: {
        marginTop: 8,
    },
    sectionLabel: {
        padding: '16px 16px 4px',
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'rgba(255,255,255,0.45)',
    },
    divider: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        margin: '8px 16px',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        padding: '16px 16px 8px',
        gap: 10,
    },
    logoIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#66bb6a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 18,
        fontWeight: 800,
        color: '#ffffff',
        letterSpacing: '-0.02em',
    },
    logoDot: {
        color: '#66bb6a',
    },
});

const CustomMenu = ({ onMenuClick, dense }) => {
    const classes = useMenuStyles();
    return (
        <div className={classes.menu}>
            <div className={classes.logo}>
                <div className={classes.logoIcon}>
                    <RoomIcon style={{ color: '#1b5e20', fontSize: 22 }} />
                </div>
                <span className={classes.logoText}>
                    Terestria<span className={classes.logoDot}>.</span>
                </span>
            </div>
            <div className={classes.divider} style={{ margin: '12px 16px' }} />

            <div className={classes.sectionLabel}>Data Collection</div>
            <MenuItemLink to="/projects" primaryText="Projects" leftIcon={<FolderIcon />} onClick={onMenuClick} dense={dense} />
            <MenuItemLink to="/project-groups" primaryText="Project Groups" leftIcon={<FolderSpecialIcon />} onClick={onMenuClick} dense={dense} />
            <MenuItemLink to="/geodata" primaryText="GeoData" leftIcon={<RoomIcon />} onClick={onMenuClick} dense={dense} />
            <MenuItemLink to="/map" primaryText="Map View" leftIcon={<MapIcon />} onClick={onMenuClick} dense={dense} />

            <Divider className={classes.divider} />
            <div className={classes.sectionLabel}>Mobile</div>
            <MenuItemLink to="/sync-logs" primaryText="Sync Logs" leftIcon={<SyncIcon />} onClick={onMenuClick} dense={dense} />
            <MenuItemLink to="/app-versions" primaryText="App Versions" leftIcon={<PhoneAndroidIcon />} onClick={onMenuClick} dense={dense} />
            <MenuItemLink to="/fcm-tokens" primaryText="FCM Tokens" leftIcon={<DevicesIcon />} onClick={onMenuClick} dense={dense} />
            <MenuItemLink to="/notifications" primaryText="Notifications" leftIcon={<NotificationsIcon />} onClick={onMenuClick} dense={dense} />

            <Divider className={classes.divider} />
            <div className={classes.sectionLabel}>Authorization</div>
            <MenuItemLink to="/users" primaryText="Users" leftIcon={<PeopleIcon />} onClick={onMenuClick} dense={dense} />
            <MenuItemLink to="/groups" primaryText="Groups" leftIcon={<GroupIcon />} onClick={onMenuClick} dense={dense} />

            <Divider className={classes.divider} />
            <div className={classes.sectionLabel}>Configuration</div>
            <MenuItemLink to="/tms-layers" primaryText="TMS Layers" leftIcon={<LayersIcon />} onClick={onMenuClick} dense={dense} />
            <MenuItemLink to="/settings" primaryText="Settings" leftIcon={<SettingsIcon />} onClick={onMenuClick} dense={dense} />
        </div>
    );
};

const CustomAppBar = (props) => (
    <AppBar {...props}>
        <Typography variant="h6" color="inherit" style={{ flex: 1, fontWeight: 700 }}>
            Terestria Mobile Admin
        </Typography>
    </AppBar>
);

const Layout = (props) => (
    <RALayout {...props} menu={CustomMenu} appBar={CustomAppBar} />
);

export default Layout;
