import React, { useState, useEffect } from 'react';
import { Admin, Resource } from 'react-admin';
import { render } from 'react-dom';
import { Route } from 'react-router-dom';
import drfProvider, { fetchJsonWithAuthToken } from 'ra-data-django-rest-framework';

import { createTerestriaTheme } from './theme';
import Dashboard from './Dashboard';
import Layout from './Layout';
import projects from './projects';
import projectGroups from './project-groups';
import geodata from './geodata';
import syncLogs from './sync-logs';
import fcmTokens from './fcm-tokens';
import tmsLayers from './tms-layers';
import notifications from './notifications';
import users from './users';
import groups from './groups';
import auditLogs from './audit-logs';
import tasks from './tasks';
import workspaces from './workspaces';
import authProvider from './authProvider';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import MapView from './map-view/MapView';
import SettingsPage from './settings/SettingsPage';

// Wrap fetchJsonWithAuthToken to inject the active workspace header
const httpClient = (url, options = {}) => {
    const workspaceId = localStorage.getItem('workspace_id');
    if (workspaceId) {
        if (!options.headers) {
            options.headers = new Headers({ Accept: 'application/json' });
        }
        options.headers.set('X-Workspace', workspaceId);
    }
    return fetchJsonWithAuthToken(url, options);
};

const dataProvider = drfProvider("/api/mobile", httpClient);

const App = () => {
    const [theme, setTheme] = useState(createTerestriaTheme());

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        fetch('/api/mobile/admin-settings/', {
            headers: { Authorization: `Token ${token}` },
        })
            .then((r) => r.json())
            .then((data) => {
                const settings = data.results && data.results[0];
                if (settings) setTheme(createTerestriaTheme(settings));
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (e.detail) setTheme(createTerestriaTheme(e.detail));
        };
        window.addEventListener('terestria-settings-updated', handler);
        return () => window.removeEventListener('terestria-settings-updated', handler);
    }, []);

    return (
        <Admin
            authProvider={authProvider}
            dataProvider={dataProvider}
            dashboard={Dashboard}
            layout={Layout}
            loginPage={LoginPage}
            theme={theme}
            title="Terestria Mobile Admin"
            customRoutes={[
                <Route exact path="/map" component={MapView} />,
                <Route exact path="/settings" component={SettingsPage} noLayout={false} />,
                <Route exact path="/register" component={RegisterPage} noLayout />,
            ]}
        >
            <Resource name="workspaces" {...workspaces} />
            <Resource name="projects" {...projects} />
            <Resource name="project-groups" {...projectGroups} />
            <Resource name="geodata" {...geodata} />
            <Resource name="sync-logs" {...syncLogs} />
            <Resource name="fcm-tokens" {...fcmTokens} />
            <Resource name="tms-layers" {...tmsLayers} />
            <Resource name="notifications" {...notifications} />
            <Resource name="users" {...users} />
            <Resource name="groups" {...groups} />
            <Resource name="tasks" {...tasks} />
            <Resource name="audit-logs" {...auditLogs} />
            <Resource name="geodata-comments" />
            <Resource name="permissions" />
            <Resource name="admin-settings" />
        </Admin>
    );
};

render(<App />, document.getElementById('root'));
