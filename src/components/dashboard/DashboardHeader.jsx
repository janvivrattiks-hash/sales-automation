import React from 'react';
import { Plus } from 'lucide-react';
import Button from '../ui/Button';

const DashboardHeader = ({ navigate }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Manage your lead pipeline and sales performance.</p>
            </div>
            <Button
                className="shrink-0 flex items-center gap-2"
                onClick={() => navigate('/lead-generator')}
            >
                <Plus size={18} />
                Add New Lead
            </Button>
        </div>
    );
};

export default DashboardHeader;
