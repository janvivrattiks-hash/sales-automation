import React from 'react';

const StatCard = ({ title, value, trend, trendUp, icon: Icon }) => {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                    <span className={`text-xs font-bold ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                        {trend}
                    </span>
                </div>
            </div>
            <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center text-primary">
                <Icon size={24} />
            </div>
        </div>
    );
};

export default StatCard;
