import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Target, TrendingUp, Briefcase, DollarSign, ExternalLink, Plus, Eye, Trash2, Loader2 } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import StatCard from '../components/ui/StatCard';
import { useApp } from '../context/AppContext';
import Api from '../../scripts/Api';

const lineData = [
    { name: 'Mon', leads: 40 },
    { name: 'Tue', leads: 30 },
    { name: 'Wed', leads: 60 },
    { name: 'Thu', leads: 45 },
    { name: 'Fri', leads: 90 },
    { name: 'Sat', leads: 65 },
    { name: 'Sun', leads: 80 },
];

const pieData = [
    { name: 'LinkedIn', value: 450 },
    { name: 'Direct', value: 300 },
    { name: 'Email', value: 200 },
    { name: 'Other', value: 100 },
];

const COLORS = ['#8884d8', '#00C49F', '#FFBB28', '#FF8042'];

const StarRating = ({ rating, max = 5 }) => {
    return (
        <div className="flex items-center gap-0.5">
            {[...Array(max)].map((_, i) => {
                const fill = Math.min(Math.max(rating - i, 0), 1); // 0, partial, or 1
                const fillPct = Math.round(fill * 100);
                return (
                    <span
                        key={i}
                        className="relative inline-block text-sm leading-none"
                        style={{ width: '1em', height: '1em' }}
                    >
                        {/* Empty star */}
                        <span className="text-gray-200">★</span>
                        {/* Filled overlay clipped to fillPct width */}
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
            <span className="ml-1 text-xs text-gray-400 font-medium">{rating}</span>
        </div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { adminToken } = useApp();
    const [stats, setStats] = useState(null);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingId, setViewingId] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ open: false, lead: null });
    const [deletingId, setDeletingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchData = async () => {
            // Static stats
            const statsData = {
                totalLeads: '5,234',
                activeCampaigns: '12',
                conversionRate: '4.8%',
                revenuePipeline: '$1.2M'
            };
            setStats(statsData);

            // Fetch recent activity from API
            const recentData = await Api.getRecent(adminToken);
            if (recentData && recentData.length > 0) {
                // Flatten: each job has a results[] array; spread all leads into one list
                const mappedLeads = [];
                recentData.forEach((job) => {
                    const jobStatus = job.search_details?.status ?? 'New';
                    (job.results ?? []).forEach((result, idx) => {
                        mappedLeads.push({
                            id: `${job.job_id}-${idx}`,
                            result_id: result.id,
                            job_id: job.job_id,
                            company: result.name ?? 'N/A',
                            name: result.owner_name ?? 'N/A',
                            phone: result.phone ?? 'N/A',
                            website: result.website ?? '',
                            rating: result.rating ?? 0,
                            status: jobStatus,
                            category: result.category ?? '',
                        });
                    });
                });
                setLeads(mappedLeads);
            } else {
                // Fallback mock data
                setLeads([
                    { id: 1, company: 'TechFlow Solutions', name: 'John Smith', phone: '+1 555-0101', website: 'techflow.com', rating: 4, status: 'New', category: 'Software' },
                    { id: 2, company: 'Bright Spark Inc', name: 'Sarah Jones', phone: '+1 555-0102', website: 'brightspark.io', rating: 5, status: 'Contacted', category: 'Marketing' },
                    { id: 3, company: 'Global Logistics', name: 'Mike Brown', phone: '+1 555-0103', website: 'globallogistics.com', rating: 3, status: 'In Review', category: 'Logistics' },
                    { id: 4, company: 'Cloud Nine Systems', name: 'Emily Davis', phone: '+1 555-0104', website: 'cloudnine.com', rating: 4, status: 'Qualified', category: 'Cloud Services' },
                    { id: 5, company: 'Eco Friendly Co', name: 'David Wilson', phone: '+1 555-0105', website: 'ecofriendly.co', rating: 2, status: 'New', category: 'Retail' },
                    { id: 6, company: 'Swift Delivery', name: 'Lisa Ray', phone: '+1 555-0106', website: 'swiftdelay.com', rating: 4, status: 'Contacted', category: 'Logistics' },
                ]);
            }

            setLoading(false);
        };
        fetchData();
    }, [adminToken]);

    const handleDeleteConfirm = async () => {
        const lead = deleteModal.lead;
        if (!lead?.result_id) return;
        setDeletingId(lead.result_id);
        setDeleteModal({ open: false, lead: null });
        try {
            const res = await Api.deleteLead(lead.result_id, adminToken);
            if (res !== null) {
                setLeads(prev => prev.filter(l => l.result_id !== lead.result_id));
            }
        } finally {
            setDeletingId(null);
        }
    };

    const handleViewLead = async (lead) => {
        const resultId = lead.result_id;
        if (!resultId) return;
        setViewingId(lead.id);
        try {
            const data = await Api.getSingleLead(resultId, adminToken);
            if (data?.data) {
                navigate('/lead-details', {
                    state: {
                        singleLead: data.data,
                    },
                });
            }
        } finally {
            setViewingId(null);
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLeads = leads.slice(startIndex, startIndex + itemsPerPage);

    if (loading) return <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-xl"></div>)}
        </div>
        <div className="h-96 bg-white rounded-xl"></div>
    </div>;

    return (
        <>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your lead pipeline and sales performance.</p>
                </div>
                <Button
                    className="shrink-0 flex items-center gap-2"
                    onClick={() => navigate('/lead-generator')}
                >
                    <Plus size={18} />
                    Add New Lead
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Leads" value={stats.totalLeads} trend="+12.5%" trendUp={true} icon={Users} />
                <StatCard title="Active Campaigns" value={stats.activeCampaigns} trend="+2 new" trendUp={true} icon={Briefcase} />
                <StatCard title="Conversion Rate" value={stats.conversionRate} trend="+0.8%" trendUp={true} icon={TrendingUp} />
                <StatCard title="Revenue Pipeline" value={stats.revenuePipeline} trend="+15.3%" trendUp={true} icon={DollarSign} />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card title="Lead Growth" subtitle="Daily lead acquisition trends" className="lg:col-span-2">
                    <div className="h-80 w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lineData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="leads"
                                    stroke="#8884d8"
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Lead Status" subtitle="Leads distribution by status">
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <Card
                    title="Recent Leads"
                    subtitle="Last entries in the database"
                    className="w-full"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    <th className="pb-4">Business Name</th>
                                    <th className="pb-4">Contact Info</th>
                                    <th className="pb-4">Website</th>
                                    <th className="pb-4">Rating</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentLeads.map((lead) => (
                                    <tr key={lead.id} className="group hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors">
                                        <td className="py-4">
                                            <span className="font-bold text-gray-900">{lead.company}</span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900 text-sm">{lead.name !== 'N/A' ? lead.name : '—'}</span>
                                                <span className="text-xs text-gray-400">{lead.phone}</span>
                                                {lead.category && <span className="text-xs text-gray-300 italic">{lead.category}</span>}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            {lead.website ? (
                                                <a
                                                    href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                                >
                                                    {lead.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                                    <ExternalLink size={12} />
                                                </a>
                                            ) : <span className="text-gray-300 text-sm">—</span>}
                                        </td>
                                        <td className="py-4">
                                            <StarRating rating={lead.rating} />
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                lead.status === 'New' ? 'bg-blue-100 text-blue-600' :
                                                lead.status === 'Contacted' ? 'bg-orange-100 text-orange-600' :
                                                lead.status === 'In Review' ? 'bg-purple-100 text-purple-600' :
                                                lead.status === 'completed' ? 'bg-green-100 text-green-600' :
                                                lead.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                                lead.status === 'failed' ? 'bg-red-100 text-red-600' :
                                                'bg-green-100 text-green-600'
                                            }`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="text-gray-400 hover:text-primary p-1.5 hover:bg-primary/5 rounded-lg transition-all disabled:opacity-50"
                                                    title="View details"
                                                    disabled={viewingId === lead.id}
                                                    onClick={() => handleViewLead(lead)}
                                                >
                                                    {viewingId === lead.id
                                                        ? <Loader2 size={18} className="animate-spin" />
                                                        : <Eye size={18} />}
                                                </button>
                                                <button
                                                    className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                                    title="Delete lead"
                                                    disabled={deletingId === lead.result_id}
                                                    onClick={() => setDeleteModal({ open: true, lead })}
                                                >
                                                    {deletingId === lead.result_id
                                                        ? <Loader2 size={18} className="animate-spin" />
                                                        : <Trash2 size={18} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalItems={leads.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </Card>
            </div>
        </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setDeleteModal({ open: false, lead: null })}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto">
                            <Trash2 size={22} className="text-red-500" />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-lg font-bold text-gray-900">Delete Lead?</h3>
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete{' '}
                                <span className="font-semibold text-gray-700">{deleteModal.lead?.company}</span>?
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                onClick={() => setDeleteModal({ open: false, lead: null })}
                            >
                                Cancel
                            </button>
                            <button
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
                                onClick={handleDeleteConfirm}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Dashboard;
