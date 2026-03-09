import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Search,
    Users,
    Target,
    ChevronLeft,
    ChevronRight,
    Building2,
    BarChart3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Sidebar = () => {
    const { sidebarOpen, setSidebarOpen } = useApp();
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Lead Generator', path: '/lead-generator', icon: Search, subPaths: ['/lead-details', '/search-history', '/enrich', '/review-leads', '/final-leads'] },
        { name: 'Contacts Management', path: '/contacts', icon: Users },
        { name: 'Report Management', path: '/reports', icon: BarChart3 },
        { name: 'ICPs', path: '/icp', icon: Target },
        { name: 'Business Information', path: '/business', icon: Building2 },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 bg-white border-r border-gray-100 transition-all duration-300 z-50 flex flex-col 
                    ${sidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0 md:w-20'}
                    ${sidebarOpen && 'shadow-2xl md:shadow-none'}`}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-100 h-20 shrink-0">
                    <div className={`flex items-center ${!sidebarOpen && 'md:hidden'}`}>
                        <img src="/logo.png" alt="SalesAuto" className="h-10 w-auto" />
                    </div>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
                    >
                        {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.subPaths && item.subPaths.some(p => location.pathname.startsWith(p)));

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => {
                                    // Close sidebar on mobile when a link is clicked
                                    if (window.innerWidth < 768) {
                                        setSidebarOpen(false);
                                    }
                                }}
                                className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                    : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="shrink-0">
                                    <item.icon size={20} />
                                </div>
                                <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${!sidebarOpen && 'md:opacity-0 md:hidden'}`}>
                                    {item.name}
                                </span>
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
