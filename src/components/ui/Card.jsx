import React from 'react';

const Card = ({ children, title, subtitle, icon: Icon, className = '', footer, noPadding = false, ...props }) => {
    return (
        <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`} {...props}>
            {(title || Icon) && (
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <div>
                        {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
                        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                    </div>
                    {Icon && (
                        <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                            {React.isValidElement(Icon) ? Icon : <Icon size={20} />}
                        </div>
                    )}
                </div>
            )}
            <div className={noPadding ? '' : 'p-6'}>
                {children}
            </div>
            {footer && (
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;
