import React from 'react';
import { X, Users, Loader2, ChevronDown } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const SaveAudienceModal = ({ 
    isOpen, onClose, audienceData, setAudienceData, uiTags, setUiTags, onSave,
    audiences = [], saveMode = 'new', setSaveMode, selectedAudienceId, setSelectedAudienceId,
    isSaving = false, leadsCount = 0
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={saveMode === 'new' ? "Create New Audience" : "Add to Existing Audience"}
            footer={(
                <>
                    <Button variant="ghost" onClick={onClose} className="px-8 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl">
                        Cancel
                    </Button>
                    <Button
                        className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 transition-all active:scale-95"
                        onClick={onSave}
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : (saveMode === 'new' ? 'Complete & Save' : 'Add to Audience')}
                    </Button>
                </>
            )}
        >
            <div className="space-y-6 text-left">
                {/* Mode Toggle */}
                <div className="flex p-1 bg-gray-100 rounded-xl">
                    <button 
                        onClick={() => setSaveMode('new')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${saveMode === 'new' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Create New
                    </button>
                    <button 
                        onClick={() => setSaveMode('existing')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${saveMode === 'existing' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Add to Existing
                    </button>
                </div>

                {/* Leads Ready Indicator */}
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Leads to Save</p>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                {leadsCount} CONTACTS READY
                            </p>
                        </div>
                    </div>
                </div>

                {saveMode === 'new' ? (
                    <>
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
                    </>
                ) : (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase pb-1.5 block">Select Audience</label>
                            <div className="relative">
                                <select 
                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                                    value={selectedAudienceId || ''}
                                    onChange={(e) => setSelectedAudienceId(e.target.value)}
                                >
                                    <option value="" disabled>Choose an audience...</option>
                                    {audiences.map((aud) => (
                                        <option key={aud.id} value={aud.id}>
                                            {aud.audiance_name || aud.name} ({aud.business_count || aud.businesses?.length || 0} leads)
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                            {audiences.length === 0 && (
                                <p className="text-[10px] text-amber-600 font-bold mt-2 uppercase tracking-tight italic text-center">No existing audiences found. Try creating a new one first.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default SaveAudienceModal;
