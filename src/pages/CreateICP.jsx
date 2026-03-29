import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Api from '../../scripts/Api';
import { toast } from 'react-toastify';
import {
    Target,
    ChevronLeft,
    Briefcase,
    Users,
    Info,
    Globe,
    Loader2
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const CreateICP = () => {
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        icp_name: '',
        target_business_type: '',
        min_google_rating: 4,
        min_reviews_count: 4,
        website_available: false,
        contact_info_available: false,
        ai_matching_instruction: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(isEditMode);

    useEffect(() => {
        const fetchIcpData = async () => {
            if (!isEditMode) return;
            
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            try {
                setIsLoading(true);
                const data = await Api.getIcpById(token, id);
                if (data) {
                    setFormData({
                        icp_name: data.icp_name || '',
                        target_business_type: data.target_business_type || '',
                        min_google_rating: data.min_google_rating || 4,
                        min_reviews_count: data.min_reviews_count || 0,
                        website_available: data.website_available || false,
                        contact_info_available: data.contact_info_available || false,
                        ai_matching_instruction: data.ai_matching_instruction || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching ICP for edit:', error);
                toast.error('Failed to load ICP data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchIcpData();
    }, [id, isEditMode]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('admin_token');
        if (!token) {
            toast.error('Please login to continue');
            return;
        }

        setIsSubmitting(true);
        try {
            let result;
            if (isEditMode) {
                result = await Api.updateIcp(token, id, formData);
                if (result) {
                    navigate(`/icp-details/${id}`);
                }
            } else {
                result = await Api.createIcp(formData, token);
                if (result) {
                    navigate(`/icp-details/${result.id || result.icp_id || ''}`);
                }
            }
        } catch (error) {
            console.error('Error saving ICP:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 size={48} className="animate-spin text-primary" />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading Profile Details...</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-12">
            {/* Header / Intro */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(isEditMode ? `/icp-details/${id}` : '/icp')}
                        className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-primary hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {isEditMode ? 'Edit ICP Profile' : 'Create New ICP'}
                        </h1>
                        <p className="text-gray-500 text-sm mt-0.5">
                            {isEditMode ? 'Update your current Ideal Customer Profile configuration.' : 'Define your Ideal Customer Profile to supercharge your AI lead generation.'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                {/* Main Form Area */}
                <div className="space-y-8">
                    {/* Basic Info */}
                    <Card title={isEditMode ? "Update Details" : "Specify your ICP Details"} icon={Target} className="overflow-visible">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1 border-b border-gray-100 pb-8 mb-8">
                            <Input
                                label="ICP Name"
                                name="icp_name"
                                value={formData.icp_name}
                                onChange={handleInputChange}
                                placeholder="e.g. SaaS Founders Q4"
                                icon={Target}
                                required
                            />
                            <Input
                                label="Target Business Type"
                                name="target_business_type"
                                value={formData.target_business_type}
                                onChange={handleInputChange}
                                placeholder="e.g. Enterprise Software"
                                icon={Briefcase}
                                required
                            />
                            <Input
                                label="Minimum Google Rating"
                                name="min_google_rating"
                                type="number"
                                min="0"
                                max="5"
                                step="0.1"
                                value={formData.min_google_rating}
                                onChange={handleInputChange}
                                icon={Globe}
                            />
                            <Input
                                label="Minimum Reviews Count"
                                name="min_reviews_count"
                                type="number"
                                min="0"
                                value={formData.min_reviews_count}
                                onChange={handleInputChange}
                                icon={Users}
                            />
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 p-1 mb-8 border-b border-gray-100 pb-8">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="website_available"
                                    checked={formData.website_available}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary transition-colors"
                                />
                                <span className="text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">Must Have Website</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="contact_info_available"
                                    checked={formData.contact_info_available}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary transition-colors"
                                />
                                <span className="text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">Must Have Contact Info</span>
                            </label>
                        </div>

                        <div className="space-y-6 p-1">
                            <div className="space-y-3">
                                <label className="text-sm font-black text-gray-700 ml-1 flex items-center gap-2 uppercase tracking-widest">
                                    AI Matching Instruction
                                    <span className="p-1 rounded-full bg-blue-50 text-blue-400 cursor-help group relative">
                                        <Info size={12} />
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 normal-case tracking-normal">
                                            Provide specific guidance for AI matching.
                                        </span>
                                    </span>
                                </label>
                                <textarea
                                    name="ai_matching_instruction"
                                    value={formData.ai_matching_instruction}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Highly active social media profiles prioritizing recent technology updates..."
                                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none min-h-[140px] transition-all"
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => navigate(isEditMode ? `/icp-details/${id}` : '/icp')}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create ICP')}
                </Button>
            </div>
        </div>
    );
};

export default CreateICP;
