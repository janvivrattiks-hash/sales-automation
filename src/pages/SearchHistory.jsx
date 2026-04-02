import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    Plus,
    Eye,
    Trash2,
    ChevronLeft,
    Search,
    EyeOff,
    Loader2
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Pagination from '../components/ui/Pagination';
import Api from '../../scripts/Api';
import { AppContext } from '../context/AppContext';

const SearchHistory = () => {
    const navigate = useNavigate();
    const { adminToken } = useContext(AppContext);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingJobId, setViewingJobId] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ open: false, job: null });
    const [deletingJobId, setDeletingJobId] = useState(null);

    useEffect(() => { // fetch recent searches
        const fetchActivities = async () => { // fetch recent searches
            setLoading(true); // show loading
            const data = await Api.getRecent(adminToken); // get recent searches
            if (data) { // if data is not null
                const list = Array.isArray(data) ? data : (data.data ?? []); // get list of recent searches
                setActivities(list); // set activities
            }
            setLoading(false); // hide loading
        };
        fetchActivities(); // call fetch activities
    }, [adminToken]); // run when adminToken changes

    const handleDeleteConfirm = async () => { // handle delete confirmation
        const job = deleteModal.job; // get job from delete modal
        if (!job?.job_id) return; // if job id is null, return
        setDeletingJobId(job.job_id); // set deleting job id
        setDeleteModal({ open: false, job: null }); // close delete modal
        try {
            const res = await Api.deleteJob(job.job_id, adminToken); // delete job
            if (res !== null) { // if response is not null
                setActivities(prev => prev.filter(j => j.job_id !== job.job_id)); // remove job from activities
                console.log("Search history deleted successfully"); // show success message
            }
        } catch (error) { // catch error
            console.error("Error deleting job", error); // log error
        } finally { // finally block
            setDeletingJobId(null); // hide loading
        }
    };

    const handleViewLeads = (activity) => { // handle view leads
        setViewingJobId(activity.job_id); // set viewing job id
        navigate('/lead-details', { // navigate to lead details
            state: { // pass state to lead details
                results: activity.results ?? [], // get results
                queryInfo: { // get query info
                    niche: activity.search_details?.niche_or_keyword ?? activity.query_name ?? '', // get niche or keyword
                    city: activity.search_details?.location ?? '', // get location
                    area: activity.search_details?.area ?? 'NA', // get area
                    job_id: activity.job_id, // pass job id for deletion
                },
            },
        });
        setTimeout(() => setViewingJobId(null), 500);
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentActivities = activities.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-10">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                <button onClick={() => navigate('/lead-generator')} className="hover:text-primary transition-colors">Leads</button>
                <ChevronRight size={10} />
                <span className="text-gray-900">Search History</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Search History & Queries</h1>
                    <p className="text-gray-500 text-sm mt-1">Review and manage your automated lead generation criteria.</p>
                </div>
                <Button
                    className="shrink-0 flex items-center gap-2 shadow-lg shadow-primary/20"
                    onClick={() => navigate('/lead-generator')}
                >
                    <Plus size={18} />
                    New Search
                </Button>
            </div>

            {/* Queries Table */}
            <Card noPadding className="overflow-hidden border-none shadow-xl shadow-black/[0.03]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                        <Loader2 size={32} className="animate-spin mb-4 text-primary" />
                        <span className="text-sm font-medium">Loading search history...</span>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400 space-y-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                            <Search size={32} className="text-gray-200" />
                        </div>
                        <p className="text-sm font-medium">No search history found</p>
                        <Button
                            variant="outline"
                            className="mt-2"
                            onClick={() => navigate('/lead-generator')}
                        >
                            Generate your first lead
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px] md:min-w-full">
                                <thead>
                                    <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                                        <th className="px-8 py-5">Query Name</th>
                                        <th className="px-8 py-5">Leads Found</th>
                                        <th className="px-8 py-5">Date Created</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {currentActivities.map((activity, idx) => {
                                        const queryName = activity.query_name ?? 'N/A';
                                        const leadsCount = activity.search_details?.total_leads ?? activity.results?.length ?? 0;
                                        const rawDate = activity.search_details?.created_at ?? activity.created_at ?? null;
                                        const displayDate = rawDate
                                            ? new Date(rawDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                                            : '—';

                                        return (
                                            <tr key={activity.job_id ?? idx} className="group hover:bg-primary/[0.02] transition-colors">
                                                <td className="px-8 py-6">
                                                    <span
                                                        className="font-bold text-gray-900 text-base hover:text-primary transition-colors cursor-pointer"
                                                        onClick={() => handleViewLeads(activity)}
                                                    >
                                                        {queryName}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                        <span className="text-sm font-semibold text-gray-600">{leadsCount} leads</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-sm font-semibold text-gray-500">{displayDate}</span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-5">
                                                        <button
                                                            className="text-gray-400 hover:text-primary transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
                                                            title="View leads"
                                                            disabled={viewingJobId === activity.job_id}
                                                            onClick={() => handleViewLeads(activity)}
                                                        >
                                                            {viewingJobId === activity.job_id
                                                                ? <Loader2 size={20} className="animate-spin" />
                                                                : <Eye size={20} />}
                                                        </button>
                                                        <button
                                                            className="text-gray-400 hover:text-red-500 transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
                                                            title="Delete history"
                                                            disabled={deletingJobId === activity.job_id}
                                                            onClick={() => setDeleteModal({ open: true, job: activity })}
                                                        >
                                                            {deletingJobId === activity.job_id
                                                                ? <Loader2 size={20} className="animate-spin" />
                                                                : <Trash2 size={20} />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalItems={activities.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </Card>

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setDeleteModal({ open: false, job: null })}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto">
                            <Trash2 size={22} className="text-red-500" />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-lg font-bold text-gray-900">Delete History?</h3>
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete{' '}
                                <span className="font-semibold text-gray-700">{deleteModal.job?.query_name}</span>?
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                onClick={() => setDeleteModal({ open: false, job: null })}
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
        </div>
    );
};

export default SearchHistory;

