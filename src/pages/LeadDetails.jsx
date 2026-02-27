import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    ChevronRight,
    Trash2,
    Users,
    Star,
    Eye,
    Trash,
    ChevronLeft,
    Sparkles,
    Loader2,
    Search
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const LeadDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(!location.state);
    const [leadData, setLeadData] = useState(null);

    useEffect(() => {
        console.log("Lead Details Location State:", location.state); // log the location state
        if (location.state?.results) { // check if results are present
            setLeadData({ // set lead data
                leads: location.state.results,
                ...(location.state.queryInfo || {})
            });
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [location.state]); // log the location state



    // Extract properties safely from leadData
    const queryValue = leadData?.query || 'N/A'; // get query value
    const cityValue = leadData?.city || 'N/A'; // get city value
    const areaValue = leadData?.area || 'N/A'; // get area value
    const leads = leadData?.leads || []; // get leads
    const totalLeadsCount = leads.length; // get total leads count

    const stats = [
        { label: 'SEARCH QUERY', value: queryValue },
        { label: 'CITY', value: cityValue },
        { label: 'AREA', value: areaValue },
        { label: 'TOTAL LEADS', value: totalLeadsCount.toString(), icon: Users },
    ];

    if (loading) { // show loading
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 py-20">
                <Loader2 size={48} className="animate-spin mb-4 text-primary" />
                <p className="font-medium">Loading search results...</p>
            </div>
        );
    }

    if (!leadData && !loading) { // show no data found message if no data is present
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 space-y-6 py-20">
                <div className="bg-gray-50 p-6 rounded-full">
                    <Search size={48} className="text-gray-300" />
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">No Search Data Found</p>
                    <p className="text-sm text-gray-500 mt-1">Please generate leads from the generator page first.</p>
                </div>
                <Button onClick={() => navigate('/lead-generator')} className="px-8">
                    Go to Generator
                </Button>
            </div>
        );
    }

    return ( // render lead details page 
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-32">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                <button onClick={() => navigate('/lead-generator')} className="hover:text-primary transition-colors">LEAD GENERATOR</button>
                <ChevronRight size={10} />
                <span className="text-gray-900">SEARCH DETAILS</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Search Details</h1>
                    <p className="text-gray-500 text-sm mt-1">View and manage the results of your lead generation query.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm font-bold">
                    <Trash2 size={16} />
                    Delete Search
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} noPadding className="p-4" >
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            {stat.icon && (
                                <div className="text-gray-200">
                                    <stat.icon size={36} />
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Results Table */}
            <Card noPadding className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] md:min-w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <th className="px-8 py-5">Business Name</th>
                                <th className="px-8 py-5">Contact Mobile</th>
                                <th className="px-8 py-5">Email</th>
                                <th className="px-8 py-5">Rating</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {leads.map((lead, index) => (
                                <tr key={lead.id || index} className="group hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors">
                                    <td className="px-8 py-6">
                                        <span className="font-bold text-gray-900">{lead.name || lead.BusinessName || 'N/A'}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-medium text-gray-500">{lead.phone || lead.MobileNumber || 'N/A'}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm text-gray-600">{lead.email || 'N/A'}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={14}
                                                    className={i < (lead.rating || 0) ? 'text-yellow-400' : 'text-gray-200'}
                                                    fill={i < (lead.rating || 0) ? 'currentColor' : 'none'}
                                                />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${lead.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                            }`}>
                                            {lead.status || 'New'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-4">
                                            <button className="text-gray-400 hover:text-primary transition-colors">
                                                <Eye size={18} />
                                            </button>
                                            <button className="text-gray-400 hover:text-red-500 transition-colors">
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {leads.length > 0 && (
                    <div className="px-8 py-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-white/50 gap-4">
                        <p className="text-xs font-bold text-gray-400">
                            Showing <span className="text-gray-900">1</span> to <span className="text-gray-900">{leads.length}</span> of <span className="text-gray-900">{leads.length}</span> results
                        </p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="px-4 text-xs font-bold disabled:opacity-50" disabled>
                                Previous
                            </Button>
                            <Button variant="outline" size="sm" className="px-4 text-xs font-bold">
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Enrich Data Button */}
            <div className="flex justify-end">
                <Button
                    onClick={() => navigate('/enrich')}
                    className="px-10 shadow-2xl shadow-primary/30 text-lg"
                >
                    <Sparkles size={20} fill="currentColor" />
                    Enrich Data
                </Button>
            </div>
        </div>
    );
};

export default LeadDetails;