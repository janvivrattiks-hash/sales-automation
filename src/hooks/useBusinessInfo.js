import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Api from '../../scripts/Api';
import { useApp } from '../context/AppContext';

export const useBusinessInfo = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { user, adminToken } = useApp();
    
    const [businessData, setBusinessData] = useState({
        name: '',
        fullName: '',
        email: '',
        contact: '',
        industry: '',
        website: '',
        location: 'San Francisco, CA',
        description: '',
        logoUrl: null,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    
    const [aiPreference, setAiPreference] = useState({
        tone: 'Friendly',
        toneDescription: 'Warm & Approachable',
        instruction: "Your current AI settings will prioritize response speed while maintaining a professional yet approachable tone."
    });

    const [products, setProducts] = useState([]);
    const [isProductsLoading, setIsProductsLoading] = useState(false);

    const fetchAiData = async () => {
        if (!adminToken || !user?.id) return;
        try {
            const res = await Api.getAiPreference(adminToken, user.id);
            if (res && res.data) {
                const aiData = res.data;
                setAiPreference({
                    tone: aiData.ai_tone_preference || 'Friendly',
                    toneDescription: aiData.ai_tone_description || 'Warm & Approachable',
                    instruction: aiData.ai_interaction_instruction || aiData.instruction || "Your current AI settings will prioritize response speed while maintaining a professional yet approachable tone."
                });
            }
        } catch (error) {
            console.error("Fetch AI Data error:", error);
        }
    };

    const fetchProducts = async () => {
        if (!adminToken || !user?.id) return;
        try {
            setIsProductsLoading(true);
            const res = await Api.getProducts(adminToken, user.id);
            if (res && res.data) {
                setProducts(res.data);
            }
        } catch (error) {
            console.error("Fetch Products error:", error);
        } finally {
            setIsProductsLoading(false);
        }
    };

    const handleAddProduct = async (product, links = [], file = null) => {
        if (!adminToken) return;
        
        const res = await Api.addProducts(adminToken, [product], links, file);
        if (res) {
            await fetchProducts();
            return true;
        }
        return false;
    };

    const handleUpdateProduct = async (oldName, updatedProduct) => {
        if (!adminToken || !user?.id) return;
        const res = await Api.updateProduct(adminToken, user.id, oldName, updatedProduct);
        if (res) {
            await fetchProducts();
            return true;
        }
        return false;
    };

    const handleDeleteProduct = async (productName) => {
        if (!adminToken || !user?.id) return;
        const res = await Api.deleteProduct(adminToken, user.id, productName);
        if (res) {
            await fetchProducts();
            return true;
        }
        return false;
    };

    const handleUpdateAiPreference = async (newData) => {
        setAiPreference(prev => ({
            ...prev,
            tone: newData.tone,
        }));

        // Re-fetch to get AI-generated descriptions/instructions if changed
        await fetchAiData();
    };

    const handleLogoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!user?.id) {
            toast.error("User information not loaded.");
            return;
        }

        const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            toast.error("Please upload a PNG or JPG image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB.");
            return;
        }

        setIsUploadingLogo(true);
        try {
            const result = businessData.logoUrl 
                ? await Api.updateProfilePicture(user.id, file)
                : await Api.uploadProfilePicture(user.id, file);

            // After successful upload, trigger the GET API as requested
            const freshLogoRes = await Api.getProfilePicture(user.id);

            // Use the direct URL with a cache-buster to show the fresh image
            if (freshLogoRes) {
                setBusinessData(prev => ({
                    ...prev,
                    logoUrl: `${Api.getProfilePictureUrl(user.id)}?t=${Date.now()}`
                }));
            }
        } catch (error) {
            console.error("Upload/Update error:", error);
        } finally {
            setIsUploadingLogo(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!adminToken) {
                navigate('/');
                return;
            }

            if (!user?.id) return;

            try {
                setIsLoading(true);
                const [businessRes, aiRes, logoRes, productsRes] = await Promise.all([
                    Api.getBusinessInfo(adminToken, user.id),
                    Api.getAiPreference(adminToken, user.id),
                    Api.getProfilePicture(user.id),
                    Api.getProducts(adminToken, user.id)
                ]);

                if (businessRes) {
                    const data = businessRes.data || businessRes;
                    const phonePrefix = data.country_code || '+1';
                    let phoneNumber = data.contact_number || '';
                    
                    // Strip prefix if already present in contact_number to avoid double display
                    if (phoneNumber.startsWith(phonePrefix)) {
                        phoneNumber = phoneNumber.slice(phonePrefix.length);
                    }

                    setBusinessData(prev => ({
                        ...prev,
                        name: data.business_name || '',
                        fullName: data.full_name || '',
                        email: data.email || '',
                        contact: phoneNumber ? `${phonePrefix} ${phoneNumber}` : '',
                        industry: data.business_industry || '',
                        website: data.website || '',
                        location: data.location || 'N/A',
                        description: data.business_description || '',
                    }));
                }

                if (logoRes) {
                    setBusinessData(prev => ({
                        ...prev,
                        logoUrl: Api.getProfilePictureUrl(user.id) || null
                    }));
                }

                if (aiRes && aiRes.data) {
                    const aiData = aiRes.data;
                    setAiPreference({
                        tone: aiData.ai_tone_preference || 'Friendly',
                        toneDescription: aiData.ai_tone_description || 'Warm & Approachable',
                        instruction: aiData.ai_interaction_instruction || aiData.instruction || "Your current AI settings will prioritize response speed while maintaining a professional yet approachable tone."
                    });
                }

                if (productsRes && productsRes.data) {
                    setProducts(productsRes.data);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate, adminToken, user?.id]);

    return {
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
        handleDeleteProduct,
        fetchProducts
    };
};
