import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const ContactHeader = ({ businessName, categoryStr, navigate, location }) => {
    return (
        <>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                <button onClick={() => navigate('/contacts')} className="hover:text-primary transition-colors uppercase">Contact Management</button>
                <ChevronRight size={10} />
                <span className="text-gray-900 uppercase">Contact Detail</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{businessName}</h1>
                    <p className="text-gray-500 text-sm mt-1">{categoryStr}</p>
                </div>
                <button
                    onClick={() => {
                        if (location.state?.backUrl) {
                            navigate(location.state.backUrl, { state: { ...location.state } });
                        } else {
                            navigate('/contacts', { state: { ...location.state, activeTab: location.state?.fromTab || 'raw' } });
                        }
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold active:scale-95 shadow-sm"
                >
                    <ChevronLeft size={16} />
                    Back to Grid
                </button>
            </div>
        </>
    );
};

export default ContactHeader;
