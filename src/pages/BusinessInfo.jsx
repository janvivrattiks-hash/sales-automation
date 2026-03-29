import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ChangePasswordModal from '../components/modals/ChangePasswordModal';
import EditAiPreferenceModal from '../components/modals/EditAiPreferenceModal';

// Components
import BusinessHeader from '../components/businessinfo/BusinessHeader';
import BasicInfoCard from '../components/businessinfo/BasicInfoCard';
import AiPreferenceCard from '../components/businessinfo/AiPreferenceCard';

// Hooks
import { useBusinessInfo } from '../hooks/useBusinessInfo';

const BusinessInfo = () => {
    const navigate = useNavigate();
    const {
        businessData,
        aiPreference,
        isLoading,
        isUploadingLogo,
        fileInputRef,
        handleLogoChange,
        handleUpdateAiPreference
    } = useBusinessInfo();

    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isEditAiModalOpen, setIsEditAiModalOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 size={48} className="animate-spin text-primary" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Profile...</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 space-y-10">
            <BusinessHeader 
                onNavigate={navigate} 
                onChangePassword={() => setIsChangePasswordModalOpen(true)} 
            />

            <BasicInfoCard 
                businessData={businessData}
                isUploadingLogo={isUploadingLogo}
                fileInputRef={fileInputRef}
                onLogoChange={handleLogoChange}
            />

            <AiPreferenceCard 
                aiPreference={aiPreference}
                onEdit={() => setIsEditAiModalOpen(true)}
            />

            {/* Modals */}
            <ChangePasswordModal 
                isOpen={isChangePasswordModalOpen} 
                onClose={() => setIsChangePasswordModalOpen(false)} 
            />

            <EditAiPreferenceModal
                isOpen={isEditAiModalOpen}
                onClose={() => setIsEditAiModalOpen(false)}
                currentData={aiPreference}
                onUpdate={handleUpdateAiPreference}
            />
        </div>
    );
};

export default BusinessInfo;
