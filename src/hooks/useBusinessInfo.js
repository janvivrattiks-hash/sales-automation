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

    const fetchAiData = async () => {
        if (!adminToken || !user?.id) return;
        try {
            const res = await Api.getAiPreference(adminToken, user.id);
            if (res && res.data) {
                const aiData = res.data;
                let levelVal = 1;
                const levelStr = (aiData.ai_personalise_level || aiData.personalization_level || '').toLowerCase();
                
                if (levelStr === 'medium') levelVal = 2;
                else if (levelStr === 'high') levelVal = 3;
                else if (levelStr === 'hyper') levelVal = 4;

                setAiPreference({
                    tone: aiData.ai_tone_preference || 'Friendly',
                    toneDescription: aiData.ai_tone_description || 'Warm & Approachable',
                    personalizationLevel: aiData.ai_personalise_level || aiData.personalization_level || 'Low',
                    levelValue: levelVal,
                    instruction: aiData.ai_interaction_instruction || aiData.instruction || "Your current AI settings will prioritize response speed while maintaining a professional yet approachable tone."
                });
            }
        } catch (error) {
            console.error("Fetch AI Data error:", error);
        }
    };

    const handleUpdateAiPreference = async (newData) => {
        let levelVal = 1;
        const levelStr = newData.personalizationLevel?.toLowerCase() || '';
        if (levelStr === 'medium') levelVal = 2;
        else if (levelStr === 'high') levelVal = 3;
        else if (levelStr === 'hyper') levelVal = 4;

        setAiPreference(prev => ({
            ...prev,
            tone: newData.tone,
            personalizationLevel: newData.personalizationLevel,
            levelValue: levelVal
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
                const [businessRes, aiRes, logoRes] = await Promise.all([
                    Api.getBusinessInfo(adminToken, user.id),
                    Api.getAiPreference(adminToken, user.id),
                    Api.getProfilePicture(user.id)
                ]);

                if (businessRes) {
                    const data = businessRes.data || businessRes;
                    setBusinessData(prev => ({
                        ...prev,
                        name: data.business_name || '',
                        fullName: data.full_name || '',
                        email: data.email || '',
                        contact: data.contact_number || '',
                        industry: data.business_industry || '',
                        website: data.website || '',
                        location: data.location || 'N/A', // Using N/A if location is missing
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
                    let levelVal = 1;
                    const levelStr = (aiData.ai_personalise_level || aiData.personalization_level || '').toLowerCase();
                    
                    if (levelStr === 'medium') levelVal = 2;
                    else if (levelStr === 'high') levelVal = 3;
                    else if (levelStr === 'hyper') levelVal = 4;

                    setAiPreference({
                        tone: aiData.ai_tone_preference || 'Friendly',
                        toneDescription: aiData.ai_tone_description || 'Warm & Approachable',
                        personalizationLevel: aiData.ai_personalise_level || aiData.personalization_level || 'Low',
                        levelValue: levelVal,
                        instruction: aiData.ai_interaction_instruction || aiData.instruction || "Your current AI settings will prioritize response speed while maintaining a professional yet approachable tone."
                    });
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
        isLoading,
        isUploadingLogo,
        fileInputRef,
        handleLogoChange,
        handleUpdateAiPreference
    };
};
