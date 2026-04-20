import React, { useState } from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '../ui/Card';
import DeleteConfirmModal from '../ui/DeleteConfirmModal';

const SingleAudienceHeader = ({ 
    contactName, 
    businessName, 
    audienceName, 
    category, 
    icpScore, 
    leadStage, 
    leadTitle,
    fromTab,
    onDelete
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        const success = await onDelete();
        setIsDeleting(false);
        if (success) {
            setShowDeleteModal(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb & Top Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                    <button onClick={() => navigate('/audience-list')} className="hover:text-primary transition-colors">Audience List</button>
                    <ChevronRight size={10} />
                    <button 
                        onClick={() => {
                            if (location.state?.backUrl) {
                                navigate(location.state.backUrl, { state: { ...location.state, selectedLead: null, singleLead: null } });
                            } else {
                                navigate(-1);
                            }
                        }} 
                        className="hover:text-primary transition-colors"
                    >
                        {fromTab === 'enriched' ? 'Contacts' : 'Audience Details'}
                    </button>
                    <ChevronRight size={10} />
                    <span className="text-gray-900">Single Audience View</span>
                </div>
            </div>

            {/* Header Profile Card */}
            <Card noPadding className="overflow-hidden border-gray-100 shadow-xl shadow-gray-200/50 rounded-2xl bg-white">
                <div className="p-6 md:p-8">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-6 items-center">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{contactName}</h1>
                                    <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider border ${leadStage.toLowerCase().includes('qualified') ? 'bg-green-50 text-green-600 border-green-100' :
                                        leadStage.toLowerCase().includes('pending') ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            'bg-blue-50 text-blue-600 border-blue-100'
                                        }`}>
                                        {leadStage}
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm mt-1">{leadTitle} at <span className="font-bold text-primary">{businessName}</span></p>
                            </div>
                        </div>

                        {/* Top Right Action */}
                        <button 
                            onClick={() => setShowDeleteModal(true)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Lead Data"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Audience Name</p>
                            <p className="text-lg font-bold text-gray-900">{audienceName}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Business Category</p>
                            <p className="text-lg font-bold text-gray-900">{category}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Lead Stage</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse"></div>
                                <p className="text-lg font-bold text-gray-900 capitalize">{leadStage}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
                title="Delete Lead?"
                description={`Are you sure you want to delete the profile for "${businessName}"? This action cannot be undone.`}
            />
        </div>
    );
};

export default SingleAudienceHeader;

