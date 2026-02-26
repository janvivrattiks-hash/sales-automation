import React from 'react';

const Toggle = ({ label, enabled, onChange, description }) => {
    return (
        <div className="flex items-start justify-between gap-4 py-4">
            <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">{label}</p>
                {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
            </div>
            <button
                type="button"
                onClick={() => onChange(!enabled)}
                className={`${enabled ? 'bg-primary' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
            >
                <span
                    aria-hidden="true"
                    className={`${enabled ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
            </button>
        </div>
    );
};

export default Toggle;
