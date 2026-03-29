import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import { useApp } from '../context/AppContext';
import Api from '../../scripts/Api';

// Dashboard Modules
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import RecentLeadsTable from '../components/dashboard/RecentLeadsTable';
import DeleteLeadModal from '../components/dashboard/DeleteLeadModal';

// Loading skeleton
const DashboardSkeleton = () => (
    <div className="animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-xl" />)}
        </div>
        <div className="h-96 bg-white rounded-xl" />
    </div>
);

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
            if (!adminToken) return;
            setLoading(true);
            try {
                // 1. Fetch recent activity for the table
                const recentData = await Api.getRecent(adminToken);
                let mappedLeads = [];
                if (recentData && recentData.length > 0) {
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
                }
                setLeads(mappedLeads);

                // 2. Fetch all enriched leads for Conversion Rate calculation
                const enrichmentData = await Api.getEnrichment(adminToken);
                const enrichedLeads = Array.isArray(enrichmentData)
                    ? enrichmentData
                    : (enrichmentData?.data || enrichmentData?.results || []);

                // 3. Fetch all audiences for Active Campaigns
                const audienceData = await Api.getAudiences(adminToken);
                const audiences = Array.isArray(audienceData) ? audienceData : (audienceData?.data || []);

                // Calculate Stats
                const totalLeadsCount = mappedLeads.length;
                const enrichedCount = enrichedLeads.length;
                const activeCampaignsCount = audiences.length;
                const convRate = totalLeadsCount > 0
                    ? ((enrichedCount / totalLeadsCount) * 100).toFixed(1)
                    : '0.0';
                const revenue = (enrichedCount * 500).toLocaleString();

                setStats({
                    totalLeads: totalLeadsCount.toLocaleString(),
                    activeCampaigns: activeCampaignsCount.toString(),
                    conversionRate: `${convRate}%`,
                    revenuePipeline: `$${revenue}`
                });
            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
                setStats({
                    totalLeads: '0',
                    activeCampaigns: '0',
                    conversionRate: '0%',
                    revenuePipeline: '$0'
                });
            } finally {
                setLoading(false);
            }
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
                navigate('/lead-details', { state: { singleLead: data.data } });
            }
        } finally {
            setViewingId(null);
        }
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLeads = leads.slice(startIndex, startIndex + itemsPerPage);

    if (loading) return <DashboardSkeleton />;

    return (
        <>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-8">
                <DashboardHeader navigate={navigate} />

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Leads" value={stats.totalLeads} trend="+12.5%" trendUp={true} icon={Users} />
                    {/* Additional stats can be uncommented/added here:
                    <StatCard title="Active Campaigns" value={stats.activeCampaigns} icon={Briefcase} trend="+2 new" trendUp />
                    <StatCard title="Conversion Rate" value={stats.conversionRate} icon={TrendingUp} trend="+0.8%" trendUp />
                    <StatCard title="Revenue Pipeline" value={stats.revenuePipeline} icon={DollarSign} trend="+15.3%" trendUp />
                    */}
                </div>

                <DashboardCharts />

                <RecentLeadsTable
                    currentLeads={currentLeads}
                    leads={leads}
                    viewingId={viewingId}
                    deletingId={deletingId}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onViewLead={handleViewLead}
                    onDeleteClick={(lead) => setDeleteModal({ open: true, lead })}
                    onPageChange={setCurrentPage}
                />
            </div>

            {deleteModal.open && (
                <DeleteLeadModal
                    lead={deleteModal.lead}
                    onCancel={() => setDeleteModal({ open: false, lead: null })}
                    onConfirm={handleDeleteConfirm}
                />
            )}
        </>
    );
};

export default Dashboard;
