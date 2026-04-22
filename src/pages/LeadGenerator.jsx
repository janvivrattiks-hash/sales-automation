import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Api from '../../scripts/Api';
import { AppContext } from '../context/AppContext';

// Modular Components
import LeadGenForm from '../components/leadGenerator/LeadGenForm';
import RecentActivitiesTable from '../components/leadGenerator/RecentActivitiesTable';
import DeleteSearchModal from '../components/leadGenerator/DeleteSearchModal';

const LeadGenerator = () => {
    const navigate = useNavigate();
    const { adminToken, setLeads } = useContext(AppContext);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [formData, setFormData] = useState({
        niche: '',
        city: '',
        area: '',
        count: ''
    });

    const [activities, setActivities] = useState([]);
    const [activitiesLoading, setActivitiesLoading] = useState(true);
    const [viewingKeyword, setViewingKeyword] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ open: false, job: null });
    const [deletingJobId, setDeletingJobId] = useState(null);

    // ── Fetch recent activities ───────────────────────────────────────────────
    useEffect(() => {
        const fetchActivities = async () => {
            setActivitiesLoading(true);
            const data = await Api.getRecent(adminToken);
            if (data) {
                const list = Array.isArray(data) ? data : (data.data ?? []);
                setActivities(list);
            }
            setActivitiesLoading(false);
        };
        fetchActivities();
    }, [adminToken]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerateLeads = async (e) => {
        e.preventDefault();
        const apiData = {
            location: formData.city,
            niche: formData.niche,
            limit: parseInt(formData.count) || 10
        };

        setLoading(true);
        const response_data = await Api.addLead(apiData, adminToken);
        console.log("🚩 [LeadGenerator] addLead response:", response_data);

        if (response_data) {
            const results = response_data.results || [];
            const jobId = response_data.job_id;
            
            setLeads(results);
            const queryInfo = {
                niche: formData.niche,
                city: formData.city,
                area: formData.area,
                count: formData.count,
                job_id: jobId,
            };
            setFormData({ niche: '', city: '', area: '', count: '' });
            navigate('/lead-details', { state: { results, queryInfo } });
        } else {
            setError('Failed to generate lead');
            setLoading(false);
        }
    };

    const handleViewActivity = (activity) => {
        setViewingKeyword(activity.job_id);
        navigate('/lead-details', {
            state: {
                results: activity.results ?? [],
                queryInfo: {
                    niche: activity.search_details?.niche_or_keyword ?? activity.query_name ?? '',
                    city: activity.search_details?.location ?? '',
                    area: activity.search_details?.area ?? 'NA',
                    job_id: activity.job_id,
                },
            },
        });
        setTimeout(() => setViewingKeyword(null), 500);
    };

    const handleDeleteConfirm = async () => {
        const job = deleteModal.job;
        if (!job?.job_id) return;
        setDeletingJobId(job.job_id);
        setDeleteModal({ open: false, job: null });
        try {
            const res = await Api.deleteJob(job.job_id, adminToken);
            if (res !== null) {
                setActivities(prev => prev.filter(j => j.job_id !== job.job_id));
            }
        } finally {
            setDeletingJobId(null);
        }
    };

    // ── Pagination ────────────────────────────────────────────────────────────
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentActivities = activities.slice(startIndex, startIndex + itemsPerPage);

    return (
        <>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Generate New Leads</h1>
                    <p className="text-gray-500 text-sm mt-1">Find your ideal customers by business category and location.</p>
                </div>

                <LeadGenForm
                    formData={formData}
                    onInputChange={handleInputChange}
                    onSubmit={handleGenerateLeads}
                    loading={loading}
                    error={error}
                />

                <RecentActivitiesTable
                    activities={activities}
                    currentActivities={currentActivities}
                    activitiesLoading={activitiesLoading}
                    viewingKeyword={viewingKeyword}
                    deletingJobId={deletingJobId}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onViewActivity={handleViewActivity}
                    onDeleteClick={(activity) => setDeleteModal({ open: true, job: activity })}
                    navigate={navigate}
                />
            </div>

            {deleteModal.open && (
                <DeleteSearchModal
                    job={deleteModal.job}
                    onCancel={() => setDeleteModal({ open: false, job: null })}
                    onConfirm={handleDeleteConfirm}
                />
            )}
        </>
    );
};

export default LeadGenerator;