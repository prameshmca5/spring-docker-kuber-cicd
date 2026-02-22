import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [loading, setLoading] = useState(true);

    // Global Axios interceptor for authenticated requests
    useEffect(() => {
        const interceptor = axios.interceptors.request.use((config) => {
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        return () => {
            axios.interceptors.request.eject(interceptor);
        };
    }, [token]);

    // In a real application, you'd decode the JWT here to get user info.
    // We'll mimic fetching user data if a token exists for simplicity.
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            try {
                // Decode token manually or just set user info (payload is base64)
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ username: payload.sub, id: payload.userId, role: payload.role });
            } catch (error) {
                console.error("Invalid token format");
                setToken('');
                setUser(null);
                localStorage.removeItem('token');
            }
        } else {
            localStorage.removeItem('token');
            setUser(null);
        }
        setLoading(false);
    }, [token]);

    const login = async (username, password) => {
        const response = await axios.post('/api/v1/auth/login', { username, password });
        if (response.data && response.data.token) {
            setToken(response.data.token);
            return true;
        }
        return false;
    };

    const register = async (username, email, password) => {
        const response = await axios.post('/api/v1/auth/register', { username, email, password, role: 'USER' });
        return response.data;
    };

    const logout = () => {
        setToken('');
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
