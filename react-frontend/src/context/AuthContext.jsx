import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { setAuthToken as setAxiosAuthToken, getAuthToken } from '../utils/axiosInterceptor';
import { apiLogger } from '../utils/logger';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [loading, setLoading] = useState(true);

    // Update axios auth token when token changes
    useEffect(() => {
        setAxiosAuthToken(token);

        // Setup global axios interceptor for auth
        const interceptor = axios.interceptors.request.use((config) => {
            const currentToken = getAuthToken();
            if (currentToken) {
                config.headers.Authorization = `Bearer ${currentToken}`;
            }
            return config;
        });

        return () => {
            axios.interceptors.request.eject(interceptor);
        };
    }, [token]);

    // Decode and validate token
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            try {
                // Decode JWT payload (it's base64 encoded JSON)
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({
                    username: payload.sub,
                    id: payload.userId,
                    role: payload.role
                });
                apiLogger.info('User authenticated successfully', {
                    username: payload.sub,
                    role: payload.role
                });
            } catch (error) {
                apiLogger.error('Invalid token format', { error: error.message });
                setToken('');
                setUser(null);
                localStorage.removeItem('token');
                setAxiosAuthToken('');
            }
        } else {
            localStorage.removeItem('token');
            setUser(null);
            apiLogger.debug('User logged out');
        }
        setLoading(false);
    }, [token]);

    const login = async (username, password) => {
        try {
            apiLogger.debug('Attempting login', { username });
            const response = await axios.post('/api/v1/auth/login', { username, password });
            if (response.data && response.data.token) {
                setToken(response.data.token);
                apiLogger.info('Login successful', { username });
                return true;
            }
            return false;
        } catch (error) {
            apiLogger.error('Login failed', {
                username,
                status: error.response?.status,
                message: error.response?.data?.message || error.message
            });
            throw error;
        }
    };

    const register = async (username, email, password) => {
        try {
            apiLogger.debug('Attempting registration', { username, email });
            const response = await axios.post('/api/v1/auth/register', {
                username,
                email,
                password,
                role: 'USER'
            });
            apiLogger.info('Registration successful', { username, email });
            return response.data;
        } catch (error) {
            apiLogger.error('Registration failed', {
                username,
                email,
                status: error.response?.status,
                message: error.response?.data?.message || error.message
            });
            throw error;
        }
    };

    const logout = () => {
        setToken('');
        setUser(null);
        localStorage.removeItem('token');
        setAxiosAuthToken('');
        apiLogger.info('User logged out');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
