import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReviewLeadsHeader = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                <button onClick={() => navigate('/lead-generator')} className="hover:text-primary transition-colors">LEAD GENERATOR</button>
                <ChevronRight size={10} />
                <span className="text-gray-900">REVIEW</span>
            </div>

            <div>
                <h1 className="text-2xl font-bold text-gray-900">Review Leads</h1>
                <p className="text-gray-500 text-sm mt-1">Select and verify contacts before proceeding to enrichment.</p>
            </div>
        </div>
    );
};

export default ReviewLeadsHeader;
