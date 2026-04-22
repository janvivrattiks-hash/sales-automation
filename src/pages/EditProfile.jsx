import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ChevronLeft, User, Mail, Phone, Save, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const EditProfile = () => {
    const navigate = useNavigate();
    const { user, setUser, adminToken } = useApp();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        admin_name: '',
        admin_email: '',
        phone_number: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                admin_name: user.name || '',
                admin_email: user.email || '',
                phone_number: user.phone || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // TODO: Replace with actual API call when backend endpoint is ready
            // const response = await Api.updateProfile(formData, adminToken);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update local user state
            setUser(prev => ({
                ...prev,
                name: formData.admin_name,
                email: formData.admin_email,
                phone: formData.phone_number,
            }));

            navigate('/dashboard');
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 max-w-3xl pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                    <p className="text-gray-500 text-sm mt-1">Update your personal information and settings.</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-bold"
                >
                    <ChevronLeft size={16} />
                    Back
                </button>
            </div>

            {/* Profile Form */}
            <Card title="Personal Information" subtitle="Update your profile details">
                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    {/* Admin ID (Read-only) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                            Admin ID
                        </label>
                        <div className="px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-600 font-medium">
                            {user.admin_id || 'N/A'}
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label htmlFor="admin_name" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                            Full Name
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <User size={18} />
                            </span>
                            <Input
                                id="admin_name"
                                name="admin_name"
                                type="text"
                                value={formData.admin_name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="admin_email" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Mail size={18} />
                            </span>
                            <Input
                                id="admin_email"
                                name="admin_email"
                                type="email"
                                value={formData.admin_email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label htmlFor="phone_number" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                            Phone Number
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Phone size={18} />
                            </span>
                            <Input
                                id="phone_number"
                                name="phone_number"
                                type="tel"
                                value={formData.phone_number}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Account Status */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                            Account Status
                        </label>
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${user.is_active
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-red-100 text-red-600'
                                }`}>
                                {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(-1)}
                            className="flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Account Details */}
            <Card title="Account Details" subtitle="Read-only information">
                <div className="mt-6 space-y-4">
                    <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Created At</span>
                        <span className="text-sm font-medium text-gray-900">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            }) : 'N/A'}
                        </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last Updated</span>
                        <span className="text-sm font-medium text-gray-900">
                            {user.updated_at ? new Date(user.updated_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            }) : 'N/A'}
                        </span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default EditProfile;
