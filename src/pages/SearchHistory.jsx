import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    Plus,
    Eye,
    Trash2,
    ChevronLeft,
    Search,
    EyeOff
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Pagination from '../components/ui/Pagination';

const SearchHistory = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const queries = [
        {
            id: 1,
            name: 'SaaS CEOs in Austin',
            filters: ['50-200 employees', 'Tech'],
            date: 'Oct 24, 2023',
            results: '1,240 Leads',
            status: 'ready'
        },
        {
            id: 2,
            name: 'Real Estate Agents - NY',
            filters: ['Luxury', '>5 Yrs Exp'],
            date: 'Oct 22, 2023',
            results: '850 Leads',
            status: 'ready'
        },
        {
            id: 3,
            name: 'Fintech Founders',
            filters: ['Seed Stage', 'Remote'],
            date: 'Oct 18, 2023',
            results: 'Calculating...',
            status: 'calculating'
        },
        {
            id: 4,
            name: 'Director of Sales - CA',
            filters: ['Enterprise', 'Manufact.'],
            date: 'Oct 15, 2023',
            results: '2,105 Leads',
            status: 'ready'
        },
    ];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentQueries = queries.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-10">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                <button onClick={() => navigate('/lead-generator')} className="hover:text-primary transition-colors">Leads</button>
                <ChevronRight size={10} />
                <span className="text-gray-900">Saved Searches</span>
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
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] md:min-w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                                <th className="px-8 py-5">Query Name</th>
                                <th className="px-8 py-5">Date Created</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {currentQueries.map((query) => (
                                <tr key={query.id} className="group hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors">
                                    <td className="px-8 py-7">
                                        <span className="font-bold text-gray-900 text-base">{query.name}</span>
                                    </td>
                                    <td className="px-8 py-7">
                                        <span className="text-sm font-semibold text-gray-500">{query.date}</span>
                                    </td>
                                    <td className="px-8 py-7 text-right">
                                        <div className="flex items-center justify-end gap-5">
                                            {query.status === 'calculating' ? (
                                                <button className="text-gray-300 cursor-not-allowed">
                                                    <EyeOff size={20} />
                                                </button>
                                            ) : (
                                                <button
                                                    className="text-gray-400 hover:text-primary transition-all hover:scale-110 active:scale-95"
                                                    onClick={() => navigate('/lead-details')}
                                                >
                                                    <Eye size={20} />
                                                </button>
                                            )}
                                            <button className="text-gray-400 hover:text-red-500 transition-all hover:scale-110 active:scale-95">
                                                <Trash2 size={20} />
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
                    totalItems={queries.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </Card>
        </div>
    );
};

export default SearchHistory;
