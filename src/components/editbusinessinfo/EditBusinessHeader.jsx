import React from 'react';
import { ChevronRight } from 'lucide-react';

const EditBusinessHeader = ({ onNavigate }) => (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 px-4 py-2">
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            <span>Settings</span>
            <ChevronRight size={12} className="text-gray-300" />
            <span 
                className="cursor-pointer hover:text-primary transition-colors" 
                onClick={() => onNavigate('/business')}
            >
                Business Information
            </span>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="text-primary">Edit</span>
        </div>
    </div>
);

export default EditBusinessHeader;
