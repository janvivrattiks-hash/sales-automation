import React from 'react';
import { ChevronRight, Filter, Download } from 'lucide-react';
import Button from '../ui/Button';

const EnrichLeadsHeader = ({ queryValue, cityValue, areaValue, leads, navigate, onFilterOpen, location }) => {
    return (
        <>
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                <button
                    onClick={() => navigate('/lead-details', {
                        state: { 
                            ...location?.state, 
                            results: leads, 
                            queryInfo: { niche: queryValue, city: cityValue, area: areaValue },
                            backUrl: '/enrich'
                        }
                    })}
                    className="hover:text-primary transition-colors"
                >
                    LEAD DETAILS
                </button>
                <ChevronRight size={10} />
                <span className="text-gray-900">ENRICH</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Enrich Leads</h1>
                    <p className="text-gray-500 text-sm mt-1">Review and verify lead data before exporting to CRM.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={onFilterOpen}>
                        <Filter size={18} /> Filter
                    </Button>
                    <Button variant="outline">
                        <Download size={18} /> Export
                    </Button>
                </div>
            </div>
        </>
    );
};

export default EnrichLeadsHeader;
