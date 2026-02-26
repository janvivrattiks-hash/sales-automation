import React, { useState } from 'react';
import { Building2, Globe, FileText, Settings2, Sparkles, Edit3, Save, Info } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Toggle from '../components/ui/Toggle';

const BusinessInfo = () => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [businessData, setBusinessData] = useState({
        name: 'TechFlow Solutions',
        website: 'https://techflow.io',
        industry: 'Software Development',
        description: 'AI-powered automation tools for high-growth sales teams looking to scale their outreach without increasing headcount.',
    });

    const [preferences, setPreferences] = useState({
        aiDrafting: true,
        smartScheduling: false,
        leadEnrichment: true,
        autoFollowUp: true,
    });

    const handlePreferenceChange = (key) => (value) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Business Information</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your company profile and AI outreach preferences.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                        <Edit3 size={18} /> Edit Profile
                    </Button>
                    <Button>
                        <Save size={18} /> Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Overview */}
                <Card title="Business Profile" icon={Building2} className="lg:col-span-2">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Company Name</p>
                                <p className="text-lg font-bold text-gray-900">{businessData.name}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Industry</p>
                                <p className="text-lg font-bold text-gray-900 text-primary">{businessData.industry}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Website</p>
                                <div className="flex items-center gap-2 text-primary font-medium">
                                    <Globe size={16} />
                                    <a href={businessData.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {businessData.website}
                                    </a>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Company Description</p>
                                <p className="text-gray-600 leading-relaxed max-w-2xl">
                                    {businessData.description}
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex gap-4">
                            <div className="p-3 bg-primary/[0.03] rounded-xl text-primary border border-primary/10">
                                <Info size={20} />
                            </div>
                            <p className="text-sm text-gray-500 italic leading-relaxed">
                                This information helps our AI tailor outreach messages and search filters to match your business's unique value proposition.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* AI Preferences */}
                <div className="space-y-8">
                    <Card title="AI Outreach Preferences" icon={Sparkles}>
                        <div className="divide-y divide-gray-100">
                            <Toggle
                                label="AI Message Generation"
                                description="Automatically draft personalized outreach messages."
                                enabled={preferences.aiDrafting}
                                onChange={handlePreferenceChange('aiDrafting')}
                            />
                            <Toggle
                                label="Lead Enrichment"
                                description="Gather deep technical data on potential leads."
                                enabled={preferences.leadEnrichment}
                                onChange={handlePreferenceChange('leadEnrichment')}
                            />
                            <Toggle
                                label="Auto Follow-up"
                                description="Trigger follow-ups if prospects don't respond."
                                enabled={preferences.autoFollowUp}
                                onChange={handlePreferenceChange('autoFollowUp')}
                            />
                            <Toggle
                                label="Smart Scheduling"
                                description="Optimized sending times based on lead timezones."
                                enabled={preferences.smartScheduling}
                                onChange={handlePreferenceChange('smartScheduling')}
                            />
                        </div>
                    </Card>

                    <Card title="Brand Voice" icon={Settings2}>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500">Configure how the AI represents your brand.</p>
                            <select className="w-full p-2 bg-gray-50 border border-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20">
                                <option>Professional & Corporate</option>
                                <option>Friendly & Casual</option>
                                <option>Energetic & Salesy</option>
                            </select>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Business Profile"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => setIsEditModalOpen(false)}>Update Profile</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input
                        label="Company Name"
                        value={businessData.name}
                        onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                        icon={Building2}
                    />
                    <Input
                        label="Website"
                        value={businessData.website}
                        onChange={(e) => setBusinessData({ ...businessData, website: e.target.value })}
                        icon={Globe}
                    />
                    <Input
                        label="Industry"
                        value={businessData.industry}
                        onChange={(e) => setBusinessData({ ...businessData, industry: e.target.value })}
                    />
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700">Company Description</label>
                        <textarea
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px] transition-all"
                            value={businessData.description}
                            onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default BusinessInfo;
