import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyles = 'px-6 h-11 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20',
        secondary: 'bg-secondary text-gray-900 hover:bg-opacity-90',
        outline: 'border border-gray-200 text-gray-600 hover:bg-gray-50',
        ghost: 'text-gray-500 hover:bg-gray-100',
        danger: 'bg-red-500 text-white hover:bg-red-600',
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
