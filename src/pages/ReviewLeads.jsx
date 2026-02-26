import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    Search,
    Filter,
    Download,
    Eye,
    Trash2,
    Star,
    ChevronLeft,
    Users,
    MoreHorizontal
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Pagination from '../components/ui/Pagination';

const ReviewLeads = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const leads = [
        {
            id: 1,
            initials: 'T',
            initialsColor: 'bg-blue-50 text-blue-500',
            name: 'TechFlow Solutions',
            location: 'San Francisco, CA',
            mobile: '+1 (555) 123-4567',
            email: 'contact@techflow.com',
            rating: 5,
            status: 'Validated',
            statusColor: 'bg-green-50 text-green-500'
        },
        {
            id: 2,
            initials: 'A',
            initialsColor: 'bg-purple-50 text-purple-500',
            name: 'Apex Innovations',
            location: 'Austin, TX',
            mobile: '+1 (555) 987-6543',
            email: 'sales@apex.io',
            rating: 4,
            status: 'Validated',
            statusColor: 'bg-green-50 text-green-500'
        },
        {
            id: 3,
            initials: 'S',
            initialsColor: 'bg-orange-50 text-orange-500',
            name: 'Summit Group',
            location: 'Denver, CO',
            mobile: '+1 (555) 456-7890',
            email: 'hello@summit.net',
            rating: 3,
            status: 'Pending',
            statusColor: 'bg-yellow-50 text-yellow-500'
        },
        {
            id: 4,
            initials: 'Q',
            initialsColor: 'bg-cyan-50 text-cyan-500',
            name: 'Quantum Dynamics',
            location: 'New York, NY',
            mobile: '+1 (555) 234-5678',
            email: 'info@quantum.org',
            rating: 5,
            status: 'Validated',
            statusColor: 'bg-green-50 text-green-500'
        },
        {
            id: 5,
            initials: 'N',
            initialsColor: 'bg-pink-50 text-pink-500',
            name: 'Nebula Systems',
            location: 'Seattle, WA',
            mobile: '+1 (555) 876-5432',
            email: 'support@nebula.co',
            rating: 2,
            status: 'Pending',
            statusColor: 'bg-yellow-50 text-yellow-500'
        }
    ];

    const RatingStars = ({ count }) => {
        return (
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={14}
                        className={i < count ? "fill-orange-400 text-orange-400" : "text-gray-200"}
                    />
                ))}
            </div>
        );
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLeads = leads.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-10">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                <span className="cursor-pointer hover:text-gray-600">Lead Generator</span>
                <ChevronRight size={10} />
                <span className="text-gray-900">Review</span>
            </div>

            {/* Header section with Stats Card */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Review Leads</h1>
                    <p className="text-gray-500 text-sm mt-1">Select and verify contacts before proceeding to enrichment.</p>
                </div>

                {/* Stats Card Styled as per screenshot */}
                <div className="bg-white px-6 py-4 rounded-xl border border-gray-100 flex items-center gap-4 shadow-sm min-w-[200px]">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider leading-none">Total Leads</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">100</p>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <Card noPadding className="overflow-hidden border-none shadow-xl shadow-black/[0.02]">
                {/* Search and Filters Bar */}
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by business name, email..."
                            className="w-full pl-12 pr-4 py-2.5 bg-gray-50/50 border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-white">
                            <Filter size={16} /> Filter
                        </Button>
                        <Button variant="outline" size="sm" className="bg-white">
                            <Download size={16} /> Export
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                                <th className="px-8 py-5 w-10">
                                    <input type="checkbox" className="rounded text-primary border-gray-200 focus:ring-primary" />
                                </th>
                                <th className="px-8 py-5">BUSINESS NAME</th>
                                <th className="px-8 py-5">MOBILE</th>
                                <th className="px-8 py-5">EMAIL</th>
                                <th className="px-8 py-5">RATING</th>
                                <th className="px-8 py-5">STATUS</th>
                                <th className="px-8 py-5 text-right">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {currentLeads.map((lead) => (
                                <tr key={lead.id} className="group hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors">
                                    <td className="px-8 py-6">
                                        <input type="checkbox" className="rounded text-primary border-gray-200 focus:ring-primary" />
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${lead.initialsColor}`}>
                                                {lead.initials}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm leading-tight">{lead.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{lead.location}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-gray-500">
                                        {lead.mobile}
                                    </td>
                                    <td className="px-8 py-6 text-sm font-medium text-gray-500">
                                        {lead.email}
                                    </td>
                                    <td className="px-8 py-6">
                                        <RatingStars count={lead.rating} />
                                    </td>
                                    <td className="px-8 py-6 text-sm">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tight ${lead.statusColor}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-3 text-gray-300">
                                            <button
                                                className="p-2 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg active:scale-90"
                                                onClick={() => navigate('/lead-details')}
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button className="p-2 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg active:scale-90">
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

            {/* Next Step Button */}
            <div className="flex justify-end">
                <Button
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-blue-200 transition-all active:scale-95"
                    onClick={() => navigate('/final-leads')}
                >
                    Next
                    <ChevronRight size={18} />
                </Button>
            </div>
        </div>
    );
};

export default ReviewLeads;
