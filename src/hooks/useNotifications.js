import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Api from '../../scripts/Api';

const useNotifications = (user, adminToken) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!adminToken) return;
        setLoading(true);
        try {
            const data = await Api.getNotifications(adminToken);
            if (data && data.notifications) {
                setNotifications(data.notifications);
                setUnreadCount(data.notifications.filter(n => !n.is_read).length);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [adminToken]);

    const markAsRead = async (notificationId) => {
        if (!adminToken) return;
        try {
            await Api.markNotificationRead(notificationId, adminToken);
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        if (!adminToken) return;
        try {
            await Api.markAllNotificationsRead(adminToken);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
            toast.success("All notifications marked as read");
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
        }
    };

    useEffect(() => {
        if (adminToken) {
            fetchNotifications();
        }
    }, [adminToken, fetchNotifications]);

    useEffect(() => {
        if (!user?.admin_id) return;

        const wsUrlFromEnv = import.meta.env.VITE_WS_URL;
        let wsUrl = '';

        if (wsUrlFromEnv) {
            wsUrl = `${wsUrlFromEnv.endsWith('/') ? wsUrlFromEnv.slice(0, -1) : wsUrlFromEnv}/ws/notifications/${user.admin_id}`;
        } else {
            const apiBaseUrl = import.meta.env.VITE_ENV === "DEV"
                ? import.meta.env.VITE_BASE_URL_PRODUCTION
                : import.meta.env.VITE_BASE_URL_DEVELOPMENT;

            if (apiBaseUrl) {
                const wsBaseUrl = apiBaseUrl.replace(/^http/, 'ws');
                const sanitizedWsBaseUrl = wsBaseUrl.endsWith('/') ? wsBaseUrl.slice(0, -1) : wsBaseUrl;
                wsUrl = `${sanitizedWsBaseUrl}/ws/notifications/${user.admin_id}`;
            }
        }

        if (!wsUrl) {
            console.error("WebSocket URL could not be determined");
            return;
        }
        
        console.log("Connecting to WebSocket:", wsUrl);
        const socket = new WebSocket(wsUrl);

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("WebSocket Notification Received:", data);
                
                if (data.type === 'task_reminder') {
                    // Show real-time alert
                    toast.info(`🔔 ${data.title}: ${data.message}`, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                    
                    // Add to list and increment count
                    const newNotification = {
                        id: Date.now(), // Fallback ID if none provided
                        title: data.title,
                        message: data.message,
                        is_read: false,
                        created_at: new Date().toISOString(),
                        ...data
                    };
                    
                    setNotifications(prev => [newNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                } else if (data.type === 'email_reply') {
                    // Show real-time alert for email reply
                    toast.success(`✉️ New Reply: ${data.message}`, {
                        position: "top-right",
                        autoClose: 10000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });

                    const newNotification = {
                        id: Date.now(),
                        title: "New Email Reply",
                        message: data.message,
                        is_read: false,
                        created_at: new Date().toISOString(),
                        type: 'email_reply',
                        ...data
                    };

                    setNotifications(prev => [newNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                }
            } catch (error) {
                console.error("Error parsing WebSocket message:", error);
            }
        };

        socket.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };

        socket.onclose = () => {
            console.log("WebSocket connection closed");
        };

        return () => {
            socket.close();
        };
    }, [user?.admin_id]);

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        fetchNotifications
    };
};

export default useNotifications;
