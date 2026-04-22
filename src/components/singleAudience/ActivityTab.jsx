import React, { useState } from 'react';
import { Calendar, Clock, Mail, Send, CheckCircle, Eye, MousePointerClick, AlertCircle, MessageSquare, X, RefreshCcw } from 'lucide-react';
import { formatDateTime } from '../../utils/dataHelpers.jsx';
import Button from '../ui/Button';
import Api from '../../../scripts/Api';
import { toast } from 'react-toastify';

const getEventIcon = (eventName) => {
    switch (eventName?.toLowerCase()) {
        case 'processed': return <Mail size={12} className="text-gray-400" />;
        case 'delivered': return <CheckCircle size={12} className="text-green-500" />;
        case 'open': return <Eye size={12} className="text-blue-500" />;
        case 'click': return <MousePointerClick size={12} className="text-purple-500" />;
        case 'replied':
        case 'reply':
            return <MessageSquare size={12} className="text-indigo-500" />;
        case 'bounce':
        case 'dropped':
        case 'spamreport':
            return <AlertCircle size={12} className="text-red-500" />;
        default: return <Send size={12} className="text-gray-400" />;
    }
};

const ActivityTab = ({ activityLogs, isLoadingActivity, leadId, onRefresh }) => {
    const [selectedReply, setSelectedReply] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isFetchingReply, setIsFetchingReply] = useState(false);

    const handleViewReply = async (log) => {
        setSelectedReply(log); // Open modal with existing data first
        setIsFetchingReply(true);
        try {
            const token = localStorage.getItem('admin_token');
            const data = await Api.getGmailReplyContent(log.id, token);
            if (data && data.reply_body) {
                setSelectedReply(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error("Error fetching reply content:", error);
        } finally {
            setIsFetchingReply(false);
        }
    };

    const handleSyncReplies = async () => {
        try {
            setIsSyncing(true);
            const token = localStorage.getItem('admin_token');
            
            // 1. Sync open status for each individual activity ID if logs exist
            if (activityLogs && activityLogs.length > 0) {
                await Promise.all(
                    activityLogs.map(log => {
                        if (log.id) return Api.syncGmailOpenStatus(log.id, token);
                        return Promise.resolve();
                    })
                );
            }

            // 2. Sync all replies
            await Api.syncGmailReplies(token);
            toast.success("All activities synced!");
            
            // 3. Refresh activity logs without page reload
            if (onRefresh) {
                await onRefresh();
            }
        } catch (error) {
            console.error("Sync error:", error);
            if (error.response?.status === 403) {
                toast.error("Please connect your Google account first!");
                const token = localStorage.getItem('admin_token');
                const connRes = await Api.getGoogleConnectUrl(token);
                if (connRes && connRes.authorization_url) {
                    const width = 600;
                    const height = 700;
                    const left = (window.screen.width / 2) - (width / 2);
                    const top = (window.screen.height / 2) - (height / 2);

                    const popup = window.open(
                        connRes.authorization_url,
                        'GoogleConnect',
                        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=no,toolbar=no,menubar=no`
                    );

                    if (!popup) {
                        window.location.href = connRes.authorization_url;
                    }
                }
            } else {
                toast.error("Failed to sync replies.");
            }
        } finally {
            setIsSyncing(false);
        }
    };

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
                <h3 className="text-gray-900 font-bold mb-1">No Outreach Activity Yet</h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">Historical tracking will appear here once outreach begins.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Sync Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <RefreshCcw size={20} className={isSyncing ? 'animate-spin' : ''} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">Sync Outreach Activity</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Check for new replies & status updates</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 rounded-xl text-xs font-bold border-gray-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all"
                    isLoading={isSyncing}
                    onClick={handleSyncReplies}
                >
                    <RefreshCcw size={14} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync Now
                </Button>
            </div>

            {activityLogs.map((log, index) => {
                const isReplied = log.is_replied || (log.current_status || '').toLowerCase() === 'replied';

                return (
                    <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Header: Email Subject & Status */}
                        <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isReplied ? 'bg-indigo-500/10 text-indigo-500' : 'bg-primary/10 text-primary'}`}>
                                    {isReplied ? <MessageSquare size={18} /> : <Mail size={18} />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-base">{log.subject || 'Outreach Email'}</h4>
                                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                        <span className="font-medium text-gray-600">To: {log.recipient_email || 'Unknown'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {isReplied && (
                                    <Button
                                        variant="ghost"
                                        size="xs"
                                        className="h-8 px-3 rounded-lg text-indigo-600 hover:bg-indigo-50 flex items-center gap-1.5"
                                        onClick={() => handleViewReply(log)}
                                    >
                                        <Eye size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-wider">View Reply</span>
                                    </Button>
                                )}
                                <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border shadow-sm ${isReplied ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                    {log.current_status || (isReplied ? 'Replied' : 'Sent')}
                                </span>
                            </div>
                        </div>

                        {/* History Timeline */}
                        <div className="p-6 relative">
                            {(() => {
                                // Synthesize history if backend log.history is missing or empty
                                let timeline = log.history || [];
                                if (timeline.length === 0) {
                                    // 1. Sent (Always)
                                    if (log.sent_at) {
                                        timeline.push({ event_name: 'sent', timestamp: log.sent_at });
                                    }
                                    // 2. Opened
                                    if (log.opened_at || log.is_opened) {
                                        timeline.push({
                                            event_name: 'open',
                                            timestamp: log.opened_at || log.sent_at // fallback to sent_at if opened_at missing
                                        });
                                    }
                                    // 3. Replied
                                    if (isReplied) {
                                        timeline.push({
                                            event_name: 'replied',
                                            timestamp: log.reply_at || log.opened_at || log.sent_at
                                        });
                                    }
                                }

                                if (timeline.length === 0) {
                                    return <p className="text-sm text-gray-400 italic">No tracking history available.</p>;
                                }

                                return (
                                    <div className="relative pl-6 space-y-6">
                                        {/* Vertical Line */}
                                        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

                                        {timeline.map((histEvent, hIndex) => (
                                            <div key={hIndex} className="relative flex items-start gap-4 group">
                                                <div className="absolute -left-[24px] top-0 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:scale-110 group-hover:border-primary/30 transition-transform shadow-sm">
                                                    {getEventIcon(histEvent.event_name)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800 capitalize leading-none">{histEvent.event_name}</p>
                                                    <p className="text-[11px] font-medium text-gray-400 mt-1.5 flex items-center gap-1">
                                                        <Clock size={10} /> {formatDateTime(histEvent.processed || histEvent.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                );
            })}

            {/* Reply Viewer Modal */}
            {selectedReply && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[80vh]">
                        {/* Header */}
                        <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-2xl">
                                    <MessageSquare size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl leading-tight">Email Reply</h3>
                                    <p className="text-xs opacity-80 font-bold uppercase tracking-widest mt-0.5">From: {selectedReply.recipient_email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedReply(null)}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 overflow-y-auto">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Subject</label>
                                    <p className="text-lg font-bold text-gray-900">{selectedReply.subject}</p>
                                </div>
                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 min-h-[150px] flex flex-col">
                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-4">Reply Body</label>
                                    <div className="flex-1 text-sm text-gray-800 leading-relaxed whitespace-pre-line font-medium">
                                        {isFetchingReply ? (
                                            <div className="flex items-center justify-center h-full py-10">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                            </div>
                                        ) : (
                                            selectedReply.reply_body || "No reply body found."
                                        )}
                                    </div>
                                </div>
                                {selectedReply.sent_at && (
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-4 border-t border-gray-100">
                                        <Clock size={12} />
                                        <span>Received on {formatDateTime(selectedReply.reply_at || selectedReply.sent_at)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-end">
                            <Button
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-indigo-200"
                                onClick={() => setSelectedReply(null)}
                            >
                                Close View
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityTab;
