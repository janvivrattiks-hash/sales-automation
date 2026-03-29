import React from 'react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { formatDateTime } from '../../utils/dataHelpers.jsx';

const ActivityTab = ({ activityLogs, isLoadingActivity }) => {
    if (isLoadingActivity) {
        return (
            <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (activityLogs.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="text-gray-300" size={32} />
                </div>
                <h3 className="text-gray-900 font-bold mb-1">No Activity Yet</h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">Historical activity will appear here once outreach begins.</p>
            </div>
        );
    }

    return (
        <div className="relative pl-8 space-y-8 animate-in fade-in duration-500">
            {/* Vertical Line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

            {activityLogs.map((log, index) => (
                <div key={index} className="relative group">
                    {/* Activity Dot */}
                    <div className="absolute -left-[25px] top-1.5 w-3 h-3 rounded-full border-2 border-white bg-primary shadow-[0_0_0_4px_rgba(59,130,246,0.1)] group-hover:scale-125 transition-transform duration-300"></div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{log.activity_type || 'Engagement'}</h4>
                            <p className="text-sm text-gray-500 leading-relaxed max-w-2xl">{log.description || 'Interacted with lead via outreach channel.'}</p>
                            <div className="flex items-center gap-4 pt-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <Clock size={12} /> {formatDateTime(log.timestamp || log.created_at)}
                                </div>
                                {log.channel && (
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md uppercase tracking-wider">{log.channel}</span>
                                )}
                            </div>
                        </div>

                        {log.details_url && (
                            <button className="flex items-center gap-2 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                                View Details <ArrowRight size={14} />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityTab;
