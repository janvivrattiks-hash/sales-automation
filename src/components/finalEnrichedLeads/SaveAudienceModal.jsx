import React from 'react';
import { X, ChevronDown } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const SaveAudienceModal = ({ isOpen, onClose, audienceData, setAudienceData, uiTags, setUiTags, onSave }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Audience"
            footer={(
                <>
                    <Button variant="ghost" onClick={onClose} className="px-8 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl">
                        Cancel
                    </Button>
                    <Button
                        className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 transition-all active:scale-95"
                        onClick={onSave}
                    >
                        Create Audience
                    </Button>
                </>
            )}
        >
            <div className="space-y-6">
                {/* Audience Name */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-900 flex items-center gap-1">
                        Audience Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                        placeholder="e.g., Surat Cafes Oct 2023"
                        value={audienceData.audiance_name}
                        onChange={(e) => setAudienceData(prev => ({ ...prev, audiance_name: e.target.value }))}
                        className="bg-white border-gray-200 py-3 px-4 focus:ring-primary/10 transition-all"
                    />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-900">Description</label>
                    <textarea
                        placeholder="Add a brief description to help your team understand this audience segment..."
                        className="w-full min-h-[100px] p-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                        value={audienceData.discription}
                        onChange={(e) => setAudienceData(prev => ({ ...prev, discription: e.target.value }))}
                    />
                </div>

                {/* ICP Selector */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-900 flex items-center gap-1">
                        Select ICP to be matched <span className="text-gray-400 font-medium">(Optional)</span>
                    </label>
                    <div className="relative">
                        <select
                            className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/10 appearance-none cursor-pointer"
                            value={audienceData.icp}
                            onChange={(e) => setAudienceData(prev => ({ ...prev, icp: e.target.value }))}
                        >
                            <option value="" disabled>Select an Ideal Customer Profile...</option>
                            <option value="surat-cafes">Surat Cafes</option>
                            <option value="retailers">Retailers India</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ChevronDown size={18} />
                        </div>
                    </div>
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-900">Tags</label>
                    <div className="flex flex-wrap items-center gap-2 p-3 bg-white border border-gray-200 rounded-xl min-h-[50px]">
                        {uiTags.map((tag, i) => (
                            <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg animate-in zoom-in-95">
                                {tag}
                                <button onClick={() => setUiTags(uiTags.filter((_, idx) => idx !== i))} className="hover:text-blue-800">
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                        <input
                            placeholder="Type and press Enter..."
                            className="flex-1 bg-transparent border-none text-sm outline-none min-w-[150px] placeholder:text-gray-400"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    setUiTags([...uiTags, e.target.value.trim()]);
                                    e.target.value = '';
                                }
                            }}
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium mt-1">Use tags to organize and filter audiences later.</p>
                </div>
            </div>
        </Modal>
    );
};

export default SaveAudienceModal;
