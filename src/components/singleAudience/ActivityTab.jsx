import React from 'react';
import { Calendar, Clock, Mail, Send, CheckCircle, Eye, MousePointerClick, AlertCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/dataHelpers.jsx';

const getEventIcon = (eventName) => {
    switch (eventName?.toLowerCase()) {
        case 'processed': return <Mail size={12} className="text-gray-400" />;
        case 'delivered': return <CheckCircle size={12} className="text-green-500" />;
        case 'open': return <Eye size={12} className="text-blue-500" />;
        case 'click': return <MousePointerClick size={12} className="text-purple-500" />;
        case 'bounce':
        case 'dropped':
        case 'spamreport':
            return <AlertCircle size={12} className="text-red-500" />;
        default: return <Send size={12} className="text-gray-400" />;
    }
};

const ActivityTab = ({ activityLogs, isLoadingActivity }) => {
    if (isLoadingActivity) {
        return (
            <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!activityLogs || activityLogs.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="text-gray-300" size={32} />
                </div>
                <h3 className="text-gray-900 font-bold mb-1">No Activity Yet</h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">Historical tracking will appear here once outreach begins.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {activityLogs.map((log, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Header: Email Subject & Status */}
                    <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <Mail size={18} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-base">{log.subject || 'Outreach Email'}</h4>
                                <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                    <span className="font-medium text-gray-600">To: {log.recipient_email || 'Unknown'}</span>
                                    {log.sent_at && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span className="flex items-center gap-1 font-medium">
                                                <Clock size={10} /> {formatDateTime(log.sent_at)}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-gray-200 shadow-sm">
                                Status: {log.current_status || 'Unknown'}
                            </span>
                        </div>
                    </div>

                    {/* History Timeline */}
                    <div className="p-6 relative">
                        {(!log.history || log.history.length === 0) ? (
                            <p className="text-sm text-gray-400 italic">No tracking history available.</p>
                        ) : (
                            <div className="relative pl-6 space-y-6">
                                {/* Vertical Line */}
                                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
                                
                                {log.history.map((histEvent, hIndex) => (
                                    <div key={hIndex} className="relative flex items-start gap-4 group">
                                        <div className="absolute -left-[24px] top-0 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:scale-110 group-hover:border-primary/30 transition-transform shadow-sm">
                                            {getEventIcon(histEvent.event_name)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 capitalize leading-none">{histEvent.event_name}</p>
                                            <p className="text-[11px] font-medium text-gray-400 mt-1.5 flex items-center gap-1">
                                                <Clock size={10} /> {formatDateTime(histEvent.processed)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityTab;
