import React from 'react';
import { ExternalLink } from 'lucide-react';

const InfoRow = ({ icon: Icon, label, value, href }) => (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
        <div className="mt-0.5 p-2 bg-primary/5 rounded-lg text-primary shrink-0">
            <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
            {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline flex items-center gap-1 truncate">
                    {value} <ExternalLink size={12} className="shrink-0" />
                </a>
            ) : (
                <p className="text-sm font-medium text-gray-900 break-words">{value || '—'}</p>
            )}
        </div>
    </div>
);

export default InfoRow;
