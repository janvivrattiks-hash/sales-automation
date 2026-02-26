import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useApp } from '../../context/AppContext';

const MainLayout = ({ children, onLogout }) => {
    const { sidebarOpen } = useApp();

    return (
        <div className="min-h-screen bg-surface">
            <Sidebar />
            <div
                className={`transition-all duration-300 ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'
                    }`}
            >
                <Navbar onLogout={onLogout} />
                <main className="pt-24 p-4 min-h-[calc(100vh-80px)]">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
