import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Target, TrendingUp, Briefcase, DollarSign, ExternalLink, Plus, Eye, Trash2 } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import StatCard from '../components/ui/StatCard';

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

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchData = async () => {
            // Mock data for initial display
            const statsData = {
                totalLeads: '5,234',
                activeCampaigns: '12',
                conversionRate: '4.8%',
                revenuePipeline: '$1.2M'
            };
            const leadsData = [
                { id: 1, company: 'TechFlow Solutions', name: 'John Smith', email: 'john@techflow.com', website: 'techflow.com', rating: 4, status: 'New' },
                { id: 2, company: 'Bright Spark Inc', name: 'Sarah Jones', email: 'sarah@brightspark.io', website: 'brightspark.io', rating: 5, status: 'Contacted' },
                { id: 3, company: 'Global Logistics', name: 'Mike Brown', email: 'mike@globallog.com', website: 'globallogistics.com', rating: 3, status: 'In Review' },
                { id: 4, company: 'Cloud Nine Systems', name: 'Emily Davis', email: 'emily@cloudnine.com', website: 'cloudnine.com', rating: 4, status: 'Qualified' },
                { id: 5, company: 'Eco Friendly Co', name: 'David Wilson', email: 'david@ecofriendly.co', website: 'ecofriendly.co', rating: 2, status: 'New' },
                { id: 6, company: 'Swift Delivery', name: 'Lisa Ray', email: 'lisa@swiftdelay.com', website: 'swiftdelay.com', rating: 4, status: 'Contacted' },
            ];

            setStats(statsData);
            setLeads(leadsData);
            setLoading(false);
        };
        fetchData();
    }, []);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLeads = leads.slice(startIndex, startIndex + itemsPerPage);

    if (loading) return <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-xl"></div>)}
        </div>
        <div className="h-96 bg-white rounded-xl"></div>
    </div>;

    return (
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
                                                <span className="font-medium text-gray-900 text-sm">{lead.name}</span>
                                                <span className="text-xs text-gray-400">{lead.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <a href={`https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                                {lead.website} <ExternalLink size={12} />
                                            </a>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-0.5">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={`text-sm ${i < lead.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${lead.status === 'New' ? 'bg-blue-100 text-blue-600' :
                                                lead.status === 'Contacted' ? 'bg-orange-100 text-orange-600' :
                                                    lead.status === 'In Review' ? 'bg-purple-100 text-purple-600' :
                                                        'bg-green-100 text-green-600'
                                                }`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="text-gray-400 hover:text-primary p-1.5 hover:bg-primary/5 rounded-lg transition-all"
                                                    title="View details"
                                                    onClick={() => navigate('/lead-details')}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all" title="Delete lead">
                                                    <Trash2 size={18} />
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
    );
};

export default Dashboard;
