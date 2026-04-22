import React from 'react';
import { Users } from 'lucide-react';

const ReviewLeadsStats = ({ totalLeads }) => {
    return (
        <div className="bg-white px-6 py-4 rounded-xl border border-gray-100 flex items-center gap-4 shadow-sm min-w-[200px]">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Users size={20} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider leading-none">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalLeads}</p>
            </div>
        </div>
    );
};

export default ReviewLeadsStats;
