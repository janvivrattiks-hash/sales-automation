import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, AlertCircle } from 'lucide-react';

const InProcessingModal = ({ isOpen, message = "Processing your request..." }) => {
    useEffect(() => {
        console.log("📌 [InProcessingModal] isOpen state changed:", isOpen);
    }, [isOpen]);

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                {/* Icon Container */}
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Loader2 size={32} className="text-primary animate-spin" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-2 text-center">
                    <h3 className="text-lg font-bold text-gray-900">Processing...</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Loading Indicator */}
                <div className="space-y-2">
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full animate-pulse"
                            style={{
                                animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                            }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 text-center font-medium">
                        Please wait, loading lead details...
                    </p>
                </div>

                {/* Bottom Info */}
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <AlertCircle size={16} className="text-blue-600 flex-shrink-0" />
                    <p className="text-xs text-blue-600 font-medium">
                        Do not close this window until loading completes
                    </p>
                </div>
            </div>
        </div>
    );

    // Render using React Portal
    return createPortal(modalContent, document.body);
};

export default InProcessingModal;
