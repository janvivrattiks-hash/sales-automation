import React from 'react';
import { Loader2 } from 'lucide-react';

const EnrichingOverlay = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-2xl border border-gray-100">
                <Loader2 size={40} className="animate-spin text-blue-600" />
                <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900">Enriching Leads</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">Please wait while we gather more data...</p>
                </div>
            </div>
        </div>
    );
};

export default EnrichingOverlay;
