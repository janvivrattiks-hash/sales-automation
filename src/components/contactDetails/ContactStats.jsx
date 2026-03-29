import React, { useState } from 'react';
import Card from '../ui/Card';
import StarRating from '../ui/StarRating';

const ContactStats = ({ ratingVal, reviewsRaw, ownerName }) => {
    const [isOwnerExpanded, setIsOwnerExpanded] = useState(false);

    const stats = [
        { label: 'Rating', value: ratingVal, isRating: true },
        { label: 'Reviews', value: reviewsRaw ? `${reviewsRaw} reviews` : '0 reviews' },
        { label: 'Owner Name', value: ownerName, isClickable: true },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(s => (
                <Card
                    key={s.label}
                    noPadding
                    className={`p-4 transition-all duration-300 ${s.isClickable ? 'cursor-pointer hover:bg-gray-50/50 hover:shadow-md border-transparent hover:border-primary/20' : ''}`}
                    onClick={s.isClickable ? () => setIsOwnerExpanded(!isOwnerExpanded) : undefined}
                >
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                    {s.isRating ? (
                        <div className="flex flex-col gap-1">
                            <p className="text-xl font-bold text-gray-900 leading-tight">{s.value} / 5</p>
                            <StarRating rating={ratingVal} size="xs" />
                        </div>
                    ) : (
                        <p className={`text-xl font-bold text-gray-900 leading-tight transition-all duration-300 ${s.isClickable && isOwnerExpanded ? 'whitespace-normal break-words h-auto' : 'truncate'}`}>
                            {s.value}
                        </p>
                    )}
                </Card>
            ))}
        </div>
    );
};

export default ContactStats;
