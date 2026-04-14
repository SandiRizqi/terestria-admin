import React from 'react';
import { Admin, Resource } from 'react-admin';
import { render } from 'react-dom';
import { Route } from 'react-router-dom';
import drfProvider, { tokenAuthProvider, fetchJsonWithAuthToken } from 'ra-data-django-rest-framework';

import theme from './theme';
import Dashboard from './Dashboard';
import Layout from './Layout';
import projects from './projects';
import projectGroups from './project-groups';
import geodata from './geodata';
import syncLogs from './sync-logs';
import appVersions from './app-versions';
import fcmTokens from './fcm-tokens';
import tmsLayers from './tms-layers';
import notifications from './notifications';
import users from './users';
import groups from './groups';
import LoginPage from './LoginPage';
import MapView from './map-view/MapView';
import SettingsPage from './settings/SettingsPage';

const authProvider = tokenAuthProvider();
const dataProvider = drfProvider("/api/mobile", fetchJsonWithAuthToken);

render(
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
        ]}
    >
        <Resource name="projects" {...projects} />
        <Resource name="project-groups" {...projectGroups} />
        <Resource name="geodata" {...geodata} />
        <Resource name="sync-logs" {...syncLogs} />
        <Resource name="app-versions" {...appVersions} />
        <Resource name="fcm-tokens" {...fcmTokens} />
        <Resource name="tms-layers" {...tmsLayers} />
        <Resource name="notifications" {...notifications} />
        <Resource name="users" {...users} />
        <Resource name="groups" {...groups} />
        <Resource name="permissions" />
        <Resource name="admin-settings" />
    </Admin>,
    document.getElementById('root')
);
