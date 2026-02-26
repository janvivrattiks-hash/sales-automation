import React from 'react';

const Input = ({ label, error, className = '', icon: Icon, ...props }) => {
    return (
        <div className="w-full space-y-1.5">
            {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
            <div className="relative">
                {Icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Icon size={18} />
                    </span>
                )}
                <input
                    className={`w-full ${Icon ? 'pl-10' : 'px-4'} py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none ${error ? 'border-red-500 focus:ring-red-100' : ''
                        } ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};

export default Input;
