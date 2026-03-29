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
        personalizationLevel: 'Low',
        levelValue: 1,
        instruction: "Your current AI settings will prioritize response speed while maintaining a professional yet approachable tone."
    });

    const handleUpdateAiPreference = (newData) => {
        let levelVal = 1;
        if (newData.personalizationLevel?.toLowerCase() === 'medium') levelVal = 2;
        if (newData.personalizationLevel?.toLowerCase() === 'high') levelVal = 3;

        setAiPreference(prev => ({
            ...prev,
            tone: newData.tone,
            personalizationLevel: newData.personalizationLevel,
            levelValue: levelVal
        }));
    };

    const handleLogoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!user?.admin_id) {
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
                ? await Api.updateProfilePicture(user.admin_id, file)
                : await Api.uploadProfilePicture(user.admin_id, file);

            if (result && (result.url || result.file_url || result.logo_url)) {
                setBusinessData(prev => ({
                    ...prev,
                    logoUrl: result.url || result.file_url || result.logo_url
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

            if (!user?.admin_id) return;

            try {
                setIsLoading(true);
                const [businessRes, aiRes, logoRes] = await Promise.all([
                    Api.getBusinessInfo(adminToken, user.admin_id),
                    Api.getAiPreference(adminToken, user.admin_id),
                    Api.getProfilePicture(user.admin_id)
                ]);

                if (businessRes) {
                    setBusinessData(prev => ({
                        ...prev,
                        name: businessRes.business_name || '',
                        fullName: businessRes.full_name || 'Alexander Thorne',
                        email: businessRes.email || 'a.thorne@gsdynamics.io',
                        contact: businessRes.contact_number || '+1 (555) 902-4412',
                        industry: businessRes.business_industry || '',
                        website: businessRes.website || '',
                        description: businessRes.business_description || '',
                    }));
                }

                if (logoRes) {
                    setBusinessData(prev => ({
                        ...prev,
                        logoUrl: logoRes.url || logoRes.file_url || logoRes.logo_url || null
                    }));
                }

                if (aiRes) {
                    let levelVal = 1;
                    if (aiRes.personalization_level?.toLowerCase() === 'medium') levelVal = 2;
                    if (aiRes.personalization_level?.toLowerCase() === 'high') levelVal = 3;

                    setAiPreference({
                        tone: aiRes.ai_tone_preference || 'Friendly',
                        toneDescription: aiRes.ai_tone_description || 'Warm & Approachable',
                        personalizationLevel: aiRes.personalization_level || 'Low',
                        levelValue: levelVal,
                        instruction: aiRes.ai_interaction_instruction || aiRes.instruction || "Your current AI settings will prioritize response speed while maintaining a professional yet approachable tone."
                    });
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate, adminToken, user?.admin_id]);

    return {
        businessData,
        aiPreference,
        isLoading,
        isUploadingLogo,
        fileInputRef,
        handleLogoChange,
        handleUpdateAiPreference
    };
};
