import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';

// Components
import EditBusinessHeader from '../components/editbusinessinfo/EditBusinessHeader';
import EditLogoSection from '../components/editbusinessinfo/EditLogoSection';
import BusinessForm from '../components/editbusinessinfo/BusinessForm';

// Hooks
import { useEditBusinessInfo } from '../hooks/useEditBusinessInfo';

const EditBusinessInfo = () => {
    const navigate = useNavigate();
    const {
        formData,
        isLoading,
        isSubmitting,
        isUploadingLogo,
        fileInputRef,
        handleChange,
        handleSubmit,
        handleLogoChange,
        handleDeleteLogo
    } = useEditBusinessInfo();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 size={48} className="animate-spin text-primary" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Retrieving Profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20 animate-in fade-in duration-700">
            <EditBusinessHeader onNavigate={navigate} />

            <div className="max-w-5xl mx-auto">
                <Card noPadding className="overflow-hidden border-none shadow-2xl shadow-black/[0.03] rounded-[3rem]">
                    <EditLogoSection 
                        logoUrl={formData.logoUrl}
                        isUploadingLogo={isUploadingLogo}
                        fileInputRef={fileInputRef}
                        onLogoChange={handleLogoChange}
                        onDeleteLogo={handleDeleteLogo}
                    />

                    <BusinessForm 
                        formData={formData}
                        isSubmitting={isSubmitting}
                        onChange={handleChange}
                        onCancel={() => navigate('/business')}
                        onSubmit={handleSubmit}
                    />
                </Card>
            </div>
        </div>
    );
};

export default EditBusinessInfo;
