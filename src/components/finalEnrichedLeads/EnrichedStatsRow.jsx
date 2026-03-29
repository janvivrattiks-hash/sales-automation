import React from 'react';
import Card from '../ui/Card';

const EnrichedStatsRow = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
                <Card key={i} className="p-4 border border-gray-100 shadow-sm bg-white rounded-[24px]">
                    <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bgColor} ${stat.color} shrink-0`}>
                            <stat.icon size={28} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-gray-900 leading-none">{stat.value}</p>
                                {stat.change && <span className="text-[10px] font-bold text-green-500">{stat.change}</span>}
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default EnrichedStatsRow;
