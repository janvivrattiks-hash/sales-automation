import React from 'react';
import { Trash2 } from 'lucide-react';

const DeleteSearchModal = ({ job, onCancel, onConfirm }) => {
    if (!job) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onCancel}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto">
                    <Trash2 size={22} className="text-red-500" />
                </div>
                <div className="text-center space-y-1">
                    <h3 className="text-lg font-bold text-gray-900">Delete Search?</h3>
                    <p className="text-sm text-gray-500">
                        Are you sure you want to delete{' '}
                        <span className="font-semibold text-gray-700">{job.query_name}</span>?
                        This action cannot be undone.
                    </p>
                </div>
                <div className="flex gap-3 pt-2">
                    <button
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
                        onClick={onConfirm}
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteSearchModal;
