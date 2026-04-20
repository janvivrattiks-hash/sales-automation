import React from 'react';
import { Sparkles, Pencil, MessageSquare, Sliders, Info } from 'lucide-react';

const AiPreferenceCard = ({ aiPreference, onEdit }) => (
    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/[0.03] border border-gray-50 overflow-hidden">
        <div className="px-10 py-6 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-500">
                    <Sparkles size={20} />
                </div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">AI Behavior Preference</h3>
            </div>
            <button 
                onClick={onEdit}
                className="text-gray-300 hover:text-primary transition-colors"
            >
                <Pencil size={18} />
            </button>
        </div>

        <div className="p-10 space-y-8">
            <div className="grid grid-cols-1 gap-6">
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
);

export default AiPreferenceCard;
