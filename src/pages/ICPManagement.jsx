import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Target,
    Plus,
    Users,
    Search,
    Eye,
    ChevronRight,
    Monitor,
    Loader2
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import Api from '../../scripts/Api';

const ICPManagement = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [icps, setIcps] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const itemsPerPage = 8;

    useEffect(() => {
        const fetchICPs = async () => {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                navigate('/');
                return;
            }

            try {
                setIsLoading(true);
                const data = await Api.getIcps(token);
                if (data) {
                    setIcps(Array.isArray(data) ? data : (data.results || data.data || []));
                }
            } catch (error) {
                console.error("Error fetching ICPs:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchICPs();
    }, [navigate]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentIcps = icps.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-10">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                <span className="text-gray-400">Management</span>
                <ChevronRight size={10} />
                <span className="text-primary">All ICPs</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Ideal Customer Profiles</h1>
                    <p className="text-gray-500 text-sm mt-1">Define and manage your high-intent audience segments.</p>
                </div>
                <Button
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-blue-200 transition-all active:scale-95"
                    onClick={() => navigate('/create-icp')}
                >
                    <Plus size={18} />
                    Create New ICP
                </Button>
            </div>

            {/* ICP Table */}
            <Card noPadding className="overflow-hidden border-none shadow-xl shadow-black/[0.02]">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 bg-gray-50/30">
                                <th className="px-8 py-5">ICP Name</th>
                                <th className="px-8 py-5 text-center">Total Leads</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="3" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={32} className="animate-spin text-primary" />
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Profiles...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentIcps.length > 0 ? (
                                currentIcps.map((icp, index) => (
                                    <tr key={icp.id || index} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-500 transition-transform group-hover:scale-110 duration-300">
                                                    <Monitor size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-extrabold text-gray-900 text-base">{icp.icp_name || 'Unnamed Profile'}</h4>
                                                    <p className="text-xs font-bold text-gray-400">{icp.target_business_type || 'General Targeting'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-lg font-black text-gray-900">{icp.total_leads || 0}</span>
                                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full mt-1 bg-gray-100 text-gray-500 uppercase">
                                                    STABLE
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/icp-details/${icp.id}`)}
                                                    className="p-2.5 text-gray-400 hover:text-primary hover:bg-white rounded-xl border border-transparent hover:border-gray-100 hover:shadow-lg transition-all"
                                                    title="View Profile"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                <Target size={32} className="text-gray-200" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-gray-900">No Profiles Found</p>
                                                <p className="text-xs text-gray-500">Create your first Ideal Customer Profile to get started.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {icps.length > 0 && (
                    <div className="px-8 py-6 border-t border-gray-50 bg-gray-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Showing <span className="text-gray-900">{startIndex + 1} to {Math.min(startIndex + itemsPerPage, icps.length)}</span> of <span className="text-gray-900">{icps.length} profiles</span>
                        </p>
                        <Pagination
                            currentPage={currentPage}
                            totalItems={icps.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ICPManagement;

