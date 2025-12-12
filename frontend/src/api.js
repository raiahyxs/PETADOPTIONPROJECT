// --- api.js ---

const API_BASE = 'http://localhost:8000/api/';

/**
 * Helper function to retrieve the user's token from local storage.
 * @returns {string | null} The JWT token or null.
 */
const getToken = () => {
    const storedUser = localStorage.getItem('petUser');
    if (storedUser) {
        try {
            return JSON.parse(storedUser).token;
        } catch (e) {
            console.error("Error parsing user from localStorage:", e);
            return null;
        }
    }
    return null;
};

/**
 * Helper function to handle fetch responses and extract meaningful errors.
 * @param {Response} res - The fetch response object.
 * @returns {Promise<Object>} The JSON response data.
 * @throws {Error} An error with a detailed message.
 */
const handleResponse = async (res) => {
    if (!res.ok) {
        let errorDetail = 'A network or server error occurred.';
        
        try {
            const err = await res.json();
            // Handle common Django REST Framework error formats
            if (err.detail) {
                errorDetail = err.detail;
            } else if (err.username) {
                errorDetail = `Username error: ${err.username[0]}`;
            } else if (err.password) {
                errorDetail = `Password error: ${err.password[0]}`;
            } else if (err.non_field_errors) {
                errorDetail = err.non_field_errors[0];
            } else {
                errorDetail = `Request failed with status ${res.status}`;
            }
        } catch (e) {
            // Handle non-JSON errors (e.g., 404, 405)
            if (res.status === 404) {
                 errorDetail = `Endpoint not found: Check server URL configuration.`;
            } else if (res.status === 405) {
                 errorDetail = `Method not allowed: Check server for POST method support on this route.`;
            } else if (res.status === 401 || res.status === 403) {
                 errorDetail = `Authorization failed (Status ${res.status}). Ensure you are logged in as an Admin.`;
            } else {
                errorDetail = `Server error: Status ${res.status}`;
            }
        }
        throw new Error(errorDetail);
    }
    return res.json();
};

export const api = {
    // -------------------
    // --- AUTHENTICATION ---
    // -------------------

    /**
     * Logs in a user, exchanging credentials for a token.
     */
    login: async (username, password) => {
        const res = await fetch(`${API_BASE}login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        
        const data = await handleResponse(res);
        const token = data.token || data.key || data.access;
        const userDetails = data.user || data;

        if (!token) {
             throw new Error("Authentication failed: Missing token in response.");
        }
        
        const role = userDetails.role || 'user'; 

        return { 
            ...userDetails, 
            token: token,
            role: role
        };
    },

    /**
     * Registers a new user.
     */
    register: async (userData) => {
        const res = await fetch(`${API_BASE}register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: userData.name || userData.first_name,
                username: userData.username,
                password: userData.password
            }),
        });
        return await handleResponse(res);
    },

    // -------------------
    // --- RESOURCE GETTERS ---
    // -------------------

    /**
     * Fetches a list of adoption requests (Admin required).
     * 🚨 FIX: This now correctly sends the Authorization header.
     * @returns {Promise<Array<Object>>} List of requests.
     */
    fetchRequests: async () => {
        const token = getToken();
        if (!token) {
            throw new Error("Cannot fetch requests: User not authenticated.");
        }
        
        const res = await fetch(`${API_BASE}requests/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return await handleResponse(res);
    },

    /**
     * Fetches a list of available pets for adoption.
     * @returns {Promise<Array<Object>>} List of pet objects.
     */
    fetchPets: async () => {
        const res = await fetch(`${API_BASE}pets/`);
        return await handleResponse(res);
    },

    // ...add other real API endpoints as needed...
};