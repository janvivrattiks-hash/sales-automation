import React from 'react';
import Card from '../ui/Card';

const SingleAudienceTabs = ({ tabs, activeTab, setActiveTab, children }) => {
    return (
        <Card noPadding className="border-gray-100 shadow-lg shadow-gray-200/40 flex flex-col">
            {/* Tab Headers */}
            <div className="flex overflow-x-auto border-b border-gray-100 no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id
                            ? 'border-primary text-primary bg-primary/[0.02]'
                            : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 md:p-8 flex-1 bg-gray-50/30">
                {children}
            </div>
        </Card>
    );
};

export default SingleAudienceTabs;
