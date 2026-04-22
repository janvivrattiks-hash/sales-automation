import React from 'react';
import { Search, Eye, Trash2, Loader2 } from 'lucide-react';
import Card from '../ui/Card';
import Pagination from '../ui/Pagination';

const RecentActivitiesTable = ({
    activities,
    currentActivities,
    activitiesLoading,
    viewingKeyword,
    deletingJobId,
    currentPage,
    itemsPerPage,
    onPageChange,
    onViewActivity,
    onDeleteClick,
    navigate,
}) => {
    return (
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
                                    // Remove " – X leads" suffix from query name since it's already shown in LEADS column
                                    const rawQueryName = activity.query_name ?? 'N/A';
                                    const queryName = rawQueryName.replace(/\s*[-–—]\s*\d+\s+leads?$/i, '');
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
                                                    onClick={() => onViewActivity(activity)}
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
                                                        onClick={() => onViewActivity(activity)}
                                                    >
                                                        {viewingKeyword === activity.job_id
                                                            ? <Loader2 size={20} className="animate-spin" />
                                                            : <Eye size={20} />}
                                                    </button>
                                                    <button
                                                        className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                                        title="Delete search"
                                                        disabled={deletingJobId === activity.job_id}
                                                        onClick={() => onDeleteClick(activity)}
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
                        onPageChange={onPageChange}
                    />
                )}
            </Card>
        </div>
    );
};

export default RecentActivitiesTable;
