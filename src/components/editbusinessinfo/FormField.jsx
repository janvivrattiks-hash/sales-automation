import React from 'react';

const FormField = ({ label, icon: Icon, children, className = "" }) => (
    <div className={`space-y-2.5 ${className}`}>
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative group">
            {Icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                    <Icon size={18} />
                </div>
            )}
            {children}
        </div>
    </div>
);

export default FormField;
