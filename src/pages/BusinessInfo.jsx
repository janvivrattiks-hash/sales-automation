import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Components
import BusinessHeader from '../components/businessinfo/BusinessHeader';
import BasicInfoCard from '../components/businessinfo/BasicInfoCard';
import AiPreferenceCard from '../components/businessinfo/AiPreferenceCard';
import ProductsCard from '../components/businessinfo/ProductsCard';

// Modals
import ChangePasswordModal from '../components/modals/ChangePasswordModal';
import EditAiPreferenceModal from '../components/modals/EditAiPreferenceModal';
import ProductModal from '../components/modals/ProductModal';

// Hooks
import { useBusinessInfo } from '../hooks/useBusinessInfo';

const BusinessInfo = () => {
    const navigate = useNavigate();
    const {
        businessData,
        aiPreference,
        products,
        isProductsLoading,
        isLoading,
        isUploadingLogo,
        fileInputRef,
        handleLogoChange,
        handleUpdateAiPreference,
        handleAddProduct,
        handleUpdateProduct,
        handleDeleteProduct
    } = useBusinessInfo();

    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isEditAiModalOpen, setIsEditAiModalOpen] = useState(false);
    
    // Product Modal State
    const [productModalState, setProductModalState] = useState({
        isOpen: false,
        mode: 'add',
        currentData: null
    });

    const openAddProduct = () => setProductModalState({ isOpen: true, mode: 'add', currentData: null });
    const openEditProduct = (product) => setProductModalState({ isOpen: true, mode: 'edit', currentData: product });
    const closeProductModal = () => setProductModalState({ ...productModalState, isOpen: false });

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
                <AiPreferenceCard 
                    aiPreference={aiPreference}
                    onEdit={() => setIsEditAiModalOpen(true)}
                />

                <ProductsCard 
                    products={Array.isArray(products) ? products : []}
                    isLoading={isProductsLoading}
                    onAdd={openAddProduct}
                    onEdit={openEditProduct}
                    onDelete={handleDeleteProduct}
                />
            </div>

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

            <ProductModal 
                isOpen={productModalState.isOpen}
                onClose={closeProductModal}
                mode={productModalState.mode}
                currentData={productModalState.currentData}
                onAdd={handleAddProduct}
                onUpdate={handleUpdateProduct}
            />
        </div>
    );
};

export default BusinessInfo;
