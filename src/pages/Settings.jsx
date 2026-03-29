import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChevronLeft, Moon, Sun, Monitor, Bell, Globe, Lock, Eye, EyeOff } from 'lucide-react';
import Card from '../components/ui/Card';
import Toggle from '../components/ui/Toggle';

const Settings = () => {
    const navigate = useNavigate();
    const { theme, setTheme } = useApp();
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        sms: false,
    });

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        // TODO: Persist theme preference to backend if needed
    };

    const handleNotificationToggle = (type) => {
        setNotifications(prev => ({
            ...prev,
            [type]: !prev[type]
        }));
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 max-w-3xl pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your application preferences and configurations.</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-bold"
                >
                    <ChevronLeft size={16} />
                    Back
                </button>
            </div>

            {/* Appearance Settings */}
            <Card title="Appearance" subtitle="Customize how the application looks">
                <div className="mt-6 space-y-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Theme Mode</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Light Mode */}
                        <button
                            onClick={() => handleThemeChange('light')}
                            className={`p-4 rounded-xl border-2 transition-all ${theme === 'light'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className={`p-3 rounded-lg ${theme === 'light' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    <Sun size={24} />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-gray-900">Light</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Bright interface</p>
                                </div>
                            </div>
                        </button>

                        {/* Dark Mode */}
                        <button
                            onClick={() => handleThemeChange('dark')}
                            className={`p-4 rounded-xl border-2 transition-all ${theme === 'dark'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    <Moon size={24} />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-gray-900">Dark</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Easy on eyes</p>
                                </div>
                            </div>
                        </button>

                        {/* System Mode */}
                        <button
                            onClick={() => handleThemeChange('system')}
                            className={`p-4 rounded-xl border-2 transition-all ${theme === 'system'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className={`p-3 rounded-lg ${theme === 'system' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    <Monitor size={24} />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-gray-900">System</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Auto adjust</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </Card>

            {/* Notification Settings */}
            <Card title="Notifications" subtitle="Manage how you receive updates">
                <div className="mt-6 space-y-4">
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/5 rounded-lg text-primary">
                                <Bell size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Email Notifications</p>
                                <p className="text-xs text-gray-500 mt-0.5">Receive updates via email</p>
                            </div>
                        </div>
                        <Toggle
                            checked={notifications.email}
                            onChange={() => handleNotificationToggle('email')}
                        />
                    </div>

                    {/* Push Notifications */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/5 rounded-lg text-primary">
                                <Bell size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Push Notifications</p>
                                <p className="text-xs text-gray-500 mt-0.5">Get browser notifications</p>
                            </div>
                        </div>
                        <Toggle
                            checked={notifications.push}
                            onChange={() => handleNotificationToggle('push')}
                        />
                    </div>

                    {/* SMS Notifications */}
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/5 rounded-lg text-primary">
                                <Bell size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">SMS Notifications</p>
                                <p className="text-xs text-gray-500 mt-0.5">Receive text messages</p>
                            </div>
                        </div>
                        <Toggle
                            checked={notifications.sms}
                            onChange={() => handleNotificationToggle('sms')}
                        />
                    </div>
                </div>
            </Card>

            {/* Privacy & Security */}
            <Card title="Privacy & Security" subtitle="Manage your account security">
                <div className="mt-6 space-y-4">
                    <button className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/5 rounded-lg text-primary">
                                <Lock size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-gray-900">Change Password</p>
                                <p className="text-xs text-gray-500 mt-0.5">Update your account password</p>
                            </div>
                        </div>
                        <ChevronLeft size={18} className="text-gray-400 rotate-180" />
                    </button>

                    <button className="w-full flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/5 rounded-lg text-primary">
                                <Eye size={18} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-gray-900">Privacy Settings</p>
                                <p className="text-xs text-gray-500 mt-0.5">Control your data and privacy</p>
                            </div>
                        </div>
                        <ChevronLeft size={18} className="text-gray-400 rotate-180" />
                    </button>
                </div>
            </Card>

            {/* Language & Region */}
            <Card title="Language & Region" subtitle="Customize your localization preferences">
                <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/5 rounded-lg text-primary">
                                <Globe size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Language</p>
                                <p className="text-xs text-gray-500 mt-0.5">Current: English (US)</p>
                            </div>
                        </div>
                        <button className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                            Change
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Settings;
