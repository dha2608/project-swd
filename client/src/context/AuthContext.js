import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import apiClient, { getMe } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            getMe().then(response => {
                setUser(response.data.data);
            }).catch(() => {
                localStorage.removeItem('token');
            }).finally(() => {
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const responseInterceptor = apiClient.interceptors.response.use(
            (response) => response,
            (error) => {
                const { status, config } = error.response || {};
                
                if (status === 401 && config.url !== '/auth/login') {
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            apiClient.interceptors.response.eject(responseInterceptor);
        };
    }, [logout]);

    const login = useCallback(async (email, password) => {
        const { data } = await apiClient.post('/auth/login', { email, password });
        localStorage.setItem('token', data.data.token);
        const userResponse = await getMe();
        setUser(userResponse.data.data);
        return data;
    }, []);

    const register = useCallback(async (userData) => {
        const { data } = await apiClient.post('/auth/register', userData);
        localStorage.setItem('token', data.data.token);
        const userResponse = await getMe();
        setUser(userResponse.data.data);
        return data;
    }, []);

    const value = useMemo(() => ({
        user,
        setUser,
        isLoading,
        login,
        logout,
        register,
    }), [user, isLoading, login, logout, register]);

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};