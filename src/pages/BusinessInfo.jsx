import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2,
    Globe,
    Sparkles,
    Edit3,
    Info,
    Loader2,
    ChevronRight,
    Key,
    Rocket,
    Mail,
    MapPin,
    User,
    Phone,
    Camera,
    MessageSquare,
    Sliders,
    Pencil
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Api from '../../scripts/Api';
import ChangePasswordModal from '../components/modals/ChangePasswordModal';
import EditAiPreferenceModal from '../components/modals/EditAiPreferenceModal';
import { toast } from 'react-toastify';
import { useApp } from '../context/AppContext';

const InfoItem = ({ label, value, icon: Icon, className = "" }) => (
    <div className={`space-y-1.5 ${className}`}>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</p>
        <div className="flex items-center gap-2">
            {Icon && <Icon size={14} className="text-primary/70" />}
            <p className="text-sm font-bold text-gray-900 leading-tight">{value || 'N/A'}</p>
        </div>
    </div>
);

const BusinessInfo = () => {
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
        location: 'San Francisco, CA', // Placeholder
        description: '',
        logoUrl: null,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isEditAiModalOpen, setIsEditAiModalOpen] = useState(false);
    const [aiPreference, setAiPreference] = useState({
        tone: 'Friendly',
        toneDescription: 'Warm & Approachable',
        personalizationLevel: 'Low',
        levelValue: 1, // 1 for Low, 2 for Medium, 3 for High
        instruction: "Your current AI settings will prioritize response speed while maintaining a professional yet approachable tone."
    });

    const handleUpdateAiPreference = (newData) => {
        // Map personalization text to numeric levelValue
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

        // Basic validation
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            toast.error("Please upload a PNG or JPG image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("Image size should be less than 5MB.");
            return;
        }

        setIsUploadingLogo(true);
        try {
            // Decide whether to use POST (upload) or PUT (update)
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
            // Reset input value to allow selecting same file again
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!adminToken) {
                navigate('/');
                return;
            }

            if (!user?.admin_id) {
                // Wait for user context to be loaded
                return;
            }

            try {
                setIsLoading(true);

                // Fetch in parallel
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
                        location: 'San Francisco, CA',
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
                    // Logic to determine level value for UI indicators
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
            {/* Header section with Breadcrumbs */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    <span className="cursor-pointer hover:text-primary transition-colors">Settings</span>
                    <ChevronRight size={10} className="text-gray-300" />
                    <span className="text-primary">Business Information</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Business Profile</h1>
                        <p className="text-gray-500 font-medium text-sm">Configure your company identity and AI interaction model.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button 
                            variant="outline" 
                            className="h-12 px-6 rounded-2xl border-gray-100 shadow-sm hover:bg-gray-50 font-black text-xs uppercase tracking-widest gap-2"
                            onClick={() => setIsChangePasswordModalOpen(true)}
                        >
                            <Key size={14} className="text-gray-400" />
                            Change Password
                        </Button>
                        <Button 
                            onClick={() => navigate('/edit-business-info')}
                            className="h-12 px-8 rounded-2xl bg-primary shadow-xl shadow-primary/20 font-black text-xs uppercase tracking-widest gap-2 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <Edit3 size={14} />
                            Edit Profile
                        </Button>
                    </div>
                </div>
            </div>

            {/* Basic Information Card */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/[0.03] border border-gray-50 overflow-hidden">
                <div className="px-10 py-6 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                            <Info size={20} />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 tracking-tight">Basic Information</h3>
                    </div>
                    <div className="px-3 py-1 bg-emerald-50 rounded-lg text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                        Active
                    </div>
                </div>

                <div className="p-12">
                    <div className="flex flex-col lg:flex-row gap-16">
                        {/* Company Logo Section */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-900 flex items-center justify-center relative">
                                    {businessData.logoUrl ? (
                                        <img 
                                            src={businessData.logoUrl} 
                                            alt="Company Logo" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 border-2 border-primary/30 rounded-full flex items-center justify-center border-dashed">
                                            <Building2 size={32} className="text-primary/40" />
                                        </div>
                                    )}
                                    
                                    {isUploadingLogo && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                                            <Loader2 size={24} className="animate-spin text-white" />
                                        </div>
                                    )}
                                    
                                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingLogo}
                                    className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-primary border-4 border-white shadow-lg flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Camera size={14} />
                                </button>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Company Logo</p>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleLogoChange}
                            accept="image/png, image/jpeg, image/jpg"
                            className="hidden"
                        />

                        {/* Details Grid */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-8">
                            <InfoItem label="Business Name" value={businessData.name} />
                            <InfoItem label="Industry" value={businessData.industry} icon={Rocket} />
                            <InfoItem label="Full Name" value={businessData.fullName} />
                            <InfoItem label="Email Address" value={businessData.email} />
                            <InfoItem label="Contact Number" value={businessData.contact} />
                            <InfoItem label="Location" value={businessData.location} />
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Behavior Preference Card */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/[0.03] border border-gray-50 overflow-hidden">
                <div className="px-10 py-6 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500">
                            <Sparkles size={20} />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 tracking-tight">AI Behavior Preference</h3>
                    </div>
                    <button 
                        onClick={() => setIsEditAiModalOpen(true)}
                        className="text-gray-300 hover:text-primary transition-colors"
                    >
                        <Pencil size={18} />
                    </button>
                </div>

                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* AI Tone Card */}
                        <div className="p-8 bg-gray-50/50 rounded-3xl border border-transparent hover:border-violet-100 transition-all group">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-violet-500 group-hover:scale-110 transition-transform">
                                    <MessageSquare size={22} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Tone Preference</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xl font-black text-gray-900">{aiPreference.tone}</p>
                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-200" />
                                        <p className="text-xs font-bold text-gray-400">{aiPreference.toneDescription}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Personalization Card */}
                        <div className="p-8 bg-gray-50/50 rounded-3xl border border-transparent hover:border-violet-100 transition-all group">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-violet-500 group-hover:scale-110 transition-transform">
                                    <Sliders size={22} />
                                </div>
                                <div className="space-y-2 grow">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Personalization Level</p>
                                    <div className="flex items-end justify-between">
                                        <p className="text-xl font-black text-gray-900">{aiPreference.personalizationLevel}</p>
                                        <div className="flex gap-1 mb-1">
                                            {[1, 2, 3].map((dot) => (
                                                <div 
                                                    key={dot}
                                                    className={`w-6 h-1.5 rounded-full transition-all duration-500 ${
                                                        dot <= aiPreference.levelValue ? 'bg-violet-500' : 'bg-gray-200'
                                                    }`} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Info Alert */}
                    <div className="p-6 bg-blue-50/50 rounded-[1.5rem] flex gap-4 items-start border border-blue-100/30">
                        <div className="mt-0.5 text-blue-500">
                            <Info size={16} fill="currentColor" className="text-white" />
                        </div>
                        <p className="text-[13px] font-medium text-blue-800 leading-relaxed italic">
                            "{aiPreference.instruction}"
                        </p>
                    </div>
                </div>
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
        </div>
    );
};

export default BusinessInfo;
