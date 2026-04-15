import React, { useState, useEffect } from 'react';
import { useDataProvider } from 'react-admin';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FolderIcon from '@material-ui/icons/Folder';
import RoomIcon from '@material-ui/icons/Room';
import SyncIcon from '@material-ui/icons/Sync';
import PhoneAndroidIcon from '@material-ui/icons/PhoneAndroid';
import DevicesIcon from '@material-ui/icons/Devices';
import PeopleIcon from '@material-ui/icons/People';
import { makeStyles } from '@material-ui/core/styles';

import DataTrendsChart from './dashboard/DataTrendsChart';
import ProjectBarChart from './dashboard/ProjectBarChart';
import GeometryDistributionChart from './dashboard/GeometryDistributionChart';
import CollectorPieChart from './dashboard/CollectorPieChart';
import SyncActivityChart from './dashboard/SyncActivityChart';
import ActivityFeed from './components/ActivityFeed';

const useStyles = makeStyles({
    root: {
        padding: 24,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontWeight: 800,
        color: '#1b5e20',
        fontSize: 28,
    },
    subtitle: {
        color: '#6b8f6b',
        marginTop: 4,
    },
    card: {
        minHeight: 140,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 12,
        border: '1px solid #e0ece0',
        boxShadow: '0 2px 8px rgba(46,125,50,0.06)',
        transition: 'all 0.2s ease',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 16px rgba(46,125,50,0.12)',
            borderColor: '#66bb6a',
        },
    },
    cardContent: {
        position: 'relative',
        padding: '20px 24px !important',
    },
    iconWrap: {
        width: 48,
        height: 48,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    value: {
        fontSize: 32,
        fontWeight: 800,
        lineHeight: 1,
    },
    label: {
        fontSize: 13,
        fontWeight: 600,
        color: '#6b8f6b',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
    },
    sectionTitle: {
        fontWeight: 700,
        color: '#1b5e20',
        fontSize: 20,
        marginTop: 32,
        marginBottom: 16,
    },
    activityCard: {
        borderRadius: 12,
        border: '1px solid #e0ece0',
        padding: '16px 20px',
    },
});

const StatCard = ({ title, value, icon: Icon, color, bgColor }) => {
    const classes = useStyles();
    return (
        <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
                <div className={classes.iconWrap} style={{ backgroundColor: bgColor }}>
                    <Icon style={{ color, fontSize: 24 }} />
                </div>
                <Typography className={classes.value} style={{ color }}>{value}</Typography>
                <Typography className={classes.label}>{title}</Typography>
            </CardContent>
        </Card>
    );
};

const Dashboard = () => {
    const classes = useStyles();
    const dataProvider = useDataProvider();
    const [stats, setStats] = useState({
        projects: 0,
        geodata: 0,
        syncLogs: 0,
        appVersions: 0,
        fcmTokens: 0,
        users: 0,
    });
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [projects, geodata, syncLogs, appVersions, fcmTokens, users] = await Promise.all([
                    dataProvider.getList('projects', { pagination: { page: 1, perPage: 1 }, sort: { field: 'id', order: 'DESC' }, filter: {} }),
                    dataProvider.getList('geodata', { pagination: { page: 1, perPage: 1 }, sort: { field: 'id', order: 'DESC' }, filter: {} }),
                    dataProvider.getList('sync-logs', { pagination: { page: 1, perPage: 1 }, sort: { field: 'id', order: 'DESC' }, filter: {} }),
                    dataProvider.getList('app-versions', { pagination: { page: 1, perPage: 1 }, sort: { field: 'id', order: 'DESC' }, filter: {} }),
                    dataProvider.getList('fcm-tokens', { pagination: { page: 1, perPage: 1 }, sort: { field: 'id', order: 'DESC' }, filter: {} }),
                    dataProvider.getList('users', { pagination: { page: 1, perPage: 1 }, sort: { field: 'id', order: 'DESC' }, filter: {} }),
                ]);
                setStats({
                    projects: projects.total,
                    geodata: geodata.total,
                    syncLogs: syncLogs.total,
                    appVersions: appVersions.total,
                    fcmTokens: fcmTokens.total,
                    users: users.total,
                });
            } catch (e) {
                console.error('Dashboard stats error:', e);
            }
        };
        fetchStats();
    }, [dataProvider]);

    // Fetch analytics data
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        fetch('/api/mobile/analytics/dashboard/', {
            headers: { Authorization: 'Token ' + token, 'Content-Type': 'application/json' },
        })
            .then((r) => r.json())
            .then((data) => setAnalytics(data))
            .catch((e) => console.error('Analytics error:', e));
    }, []);

    return (
        <div className={classes.root}>
            <div className={classes.header}>
                <Typography className={classes.title}>
                    Terestria Mobile Admin
                </Typography>
                <Typography className={classes.subtitle} variant="body2">
                    Mobile GIS data collection management dashboard
                </Typography>
            </div>

            {/* Stat Cards */}
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard title="Projects" value={stats.projects} icon={FolderIcon}
                        color="#2e7d32" bgColor="#e8f5e9" />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard title="GeoData" value={stats.geodata} icon={RoomIcon}
                        color="#388e3c" bgColor="#e8f5e9" />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard title="Sync Logs" value={stats.syncLogs} icon={SyncIcon}
                        color="#e65100" bgColor="#fff3e0" />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard title="App Versions" value={stats.appVersions} icon={PhoneAndroidIcon}
                        color="#6a1b9a" bgColor="#f3e5f5" />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard title="FCM Tokens" value={stats.fcmTokens} icon={DevicesIcon}
                        color="#1565c0" bgColor="#e3f2fd" />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <StatCard title="Users" value={stats.users} icon={PeopleIcon}
                        color="#2e7d32" bgColor="#e8f5e9" />
                </Grid>
            </Grid>

            {/* Charts Section */}
            {analytics && (
                <>
                    <Typography className={classes.sectionTitle}>Analytics</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <DataTrendsChart data={analytics.geodata_by_date} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <GeometryDistributionChart data={analytics.geodata_by_geometry} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <ProjectBarChart data={analytics.geodata_by_project} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <CollectorPieChart data={analytics.geodata_by_collector} />
                        </Grid>
                        <Grid item xs={12}>
                            <SyncActivityChart data={analytics.sync_activity} />
                        </Grid>
                    </Grid>

                    {/* Activity Feed */}
                    <Typography className={classes.sectionTitle}>Recent Activity</Typography>
                    <Card className={classes.activityCard}>
                        <ActivityFeed items={analytics.recent_activity} maxItems={15} />
                    </Card>
                </>
            )}
        </div>
    );
};

export default Dashboard;
