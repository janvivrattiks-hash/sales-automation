import React, { createContext, useContext, useState, useEffect } from 'react';
import Api from '../../scripts/Api';

export const AppContext = createContext();


export const AppProvider = ({ children }) => {
    const [user, setUser] = useState({ name: 'Loading...', role: 'User' });
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState('light');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [adminToken, setAdminToken] = useState(localStorage.getItem('admin_token') || null);
    const [leads, setLeads] = useState([]);




    const filterLeads = async (filters, token) => {
        try {
            const response = await Api.filterLeads(filters, token);

            const data =
                Array.isArray(response)
                    ? response
                    : response?.data || response?.results || [];

            setLeads(data);   // store filtered leads globally
            return data;

        } catch (error) {
            console.error("Filter Leads Error:", error);
            return [];
        }
    };


    // Fetch current user when token is available
    useEffect(() => {
        const fetchCurrentUser = async () => {
            if (adminToken) {
                setLoading(true);
                try {
                    const userData = await Api.getCurrentUser(adminToken);
                    if (userData) {
                        // Map API response to user state
                        setUser({
                            id: userData.id,
                            admin_id: userData.admin_id,
                            name: userData.admin_name || 'User',
                            email: userData.admin_email || '',
                            phone: userData.phone_number || '',
                            role: 'Admin', // You can add role from API if available
                            is_active: userData.is_active,
                            created_at: userData.created_at,
                            updated_at: userData.updated_at,
                        });
                    }
                } catch (error) {
                    console.error('Error fetching user:', error);
                    // Keep default user if fetch fails
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchCurrentUser();
    }, [adminToken]);


    useEffect(() => {
        // Close sidebar by default on mobile
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    }, []);

    const value = {
        user,
        loading,
        setLoading,
        theme,
        setTheme,
        sidebarOpen,
        setSidebarOpen,
    };

    const contextValue = {
        ...value,
        adminToken,
        setAdminToken,
        setUser, // Allow manual user updates if needed
        filterLeads,
        leads,
        setLeads,
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

export default AppProvider;
