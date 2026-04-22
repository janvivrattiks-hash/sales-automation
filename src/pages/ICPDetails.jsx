import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Edit3,
    Users,
    Target,
    Zap,
    ChevronRight,
    Star,
    MessageSquare,
    Building2,
    Sparkles,
    ShieldCheck,
    Loader2,
    ArrowLeft
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Api from '../../scripts/Api';

const MetricCard = ({ title, value, trend, trendType, icon: Icon, iconColor }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-full group hover:shadow-xl hover:shadow-black/[0.02] transition-all duration-500">
        <div className="flex justify-between items-start mb-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">{title}</p>
            <div className={`p-2.5 rounded-xl ${iconColor} transition-transform group-hover:scale-110 duration-500`}>
                <Icon size={18} />
            </div>
        </div>
        <div className="flex items-end gap-3">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value}</h3>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full mb-1.5 ${trendType === 'up' ? 'bg-emerald-50 text-emerald-500' :
                    trendType === 'down' ? 'bg-rose-50 text-rose-500' :
                        'bg-gray-100 text-gray-500'
                }`}>
                {trend}
            </span>
        </div>
    </div>
);

const ConfigItem = ({ label, icon: Icon, children }) => (
    <div className="space-y-3">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <div className="flex items-center gap-2">
            {Icon && <Icon size={16} className="text-blue-500" />}
            {children}
        </div>
    </div>
);

const ICPDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [icp, setIcp] = useState(null);
    const [metrics, setMetrics] = useState({
        total_leads: 0,
        average_score: 0,
        matched_leads: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                navigate('/');
                return;
            }

            try {
                setIsLoading(true);
                // Fetch both in parallel
                const [icpData, metricsData] = await Promise.all([
                    Api.getIcpById(token, id),
                    Api.getIcpPerformanceMetrics(token, id)
                ]);

                if (icpData) {
                    setIcp(icpData);
                }
                if (metricsData) {
                    setMetrics(metricsData);
                }
            } catch (error) {
                console.error("Error fetching ICP data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchAllData();
        }
    }, [id, navigate]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 size={48} className="animate-spin text-primary" />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading ICP Details...</p>
            </div>
        );
    }

    if (!icp) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
                <div className="p-6 bg-rose-50 rounded-full text-rose-500">
                    <Target size={48} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Profile Not Found</h2>
                    <p className="text-gray-500 mt-2">The ICP profile you are looking for does not exist or has been removed.</p>
                </div>
                <Button onClick={() => navigate('/icp')}>Back to Management</Button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 space-y-8 pb-10">
            {/* Breadcrumbs & Back */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                    <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => navigate('/icp')}>Management</span>
                    <ChevronRight size={10} />
                    <span className="text-primary text-gray-400">All ICPs</span>
                    <ChevronRight size={10} />
                    <span className="text-primary">{icp.icp_name}</span>
                </div>
                <button
                    onClick={() => navigate('/icp')}
                    className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
                >
                    <ArrowLeft size={14} />
                    Back to List
                </button>
            </div>

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">{icp.icp_name}</h1>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-500 text-[10px] font-black rounded-md uppercase border border-emerald-100">Active</span>
                    </div>
                    <p className="text-gray-400 text-xs font-bold flex items-center gap-2 uppercase tracking-wide">
                        <Zap size={12} className="text-amber-400 fill-amber-400 shadow-sm" />
                        Profile configuration last synchronized recently
                    </p>
                </div>
                <Button
                    className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-indigo-100 transition-all active:scale-95 text-xs uppercase tracking-widest"
                    onClick={() => navigate(`/create-icp/${id}`)}
                >
                    <Edit3 size={16} />
                    Edit Profile
                </Button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Leads"
                    value={metrics.total_leads || "0"}
                    trend="+0%"
                    trendType="neutral"
                    icon={Users}
                    iconColor="bg-blue-50 text-blue-500"
                />
                <MetricCard
                    title="Average Score"
                    value={`${metrics.average_score || "0"}%`}
                    trend="+5%"
                    trendType="up"
                    icon={ShieldCheck}
                    iconColor="bg-indigo-50 text-indigo-500"
                />
                <MetricCard
                    title="Matched Leads"
                    value={metrics.matched_leads || "0"}
                    trend="+0%"
                    trendType="neutral"
                    icon={Target}
                    iconColor="bg-purple-50 text-purple-500"
                />
                <MetricCard
                    title="AI Matching %"
                    value={metrics.matched_leads && metrics.total_leads ? `${Math.round((metrics.matched_leads / metrics.total_leads) * 100)}%` : "0%"}
                    trend="-2%"
                    trendType="down"
                    icon={Zap}
                    iconColor="bg-amber-50 text-amber-500"
                />
            </div>

            {/* Main Content Card */}
            <Card noPadding className="overflow-hidden border-none shadow-2xl shadow-black/[0.03] rounded-[2.5rem]">
                <div className="p-8 border-b border-gray-50 bg-gray-50/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-xl">
                            <Zap size={20} className="fill-indigo-500" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">ICP Configuration Parameters</h2>
                    </div>
                </div>

                <div className="p-10 space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-8">
                        {/* Target Business */}
                        <ConfigItem label="Target Business">
                            <div className="flex flex-wrap gap-2 pt-1">
                                {(icp.target_business_type || 'General').split(',').map(tag => (
                                    <span key={tag} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-700 text-xs font-bold rounded-xl">{tag.trim()}</span>
                                ))}
                            </div>
                        </ConfigItem>

                        {/* Minimum Google Rating */}
                        <ConfigItem label="Minimum Google Rating">
                            <div className="flex items-center gap-2 text-amber-400">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star
                                            key={i}
                                            size={16}
                                            className={i <= Math.floor(icp.min_google_rating || 4) ? "fill-amber-400" : "text-gray-200"}
                                        />
                                    ))}
                                </div>
                                <span className="font-black text-gray-900 text-lg">{icp.min_google_rating || '4.0'}+</span>
                            </div>
                        </ConfigItem>

                        {/* Minimum Reviews Count */}
                        <ConfigItem label="Minimum Reviews Count">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-indigo-50 text-indigo-500 rounded-lg">
                                    <MessageSquare size={16} className="fill-indigo-500" />
                                </div>
                                <span className="font-extrabold text-gray-900 text-lg">{icp.min_reviews_count || '0'} reviews</span>
                            </div>
                        </ConfigItem>

                        {/* Website Available */}
                        <ConfigItem label="Website Available">
                            <div className="flex items-center gap-3">
                                <div className={`w-2.5 h-2.5 rounded-full ${icp.website_available ? 'bg-emerald-500 shadow-emerald-200' : 'bg-rose-500 shadow-rose-200'} shadow-lg`} />
                                <span className="font-extrabold text-gray-900">{icp.website_available ? 'Yes, Required' : 'Not Required'}</span>
                            </div>
                        </ConfigItem>

                        {/* Contact Information */}
                        <ConfigItem label="Contact Information Available">
                            <div className="flex items-center gap-3">
                                <div className={`w-2.5 h-2.5 rounded-full ${icp.contact_info_available ? 'bg-emerald-500 shadow-emerald-200' : 'bg-rose-500 shadow-rose-200'} shadow-lg`} />
                                <span className="font-extrabold text-gray-900">{icp.contact_info_available ? 'Yes, Required' : 'Not Required'}</span>
                            </div>
                        </ConfigItem>

                    </div>

                    {/* AI Matching Instructions */}
                    <div className="space-y-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-lg shadow-lg shadow-indigo-100">
                                    <Sparkles size={16} />
                                </div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">AI ICP Matching Instructions</h3>
                            </div>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100">NLP PROCESSING ACTIVE</span>
                        </div>

                        <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-3xl p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Sparkles size={120} />
                            </div>
                            <p className="text-sm font-bold text-gray-600 leading-relaxed relative z-10 italic">
                                {icp.ai_matching_instruction || 'No specific matching instructions provided.'}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ICPDetails;
