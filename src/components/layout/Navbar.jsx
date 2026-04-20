import React, { useState, useRef, useEffect } from 'react';
import { Search, Settings, ChevronDown, User, LogOut, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from '../ui/NotificationCenter';
import useNotifications from '../../hooks/useNotifications';

const Navbar = ({ onLogout }) => {
    const { user, sidebarOpen, setSidebarOpen, adminToken } = useApp();
    const navigate = useNavigate();
    const { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        loading: isLoadingNotifications 
    } = useNotifications(user, adminToken);

    const [showProfile, setShowProfile] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className={`fixed top-0 right-0 h-20 bg-white border-b border-gray-100 z-40 transition-all duration-300 left-0 
            ${sidebarOpen ? 'md:left-64' : 'md:left-20'}`}>
            <div className="h-full px-4 md:px-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 md:hidden"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="relative w-96 hidden lg:block">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Search size={18} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search leads, companies, or tasks..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Notifications */}
                    <NotificationCenter 
                        notifications={notifications}
                        unreadCount={unreadCount}
                        markAsRead={markAsRead}
                        markAllAsRead={markAllAsRead}
                        isLoading={isLoadingNotifications}
                    />

                    {/* User Profile */}
                    <div className="relative" ref={profileRef}>
                        <div
                            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            onClick={() => setShowProfile(!showProfile)}
                        >
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                {user.name.charAt(0)}
                            </div>
                            <div className="hidden lg:block">
                                <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.role}</p>
                            </div>
                            <ChevronDown
                                size={16}
                                className={`text-gray-400 transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`}
                            />
                        </div>

                        {showProfile && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-2">
                                    <button
                                        onClick={() => {
                                            setShowProfile(false);
                                            navigate('/edit-profile');
                                        }}
                                        className="flex items-center gap-3 w-full p-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <User size={18} />
                                        <span>Edit Profile</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowProfile(false);
                                            navigate('/settings');
                                        }}
                                        className="flex items-center gap-3 w-full p-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <Settings size={18} />
                                        <span>Settings</span>
                                    </button>
                                    <div className="my-1 border-t border-gray-100"></div>
                                    <button
                                        onClick={() => {
                                            setShowProfile(false);
                                            onLogout();
                                        }}
                                        className="flex items-center gap-3 w-full p-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <LogOut size={18} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
