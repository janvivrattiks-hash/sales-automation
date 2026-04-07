import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Api from '../../scripts/Api';
import { useApp } from '../context/AppContext';

export const useEditBusinessInfo = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { user, adminToken } = useApp();
    
    const [formData, setFormData] = useState({
        businessName: '',
        fullName: '',
        email: '',
        phone: '',
        phonePrefix: '+1',
        website: '',
        industry: 'Software & Technology',
        location: '',
        description: '',
        logoUrl: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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
            const result = formData.logoUrl 
                ? await Api.updateProfilePicture(user.id, file)
                : await Api.uploadProfilePicture(user.id, file);

            // After successful upload, trigger the GET API as requested
            const freshLogoRes = await Api.getProfilePicture(user.id);

            // Use the direct URL with a cache-buster to show the fresh image
            if (freshLogoRes) {
                setFormData(prev => ({
                    ...prev,
                    logoUrl: `${Api.getProfilePictureUrl(user.id)}?t=${Date.now()}`
                }));
            }
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setIsUploadingLogo(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDeleteLogo = async () => {
        if (!user?.id) return;
        
        try {
            const result = await Api.deleteProfilePicture(user.id);
            if (result) {
                setFormData(prev => ({ ...prev, logoUrl: '' }));
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!adminToken) {
            toast.error("Session expired. Please login again.");
            navigate('/');
            return;
        }

        if (!user?.id) {
            toast.error("User information not loaded.");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                business_name: formData.businessName,
                full_name: formData.fullName,
                contact_number: `${formData.phonePrefix}${formData.phone}`.replace(/\s+/g, ''),
                email: formData.email,
                website: formData.website,
                location: formData.location,
                business_industry: formData.industry,
                business_description: formData.description
            };

            const result = await Api.updateBusinessInfo(adminToken, user.id, payload);
            if (result) {
                toast.success("Business information updated successfully!");
                navigate('/business');
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Failed to update information. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchBusinessData = async () => {
            if (!adminToken) {
                navigate('/');
                return;
            }

            if (!user?.id) return;

            try {
                setIsLoading(true);
                const [infoData, logoData] = await Promise.all([
                    Api.getBusinessInfo(adminToken, user.id),
                    Api.getProfilePicture(user.id)
                ]);

                if (infoData) {
                    const data = infoData.data || infoData;
                    setFormData(prev => ({
                        ...prev,
                        businessName: data.business_name || '',
                        fullName: data.full_name || '',
                        email: data.email || '',
                        phone: data.contact_number || '',
                        phonePrefix: '+1',
                        website: data.website || '',
                        industry: data.business_industry || 'Software & Technology',
                        location: data.location || '',
                        description: data.business_description || '',
                    }));
                }

                if (logoData) {
                    setFormData(prev => ({
                        ...prev,
                        logoUrl: Api.getProfilePictureUrl(user.id) || null
                    }));
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBusinessData();
    }, [navigate, adminToken, user?.id]);

    return {
        formData,
        isLoading,
        isSubmitting,
        isUploadingLogo,
        fileInputRef,
        handleChange,
        handleSubmit,
        handleLogoChange,
        handleDeleteLogo
    };
};
