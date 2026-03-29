import React from 'react';
import Card from '../ui/Card';

const AudienceStats = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
                <Card key={stat.label} noPadding className="p-4 transition-all hover:shadow-xl hover:border-primary/10 border-gray-100 shadow-md shadow-gray-200/20" >
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
                            <p className="text-xl font-bold text-gray-900 truncate max-w-[150px]">{stat.value}</p>
                        </div>
                        {stat.icon && (
                            <div className="text-primary/10">
                                <stat.icon size={40} />
                            </div>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default AudienceStats;
