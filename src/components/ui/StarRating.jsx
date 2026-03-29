import React from 'react';

const StarRating = ({ rating, max = 5, size = 'md' }) => {
    const sizeClasses = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' };
    
    return (
        <div className="flex items-center gap-0.5">
            {[...Array(max)].map((_, i) => {
                const fill = Math.min(Math.max(rating - i, 0), 1);
                const fillPct = Math.round(fill * 100);
                return (
                    <span 
                        key={i} 
                        className={`relative inline-block ${sizeClasses[size] || 'text-base'} leading-none`} 
                        style={{ width: '1em', height: '1em' }}
                    >
                        <span className="text-gray-200">★</span>
                        {fillPct > 0 && (
                            <span 
                                className="absolute inset-0 overflow-hidden text-yellow-400" 
                                style={{ width: `${fillPct}%` }}
                            >
                                ★
                            </span>
                        )}
                    </span>
                );
            })}
            <span className="ml-1 text-[10px] text-gray-400 font-bold">{rating}</span>
        </div>
    );
};

export default StarRating;
