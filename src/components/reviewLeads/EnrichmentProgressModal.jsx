import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Zap, CheckCircle2, ChevronRight, Mail, Phone, Globe, Eye, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import Api from '../../../scripts/Api';
import { toast } from 'react-toastify';
import EnrichedLeadRow from '../finalEnrichedLeads/EnrichedLeadRow';

const EnrichmentProgressModal = ({ leadsToEnrich, adminId, adminToken, onComplete, onCancel }) => {
    const [completedLeads, setCompletedLeads] = useState([]);
    const [inProgressCount, setInProgressCount] = useState(leadsToEnrich.length);
    const [wsConnected, setWsConnected] = useState(false);
    const wsRef = useRef(null);

    useEffect(() => {
        if (!adminId) return;

        // Construct WebSocket URL
        const baseUrl = import.meta.env.VITE_BASE_URL_DEVELOPMENT || "http://192.168.1.39:8000";
        const wsUrl = baseUrl.replace('http', 'ws') + `/ws/notifications/${adminId}`;
        
        console.log("🔌 Connecting to WebSocket:", wsUrl);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("✅ WebSocket Connected!");
            setWsConnected(true);
        };

        ws.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("📩 WS Message:", data);

                if (data.status === "completed") {
                    toast.success(`${data.business_name} Enriched!`);
                    
                    // Fetch full data using job_id or lead info
                    // The user mentioned: fetch(`/enrichment/json/${data.job_id}`)
                    // Our Api.jsx has getEnrichmentJson(id, token) which uses analyze-raw endpoint
                    const freshData = await Api.getEnrichmentJson(data.job_id, adminToken);
                    
                    if (freshData) {
                        setCompletedLeads(prev => [...prev, { ...freshData, status: 'Enriched' }]);
                        setInProgressCount(prev => Math.max(0, prev - 1));
                    }
                } else if (data.status === "failed") {
                    toast.error(`${data.business_name} Failed: ${data.error || 'Unknown error'}`);
                    setInProgressCount(prev => Math.max(0, prev - 1));
                }
            } catch (err) {
                console.error("❌ WS Parsing Error:", err);
            }
        };

        ws.onclose = () => {
            console.log("🔌 WebSocket Disconnected");
            setWsConnected(false);
        };

        ws.onerror = (error) => {
            console.error("❌ WebSocket Error:", error);
        };

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, [adminId, adminToken]);

    const isAllDone = inProgressCount === 0 && completedLeads.length > 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
                
                {/* Modal Header */}
                <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                                <Zap size={28} className="fill-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">AI Enrichment Engine</h2>
                                <p className="text-blue-100 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                    {wsConnected ? (
                                        <>
                                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                            Live Stream Connection Active
                                        </>
                                    ) : (
                                        <>
                                            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                                            Connecting to Data Stream...
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-black">{completedLeads.length} / {leadsToEnrich.length}</div>
                            <p className="text-xs font-bold text-blue-100 uppercase tracking-widest">Leads Enriched</p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-0 min-h-[400px] bg-gray-50/50">
                    {completedLeads.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 px-10 text-center">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                                <Loader2 size={80} className="animate-spin text-blue-600 relative z-10" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Analyzing Prospect Intelligence...</h3>
                            <p className="text-gray-400 font-bold text-sm max-w-sm leading-relaxed uppercase tracking-tight">
                                Our AI is currently scouring social profiles, websites, and contact databases for {leadsToEnrich.length} leads.
                            </p>
                            
                            <div className="mt-10 flex gap-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full bg-blue-500 animate-bounce`} style={{ animationDelay: `${i * 0.2}s` }}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10">
                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                                        <th className="px-8 py-4">Business Name</th>
                                        <th className="px-8 py-4">Contact</th>
                                        <th className="px-8 py-4">Socials</th>
                                        <th className="px-8 py-4">Website</th>
                                        <th className="px-8 py-4">Rating</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {completedLeads.map((lead, idx) => (
                                        <EnrichedLeadRow 
                                            key={lead.id || idx} 
                                            lead={lead} 
                                            index={idx}
                                            leads={completedLeads}
                                            navigate={() => {}} // Dummy as it's a modal
                                            onDelete={() => {}} // Dummy
                                        />
                                    ))}
                                    
                                    {/* In Progress Indicator as the last row */}
                                    {inProgressCount > 0 && (
                                        <tr className="bg-blue-50/30 animate-pulse border-t-2 border-blue-100/50">
                                            <td colSpan="7" className="px-8 py-10 text-center">
                                                <div className="flex items-center justify-center gap-4">
                                                    <div className="flex -space-x-3">
                                                        {Array.from({ length: 3 }).map((_, i) => (
                                                            <div key={i} className="w-10 h-10 rounded-xl bg-blue-100 border-2 border-white flex items-center justify-center text-blue-600 font-black text-xs shadow-sm">
                                                                <Loader2 size={16} className="animate-spin" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-sm font-black text-blue-900">
                                                            {inProgressCount} Other {inProgressCount === 1 ? 'Business' : 'Businesses'} Processing...
                                                        </div>
                                                        <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                                            Gathering intelligence live from Redis stream
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-8 bg-white border-t border-gray-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                           <Loader2 size={24} className={inProgressCount > 0 ? "animate-spin" : ""} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-900">
                                {isAllDone ? "Enrichment Session Complete" : "Enrichment Session In-Progress"}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">
                                Total Lead Count: {leadsToEnrich.length}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        {!isAllDone ? (
                            <Button 
                                variant="ghost" 
                                className="text-gray-400 font-bold hover:bg-gray-50 h-14 px-8 rounded-2xl"
                                onClick={onCancel}
                            >
                                Cancel Session
                            </Button>
                        ) : (
                            <Button 
                                className="bg-blue-600 hover:bg-blue-700 text-white font-black h-14 px-10 rounded-2xl shadow-xl shadow-blue-200"
                                onClick={() => onComplete(completedLeads)}
                            >
                                Finish & View Results
                                <ChevronRight size={20} />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnrichmentProgressModal;
