import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Settings, ChevronDown, User, LogOut, CheckCircle, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onLogout }) => {
    const { user, notifications, sidebarOpen, setSidebarOpen } = useApp();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const notificationRef = useRef(null);
    const profileRef = useRef(null);

    const unreadCount = notifications.filter(n => n.unread).length;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
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
                    <div className="relative" ref={notificationRef}>
                        <div
                            className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <Bell size={20} className="text-gray-500" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                            )}
                        </div>

                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900">Notifications</h3>
                                    <span className="text-xs text-primary font-medium cursor-pointer">Mark all as read</span>
                                </div>
                                <div className="max-h-[320px] overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((n) => (
                                            <div key={n.id} className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer">
                                                <div className="flex gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.unread ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                                                        <CheckCircle size={16} />
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm ${n.unread ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                                                        <p className="text-[10px] text-gray-300 mt-1 uppercase font-bold tracking-wider">{n.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center">
                                            <p className="text-sm text-gray-400">No new notifications</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                                    <span className="text-xs text-gray-500 font-medium cursor-pointer hover:text-primary transition-colors">View all updates</span>
                                </div>
                            </div>
                        )}
                    </div>

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
