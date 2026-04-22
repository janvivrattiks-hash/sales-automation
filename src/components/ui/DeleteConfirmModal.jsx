import React from 'react';
import { Trash2 } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, description, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />

            {/* Modal */}
            <div
                className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
                    <Trash2 size={28} className="text-red-500" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-2">{title || 'Delete Lead?'}</h2>

                {/* Description */}
                <p className="text-sm text-gray-500 leading-relaxed mb-8">
                    {description || 'Are you sure you want to delete this lead? This action cannot be undone.'}
                </p>

                {/* Actions */}
                <div className="flex gap-3 w-full">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isDeleting ? (
                            <>
                                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            'Yes, Delete'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
