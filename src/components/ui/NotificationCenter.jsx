import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle, Clock } from 'lucide-react';

const NotificationCenter = ({ 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    isLoading 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatTimeAgo = (dateString) => {
        if (!dateString) return 'Just now';
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell size={20} className="text-gray-500" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
            </div>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    markAllAsRead();
                                }}
                                className="text-[10px] text-primary font-bold uppercase tracking-wider hover:underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto mb-2"></div>
                                <p className="text-xs text-gray-400">Loading notifications...</p>
                            </div>
                        ) : notifications.length > 0 ? (
                            notifications.map((n) => (
                                <div 
                                    key={n.id} 
                                    onClick={() => !n.is_read && markAsRead(n.id)}
                                    className={`p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer ${!n.is_read ? 'bg-primary/5' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!n.is_read ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                                            <CheckCircle size={16} />
                                        </div>
                                        <div>
                                            <p className={`text-sm ${!n.is_read ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                                            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{n.message}</p>
                                            <div className="flex items-center gap-1.5 mt-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{formatTimeAgo(n.created_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 text-center">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Bell size={20} className="text-gray-300" />
                                </div>
                                <p className="text-sm text-gray-400">No new notifications</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest cursor-pointer hover:text-primary transition-colors">
                            View all updates
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
