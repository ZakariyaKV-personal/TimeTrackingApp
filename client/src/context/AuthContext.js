// context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    // Load authentication state from localStorage on initial render
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedAccessToken = localStorage.getItem('accessToken');
        
        if (storedUser && storedAccessToken) {
            setUser(JSON.parse(storedUser)); // Parse the JSON string back to an object
            setIsAuthenticated(true);
        }
    }, []);

    const login = (accessToken, refreshToken, userData) => {
        setIsAuthenticated(true);
        setUser(userData);
        
        // Store data in localStorage as strings
        localStorage.setItem('user', JSON.stringify(userData)); // Store as JSON string
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('username', userData.name);
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, userId: user?.id, username: user?.name }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
