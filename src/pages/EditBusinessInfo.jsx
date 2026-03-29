import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    Building2,
    User,
    AtSign,
    Phone,
    Globe,
    Briefcase,
    ChevronRight,
    Camera,
    Upload,
    ChevronDown,
    Search,
    Bell,
    Settings,
    Loader2,
    Trash2
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

import Api from '../../scripts/Api';
import { useApp } from '../context/AppContext';

const FormField = ({ label, icon: Icon, children, className = "" }) => (
    <div className={`space-y-2.5 ${className}`}>
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            {Icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                    <Icon size={18} />
                </div>
            )}
            {children}
        </div>
    </div>
);

const EditBusinessInfo = () => {
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
        description: '',
        logoUrl: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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
            const result = formData.logoUrl 
                ? await Api.updateProfilePicture(user.admin_id, file)
                : await Api.uploadProfilePicture(user.admin_id, file);

            if (result && (result.url || result.file_url || result.logo_url)) {
                setFormData(prev => ({
                    ...prev,
                    logoUrl: result.url || result.file_url || result.logo_url
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
        if (!user?.admin_id) return;
        
        try {
            const result = await Api.deleteProfilePicture(user.admin_id);
            if (result) {
                setFormData(prev => ({ ...prev, logoUrl: '' }));
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    useEffect(() => {
        const fetchBusinessData = async () => {
            if (!adminToken) {
                navigate('/');
                return;
            }

            if (!user?.admin_id) {
                return;
            }

            try {
                setIsLoading(true);
                const [infoData, logoData] = await Promise.all([
                    Api.getBusinessInfo(adminToken, user.admin_id),
                    Api.getProfilePicture(user.admin_id)
                ]);

                if (infoData) {
                    setFormData(prev => ({
                        ...prev,
                        businessName: infoData.business_name || '',
                        fullName: infoData.full_name || '',
                        email: infoData.email || '',
                        phone: infoData.contact_number || '',
                        phonePrefix: '+1',
                        website: infoData.website || '',
                        industry: infoData.business_industry || 'Software & Technology',
                        description: infoData.business_description || '',
                    }));
                }

                if (logoData) {
                    setFormData(prev => ({
                        ...prev,
                        logoUrl: logoData.url || logoData.file_url || logoData.logo_url || ''
                    }));
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBusinessData();
    }, [navigate, adminToken, user?.admin_id]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 size={48} className="animate-spin text-primary" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Retrieving Profile...</p>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!adminToken) {
            toast.error("Session expired. Please login again.");
            navigate('/');
            return;
        }

        if (!user?.admin_id) {
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
                business_industry: formData.industry,
                business_description: formData.description
            };

            const result = await Api.updateBusinessInfo(adminToken, user.admin_id, payload);
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

    return (
        <div className="min-h-screen bg-gray-50/30 pb-20 animate-in fade-in duration-700">
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 px-4 py-2">
                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>Settings</span>
                    <ChevronRight size={12} className="text-gray-300" />
                    <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/business')}>Business Information</span>
                    <ChevronRight size={12} className="text-gray-300" />
                    <span className="text-primary">Edit</span>
                </div>
            </div>

            {/* Main Editor Card */}
            <div className="max-w-5xl mx-auto">
                <Card noPadding className="overflow-hidden border-none shadow-2xl shadow-black/[0.03] rounded-[3rem]">
                    <div className="bg-white p-12 text-center relative overflow-hidden">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/5 via-primary to-primary/5" />

                        {/* Avatar Section */}
                        <div className="relative inline-block mb-8">
                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-900 flex items-center justify-center relative group">
                                {formData.logoUrl ? (
                                    <img
                                        src={formData.logoUrl}
                                        className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                                        alt="Business Logo"
                                    />
                                ) : (
                                    <div className="w-16 h-16 border-2 border-primary/30 rounded-full flex items-center justify-center border-dashed">
                                        <Building2 size={32} className="text-primary/40" />
                                    </div>
                                )}
                                
                                {isUploadingLogo && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[px]">
                                        <Loader2 size={24} className="animate-spin text-white" />
                                    </div>
                                )}

                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploadingLogo}
                                    className="p-2 bg-primary text-white rounded-full absolute bottom-1 right-1 border-4 border-white shadow-lg z-10 cursor-pointer hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                >
                                    <Camera size={14} />
                                </button>
                            </div>
                        </div>

                        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Edit Basic Information</h2>
                        <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed text-sm mb-8">
                            Manage your business profile details and public identity within the automation platform.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingLogo}
                                className="inline-flex items-center gap-2.5 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-black text-gray-700 uppercase tracking-widest shadow-lg shadow-black/[0.02] hover:border-primary/20 hover:shadow-primary/5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Upload size={14} className="text-primary" />
                                {isUploadingLogo ? 'Processing...' : 'Change Business Photo'}
                            </button>
                            
                            {formData.logoUrl && (
                                <button 
                                    onClick={handleDeleteLogo}
                                    disabled={isUploadingLogo}
                                    className="inline-flex items-center gap-2.5 px-6 py-3 bg-red-50 border border-red-100/50 rounded-2xl text-[10px] font-black text-red-600 uppercase tracking-widest hover:bg-red-100 hover:border-red-200 transition-all active:scale-95 shadow-sm disabled:opacity-50"
                                >
                                    <Trash2 size={13} />
                                    Remove Photo
                                </button>
                            )}
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleLogoChange}
                            accept="image/png, image/jpeg, image/jpg"
                            className="hidden"
                        />
                    </div>

                    <div className="p-12 border-t border-gray-50 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            {/* Business Name */}
                            <FormField label="Business Name" icon={Building2}>
                                <input
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 group-focus-within:bg-white group-focus-within:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                />
                            </FormField>

                            {/* Full Name */}
                            <FormField label="Full Name" icon={User}>
                                <input
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 group-focus-within:bg-white group-focus-within:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                />
                            </FormField>

                            {/* Email Address */}
                            <FormField label="Email Address" icon={AtSign}>
                                <input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 group-focus-within:bg-white group-focus-within:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                />
                            </FormField>

                            {/* Contact Number */}
                            <FormField label="Contact Number">
                                <div className="flex gap-2">
                                    <div className="relative shrink-0">
                                        <select
                                            name="phonePrefix"
                                            value={formData.phonePrefix}
                                            onChange={handleChange}
                                            className="appearance-none pl-4 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-900 focus:bg-white focus:border-primary/20 transition-all outline-none cursor-pointer"
                                        >
                                            <option value="+1">+1</option>
                                            <option value="+44">+44</option>
                                            <option value="+91">+91</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                    <div className="relative grow group">
                                        <input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </FormField>

                            {/* Website */}
                            <FormField label="Website (Optional)" icon={Globe}>
                                <input
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 group-focus-within:bg-white group-focus-within:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                />
                            </FormField>

                            {/* Industry */}
                            <FormField label="Industry" icon={Briefcase}>
                                <div className="relative group">
                                    <select
                                        name="industry"
                                        value={formData.industry}
                                        onChange={handleChange}
                                        className="appearance-none w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none cursor-pointer"
                                    >
                                        <option>Software & Technology</option>
                                        <option>Hardware & Manufacturing</option>
                                        <option>Financial Services</option>
                                        <option>Digital Marketing</option>
                                    </select>
                                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                                </div>
                            </FormField>
                        </div>

                        {/* Business Description */}
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Business Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm font-bold text-gray-600 leading-relaxed min-h-[160px] focus:bg-white focus:border-primary/20 focus:ring-8 focus:ring-primary/5 transition-all outline-none resize-none"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-6">
                            <Button
                                variant="outline"
                                className="px-8 border-none hover:bg-gray-100 text-gray-500 font-black"
                                onClick={() => navigate('/business')}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
                            >
                                {isSubmitting ? 'Updating...' : 'Update Information'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default EditBusinessInfo;
