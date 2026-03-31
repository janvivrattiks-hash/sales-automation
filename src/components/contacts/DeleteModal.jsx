import React from 'react';
import { Trash2, ArrowRight, Loader2 } from 'lucide-react';

const DeleteModal = ({ isOpen, onClose, type, data, onConfirm, isLoading }) => {
    if (!isOpen) return null;

    const name = type === 'audience' ? data?.audiance_name : (data?.name || data?.BusinessName);

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
                <div className="p-8 text-center space-y-6">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto transition-transform hover:scale-110">
                        <Trash2 size={32} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">
                            Delete <span className="text-red-500 italic uppercase">{type === 'audience' ? 'Audience' : 'Contact'}</span>?
                        </h3>
                        <p className="text-sm font-medium text-gray-500 leading-relaxed px-4 text-center">
                            Are you sure you want to delete <span className="text-gray-900 font-bold">"{name || 'this item'}"</span>? This action cannot be undone.
                        </p>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            className="flex-1 px-6 py-3.5 rounded-2xl border border-gray-100 text-xs font-bold text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all active:scale-95 disabled:opacity-50"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            className="flex-2 px-8 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-xs font-bold shadow-xl shadow-red-100 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            onClick={() => onConfirm(data?.id || data?.result_id || data?.MobileNumber)}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    Confirm <ArrowRight size={14} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;
