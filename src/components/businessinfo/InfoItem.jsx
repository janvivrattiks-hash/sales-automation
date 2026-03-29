import React from 'react';

const InfoItem = ({ label, value, icon: Icon, className = "" }) => (
    <div className={`space-y-1.5 ${className}`}>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</p>
        <div className="flex items-center gap-2">
            {Icon && <Icon size={14} className="text-primary/70" />}
            <p className="text-sm font-bold text-gray-900 leading-tight">{value || 'N/A'}</p>
        </div>
    </div>
);

export default InfoItem;
