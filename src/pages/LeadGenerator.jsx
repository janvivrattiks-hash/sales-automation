import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Map, Users, Zap, Eye, Trash2, LayoutGrid, Loader2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import Api from '../../scripts/Api';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const LeadGenerator = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);  //show spinner when API run
    const [error, setError] = useState(null);   // show error message
    const [currentPage, setCurrentPage] = useState(1); // pagination

    const itemsPerPage = 5; // items per page
    const [formData, setFormData] = useState({ // store form data
        query: '',
        city: '',
        area: '',
        count: ''
    });
    const { adminToken } = useContext(AppContext); // get admin token from context
    const [activities, setActivities] = useState([]);
    const [activitiesLoading, setActivitiesLoading] = useState(true);
    const [viewingKeyword, setViewingKeyword] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ open: false, job: null });
    const [deletingJobId, setDeletingJobId] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            setActivitiesLoading(true);
            const data = await Api.getRecent(adminToken);
            if (data) {
                // Response shape: array of jobs with job_id, query_name, search_details, results
                const list = Array.isArray(data) ? data : (data.data ?? []);
                setActivities(list);
            }
            setActivitiesLoading(false);
        };
        fetchCategories();
    }, [adminToken]);

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

    const handleViewCategory = async (keyword) => {
        if (!keyword) return;
        setViewingKeyword(keyword);
        try {
            const data = await Api.getCategoryLeads(keyword, adminToken);
            if (data) {
                const results = Array.isArray(data) ? data : (data.data ?? data.results ?? []);
                navigate('/lead-details', {
                    state: {
                        results,
                        queryInfo: {
                            query: keyword,
                            city: '',
                            area: 'NA',
                        },
                    },
                });
            }
        } finally {
            setViewingKeyword(null);
        }
    };

    const handleInputChange = (e) => { // handle form input change
        const { name, value } = e.target; // get name and value from input
        setFormData((prev) => ({ ...prev, [name]: value })); // update form data
    };

    const handleGenerateLeads = async (e) => { // handle generate leads
        e.preventDefault(); // prevent default form submission
        console.log("form data", formData); // log form data

        // Transform form data to match API requirements
        const apiData = {
            location: formData.city, // API expects 'location'
            niche: formData.query,   // API expects 'niche'
            limit: parseInt(formData.count) || 10  // API expects 'limit' as number
        };
        console.log("Transformed API data", apiData); // log transformed data

        // call API to add lead
        setLoading(true); // show loading
        const response_data = await Api.addLead(apiData, adminToken);
        console.log("response data", response_data);

        if (response_data) {
            toast.success("Lead generated successfully"); // show success message
            setLeads(response_data); // Sync to context
            const queryInfo = { // store query info
                query: formData.query,
                city: formData.city,
                area: formData.area,
                count: formData.count,
            };
            setFormData({ query: '', city: '', area: '', count: '' }); // reset form data
            navigate('/lead-details', { state: { results: response_data, queryInfo } }); // redirect with data
        } else {
            setError("Failed to generate lead"); // show error message
            setLoading(false); // hide loading
        }
        //Reset form after submission
        setFormData({
            query: '',
            city: '',
            area: '',
            count: ''
        })

    };



    const startIndex = (currentPage - 1) * itemsPerPage; // pagination
    const currentActivities = activities.slice(startIndex, startIndex + itemsPerPage); // pagination


    return (
        <>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Generate New Leads</h1>
                    <p className="text-gray-500 text-sm mt-1">Find your ideal customers by business category and location.</p>
                </div>

                <Card noPadding className="p-6">
                    <form onSubmit={handleGenerateLeads}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="text-sm font-bold text-gray-700">Business Category</label>
                                <div className="relative">
                                    <LayoutGrid className="absolute left-3 bottom-4 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="query"
                                        value={formData.query}
                                        onChange={handleInputChange}
                                        placeholder="Software & IT Servi"
                                        className="w-full mt-4 pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700">City</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 bottom-4 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="e.g. San Francisco"
                                        className="w-full mt-4 pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700">Area/Locality</label>
                                <div className="relative">
                                    <Map className="absolute left-3 bottom-4 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="area"
                                        value={formData.area}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Downtown"
                                        className="w-full mt-4 pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-700">No. of Leads</label>
                                <div className="relative">
                                    <Users className="absolute left-3 bottom-4 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="count"
                                        value={formData.count}
                                        onChange={handleInputChange}
                                        placeholder="100"
                                        className="w-full mt-4 pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </form>


                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">
                            {error}
                        </div>
                    )}

                    <div className="mt-8 flex justify-end">
                        <Button
                            className="flex items-center gap-2 shadow-lg shadow-primary/20 min-w-[180px] justify-center"
                            onClick={handleGenerateLeads}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Zap size={18} fill="currentColor" />
                            )}
                            {loading ? 'Generating...' : 'Generate Leads'}

                        </Button>
                    </div>
                </Card>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
                        <button
                            className="text-sm font-bold text-primary hover:underline"
                            onClick={() => navigate('/search-history')}
                        >
                            View All Activities
                        </button>
                    </div>

                    <Card noPadding className="overflow-hidden">
                        {activitiesLoading ? (
                            <div className="flex items-center justify-center py-16 text-gray-400">
                                <Loader2 size={28} className="animate-spin mr-3" />
                                <span className="text-sm font-medium">Loading activities...</span>
                            </div>
                        ) : activities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-gray-400 space-y-2">
                                <Search size={36} className="text-gray-200" />
                                <p className="text-sm font-medium">No recent activities found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[600px] md:min-w-full">
                                    <thead>
                                        <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                            <th className="px-8 py-5">Query Name</th>
                                            <th className="px-8 py-5">Leads</th>
                                            <th className="px-8 py-5">Date</th>
                                            <th className="px-8 py-5 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {currentActivities.map((activity, idx) => {
                                            const queryName = activity.query_name ?? 'N/A';
                                            const leadsCount = activity.search_details?.total_leads ?? activity.results?.length ?? 0;
                                            const rawDate = activity.search_details?.created_at ?? activity.created_at ?? null;
                                            const displayDate = rawDate
                                                ? new Date(rawDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                                                : '—';
                                            return (
                                                <tr key={activity.job_id ?? idx} className="group hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors cursor-pointer">
                                                    <td className="px-8 py-5">
                                                        <span
                                                            className="font-bold text-gray-900 hover:text-primary transition-colors cursor-pointer hover:underline underline-offset-4"
                                                            onClick={() => {
                                                                setViewingKeyword(activity.job_id);
                                                                navigate('/lead-details', {
                                                                    state: {
                                                                        results: activity.results ?? [],
                                                                        queryInfo: {
                                                                            query: activity.search_details?.niche_or_keyword ?? activity.query_name ?? '',
                                                                            city: activity.search_details?.location ?? '',
                                                                            area: activity.search_details?.area ?? 'NA',
                                                                        },
                                                                    },
                                                                });
                                                                setTimeout(() => setViewingKeyword(null), 500);
                                                            }}
                                                        >
                                                            {queryName}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-sm font-medium text-gray-600">{leadsCount} leads</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-sm font-medium text-gray-600">{displayDate}</span>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <div className="flex items-center justify-end gap-4">
                                                            <button
                                                                className="text-gray-400 hover:text-primary transition-colors disabled:opacity-50"
                                                                title="View leads"
                                                                disabled={viewingKeyword === activity.job_id}
                                                                onClick={() => {
                                                                    setViewingKeyword(activity.job_id);
                                                                    navigate('/lead-details', {
                                                                        state: {
                                                                            results: activity.results ?? [],
                                                                            queryInfo: {
                                                                                query: activity.search_details?.niche_or_keyword ?? '',
                                                                                city: activity.search_details?.location ?? '',
                                                                                area: activity.search_details?.area ?? 'NA',
                                                                            },
                                                                        },
                                                                    });
                                                                    setTimeout(() => setViewingKeyword(null), 500);
                                                                }}
                                                            >
                                                                {viewingKeyword === activity.job_id
                                                                    ? <Loader2 size={20} className="animate-spin" />
                                                                    : <Eye size={20} />}
                                                            </button>
                                                            <button
                                                                className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                                                title="Delete search"
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
                        )}
                        {!activitiesLoading && activities.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalItems={activities.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </Card>
                </div>
            </div>

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
                            <h3 className="text-lg font-bold text-gray-900">Delete Search?</h3>
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
        </>
    );
};

export default LeadGenerator;