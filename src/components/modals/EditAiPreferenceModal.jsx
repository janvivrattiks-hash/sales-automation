import React, { useState, useEffect } from 'react';
import { Sparkles, X, Layout, Sliders, MessageSquare, ChevronDown } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { toast } from 'react-toastify';
import Api from '../../../scripts/Api';
import { useApp } from '../../context/AppContext';

const PreferenceInput = ({ label, value, onChange, placeholder, icon: Icon, subtext }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                {Icon && <Icon size={18} />}
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
            />
        </div>
        {subtext && <p className="text-[10px] font-medium text-gray-400 ml-1 leading-relaxed">{subtext}</p>}
    </div>
);

const PreferenceSelect = ({ label, value, onChange, options, icon: Icon, subtext }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors pointer-events-none">
                {Icon && <Icon size={18} />}
            </div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all outline-none appearance-none cursor-pointer"
            >
                <option value="" disabled>Select {label}</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-primary transition-colors">
                <ChevronDown size={18} />
            </div>
        </div>
        {subtext && <p className="text-[10px] font-medium text-gray-400 ml-1 leading-relaxed">{subtext}</p>}
    </div>
);

const EditAiPreferenceModal = ({ isOpen, onClose, currentData, onUpdate }) => {
    const { user, adminToken } = useApp();
    const [tone, setTone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (currentData) {
            setTone(currentData.tone || '');
        }
    }, [currentData, isOpen]);

    const handleSubmit = async () => {
        if (!tone) {
            toast.error("Please select a tone preference");
            return;
        }

        if (!adminToken) {
            toast.error("Session expired. Please login again.");
            return;
        }

        if (!user?.id) {
            toast.error("User information not loaded.");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await Api.updateAiPreference(adminToken, user.id, tone);

            if (result && result.data) {
                if (onUpdate) {
                    onUpdate({
                        tone: result.data.ai_tone_preference,
                    });
                }

                toast.success("AI Preferences updated successfully!");
                onClose();
            }
        } catch (error) {
            // Already toasted in Api.jsx
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit AI Preference"
            footer={
                <div className="flex items-center justify-end gap-3 w-full">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="px-6 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-primary shadow-xl shadow-primary/20 font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
                    >
                        {isSubmitting ? 'Updating...' : 'Update Preference'}
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                <div className="p-4 bg-violet-50/50 rounded-2xl border border-violet-100/50 flex gap-4 items-center mb-2">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-violet-500 shadow-sm">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest">AI Customization</p>
                        <p className="text-xs font-bold text-gray-600">Tune how your AI assistant interacts with leads.</p>
                    </div>
                </div>

                <PreferenceSelect
                    label="AI Tone Preference"
                    value={tone}
                    onChange={setTone}
                    icon={MessageSquare}
                    options={['Friendly', 'Professional', 'Assertive', 'Empathetic']}
                    subtext="Set the emotional resonance and communication style."
                />
            </div>
        </Modal>
    );
};

export default EditAiPreferenceModal;
