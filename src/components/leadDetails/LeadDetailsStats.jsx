import React from 'react';
import Card from '../ui/Card';

const LeadDetailsStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
                <Card key={stat.label} noPadding className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        {stat.icon && (
                            <div className="text-gray-200">
                                <stat.icon size={36} />
                            </div>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default LeadDetailsStats;
