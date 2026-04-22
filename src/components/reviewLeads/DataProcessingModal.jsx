import React from 'react';
import { Loader2 } from 'lucide-react';

const DataProcessingModal = ({ 
    isOpen, 
    leadName, 
    onClose, 
    onViewData
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full mx-4 animate-in scale-in-95 duration-300">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50">
                    <Loader2 size={32} className="animate-spin text-blue-600" />
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-lg font-bold text-gray-900">Processing Data</h3>
                    <p className="text-sm text-gray-600 font-medium">
                        Lead: <span className="font-bold text-blue-600">{leadName}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-3">
                        We're still enriching this lead's data. Please wait...
                    </p>
                </div>
                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
                <div className="flex gap-3 w-full">
                    <button
                        onClick={onViewData}
                        className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors active:scale-95"
                    >
                        Check Data
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-3 border border-gray-200 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataProcessingModal;
