import React from 'react';
import { ChevronRight, Trash2, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

const LeadDetailsHeader = ({ navigate, leads, queryValue, cityValue, areaValue, onDeleteSearch }) => {
    return (
        <>
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                <button onClick={() => navigate('/lead-generator')} className="hover:text-primary transition-colors">
                    LEAD GENERATOR
                </button>
                <ChevronRight size={10} />
                <span className="text-gray-900">SEARCH DETAILS</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Search Details</h1>
                    <p className="text-gray-500 text-sm mt-1">View and manage the results of your lead generation query.</p>
                </div>
                <div className="flex flex-row gap-3">
                    <button 
                        onClick={onDeleteSearch}
                        className="flex items-center gap-2 px-4 py-2 border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm font-bold"
                    >
                        <Trash2 size={16} />
                        Delete Search
                    </button>
                    <Button
                        onClick={() => navigate('/enrich', {
                            state: {
                                results: leads,
                                queryInfo: { niche: queryValue, city: cityValue, area: areaValue }
                            }
                        })}
                        className="flex items-center gap-2 px-4 py-2 shadow-lg shadow-primary/20"
                    >
                        <Sparkles size={16} fill="currentColor" />
                        Enrich Data
                    </Button>
                </div>
            </div>
        </>
    );
};

export default LeadDetailsHeader;
