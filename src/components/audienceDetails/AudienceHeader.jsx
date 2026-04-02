import React from 'react';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';

const AudienceHeader = ({ audienceName, isEnriched, loading, enriching, navigate }) => {
    return (
        <>
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                <button onClick={() => navigate('/audience-list')} className="hover:text-primary transition-colors">AUDIENCE LIST</button>
                <ChevronRight size={10} />
                <span className="text-gray-900">AUDIENCE DETAILS</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Audience Details</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-500 text-sm">
                            Viewing contacts for <span className="text-primary font-bold italic">"{audienceName}"</span>
                            {isEnriched && (
                                <span className="ml-2 px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-black rounded-lg uppercase border border-green-100 italic">Enriched Data</span>
                            )}
                        </p>
                        {loading && <Loader2 size={14} className="animate-spin text-primary" />}
                        {!loading && enriching && (
                            <span className="text-xs font-bold text-primary bg-primary/10 rounded-lg px-2 py-0.5">Enriching contacts in background...</span>
                        )}
                    </div>
                </div>
                <div className="flex flex-row gap-3">
                    <button
                        onClick={() => navigate('/audience-list')}
                        className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold active:scale-95 shadow-sm"
                    >
                        <ChevronLeft size={16} />
                        Back to List
                    </button>
                </div>
            </div>
        </>
    );
};

export default AudienceHeader;
