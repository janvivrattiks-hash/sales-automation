import React, { createContext, useContext, useState, useEffect } from 'react';

export const AppContext = createContext();


export const AppProvider = ({ children }) => {
    const [user, setUser] = useState({ name: 'Alexander', role: 'Sales Lead' });
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState('light');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [adminToken, setAdminToken] = useState(null);


    // Load tokens on mount
    useEffect(() => {
        const savedAdminToken = localStorage.getItem('admin_token');


        setAdminToken(savedAdminToken || null);
    }, []);


    useEffect(() => {
        // Close sidebar by default on mobile
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    }, []);

    // Mock notifications
    const [notifications, setNotifications] = useState([
        { id: 1, text: 'New lead assigned to you', time: '2 mins ago', unread: true },
        { id: 2, text: 'Search results for "SaaS Founders" ready', time: '1 hour ago', unread: false },
    ]);

    const value = {
        user,
        loading,
        setLoading,
        theme,
        setTheme,
        sidebarOpen,
        setSidebarOpen,
        notifications,
        setNotifications,
    };

    const contextValue = {
        ...value,
        adminToken,
        setAdminToken,
    };

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
