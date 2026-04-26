/**
 * Enhanced auth provider that wraps ra-data-django-rest-framework's tokenAuthProvider.
 *
 * Improvements over the default:
 * - checkAuth validates token against backend /api/mobile/me/ endpoint
 * - getPermissions returns user role info (is_staff, is_superuser, groups)
 * - getIdentity returns user display info
 * - Properly clears invalid/expired tokens
 */

const AUTH_TOKEN_URL = '/api-token-auth/';
const ME_URL = '/api/mobile/me/';

// Cache the user profile to avoid hitting /me/ on every route change
let cachedUserProfile = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return { Authorization: 'Token ' + token };
}

async function fetchUserProfile() {
    const now = Date.now();
    if (cachedUserProfile && (now - cacheTimestamp) < CACHE_TTL) {
        return cachedUserProfile;
    }

    const headers = getAuthHeaders();
    if (!headers) throw new Error('No token');

    const response = await fetch(ME_URL, {
        headers: { ...headers, 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        cachedUserProfile = null;
        throw new Error('Invalid token');
    }

    cachedUserProfile = await response.json();
    cacheTimestamp = now;
    return cachedUserProfile;
}

const authProvider = {
    login: async ({ username, password }) => {
        const request = new Request(AUTH_TOKEN_URL, {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: new Headers({ 'Content-Type': 'application/json' }),
        });
        const response = await fetch(request);
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            // Clear cache so fresh profile is fetched
            cachedUserProfile = null;
            cacheTimestamp = 0;
            return;
        }
        if (response.headers.get('content-type') !== 'application/json') {
            throw new Error(response.statusText);
        }
        const json = await response.json();
        const error = json.non_field_errors;
        throw new Error(error || response.statusText);
    },

    logout: () => {
        localStorage.removeItem('token');
        cachedUserProfile = null;
        cacheTimestamp = 0;
        return Promise.resolve();
    },

    checkAuth: () => {
        const token = localStorage.getItem('token');
        if (!token) return Promise.reject();
        // Validate token with backend (uses cache to avoid excessive requests)
        return fetchUserProfile()
            .then(() => Promise.resolve())
            .catch(() => {
                localStorage.removeItem('token');
                cachedUserProfile = null;
                return Promise.reject();
            });
    },

    checkError: (error) => {
        const status = error.status || (error.response && error.response.status);
        if (status === 401) {
            localStorage.removeItem('token');
            cachedUserProfile = null;
            cacheTimestamp = 0;
            return Promise.reject();
        }
        return Promise.resolve();
    },

    getPermissions: () => {
        const token = localStorage.getItem('token');
        if (!token) return Promise.reject();
        return fetchUserProfile()
            .then((profile) => ({
                is_staff: profile.is_staff,
                is_superuser: profile.is_superuser,
                groups: profile.groups || [],
                permissions: profile.permissions || [],
                workspaces: profile.workspaces || [],
            }))
            .catch(() => Promise.reject());
    },

    getIdentity: () => {
        const token = localStorage.getItem('token');
        if (!token) return Promise.reject();
        return fetchUserProfile()
            .then((profile) => ({
                id: profile.id,
                fullName: profile.first_name && profile.last_name
                    ? `${profile.first_name} ${profile.last_name}`
                    : profile.username,
                avatar: undefined,
            }))
            .catch(() => Promise.reject());
    },
};

export default authProvider;
