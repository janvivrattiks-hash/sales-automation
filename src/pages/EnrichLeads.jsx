import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    Filter,
    Download,
    Eye,
    Trash2,
    Star,
    ChevronLeft,
    Search,
    ChevronRight as ChevronRightIcon,
    ArrowRight,
    Plus,
    X
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';

const EnrichLeads = () => {
    const navigate = useNavigate();
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        parameter: '',
        minRating: 0,
        websiteAvailable: 'Any'
    });
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const leads = [
        {
            id: 1,
            initials: 'TS',
            initialsColor: 'bg-blue-50 text-blue-500',
            name: 'TechFlow Solutions',
            location: 'San Francisco, CA',
            mobile: '+1 (555) 123-4567',
            email: 'contact@techflow.com',
            rating: 4,
            status: 'Enriched',
            statusColor: 'bg-green-50 text-green-500'
        },
        {
            id: 2,
            initials: 'NR',
            initialsColor: 'bg-purple-50 text-purple-500',
            name: 'Nexus Retail',
            location: 'Austin, TX',
            mobile: '+1 (555) 987-6543',
            email: 'info@nexus.com',
            rating: 3,
            status: 'Pending',
            statusColor: 'bg-orange-50 text-orange-500'
        },
        {
            id: 3,
            initials: 'AI',
            initialsColor: 'bg-cyan-50 text-cyan-500',
            name: 'Apex Innovations',
            location: 'New York, NY',
            mobile: '+1 (555) 456-7890',
            email: 'sales@apex.com',
            rating: 5,
            status: 'Enriched',
            statusColor: 'bg-green-50 text-green-500'
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

    const toggleSelectLead = (id) => {
        setSelectedLeads(prev =>
            prev.includes(id) ? prev.filter(leadId => leadId !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const currentIds = currentLeads.map(l => l.id);
        const allSelected = currentIds.every(id => selectedLeads.includes(id));

        if (allSelected) {
            setSelectedLeads(prev => prev.filter(id => !currentIds.includes(id)));
        } else {
            setSelectedLeads(prev => [...new Set([...prev, ...currentIds])]);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-10">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                <span>LEAD GENERATION</span>
                <ChevronRight size={10} />
                <span className="text-gray-900">ENRICH</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Enrich Leads</h1>
                    <p className="text-gray-500 text-sm mt-1">Review and verify lead data before exporting to CRM.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsFilterModalOpen(true)}>
                        <Filter size={18} /> Filter
                    </Button>
                    <Button variant="outline">
                        <Download size={18} /> Export
                    </Button>
                </div>
            </div>

            {/* Filter Modal */}
            <Modal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                title="Filter Leads"
                footer={
                    <div className="flex items-center justify-end w-full gap-4">
                        <button
                            onClick={() => setIsFilterModalOpen(false)}
                            className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <Button
                            onClick={() => navigate('/review-leads')}
                            className="px-8 flex items-center gap-2"
                        >
                            Next <ArrowRight size={18} />
                        </Button>
                    </div>
                }
            >
                <div className="space-y-8">
                    {/* Website Available */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-900">Website Available</label>
                        <div className="flex p-1 bg-gray-100 rounded-xl">
                            {['Yes', 'No', 'Any'].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setFilters({ ...filters, websiteAvailable: option })}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${filters.websiteAvailable === option
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Min Google Rating */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-gray-900">Min. Google Rating</label>
                            <span className="bg-primary/5 text-primary text-xs font-black px-2.5 py-1 rounded-lg border border-primary/10">
                                {filters.minRating}
                            </span>
                        </div>
                        <div className="relative pt-2">
                            <input
                                type="range"
                                min="0"
                                max="5"
                                step="0.1"
                                value={filters.minRating}
                                onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                                style={{
                                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(filters.minRating / 5) * 100}%, #f3f4f6 ${(filters.minRating / 5) * 100}%, #f3f4f6 100%)`
                                }}
                            />
                            <div className="flex justify-between mt-4">
                                {[0, 1, 2, 3, 4, 5].map((val) => (
                                    <span key={val} className="text-[10px] font-bold text-gray-400">{val}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Additional Parameters */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-900">Additional Parameters</label>
                        <div className="relative">
                            <select
                                className="w-full pl-4 pr-10 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium text-gray-500 appearance-none focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer transition-all"
                                value={filters.parameter}
                                onChange={(e) => setFilters({ ...filters, parameter: e.target.value })}
                            >
                                <option value="" disabled>Select parameter (e.g., Industry, Size)</option>
                                <option value="industry">Industry</option>
                                <option value="size">Company Size</option>
                                <option value="revenue">Annual Revenue</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ChevronRightIcon size={18} className="rotate-90" />
                            </div>
                        </div>
                    </div>

                    {/* Add More */}
                    <button className="flex items-center gap-2 text-primary text-sm font-bold hover:opacity-80 transition-opacity">
                        <Plus size={18} /> Add More
                    </button>
                </div>
            </Modal>

            {/* Leads Table */}
            <Card noPadding className="overflow-hidden border-none shadow-xl shadow-black/[0.02]">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] md:min-w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                                <th className="px-8 py-5 w-10">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                                            checked={currentLeads.length > 0 && currentLeads.every(l => selectedLeads.includes(l.id))}
                                            onChange={toggleSelectAll}
                                        />
                                    </div>
                                </th>
                                <th className="px-4 py-5">BUSINESS NAME</th>
                                <th className="px-8 py-5">CONTACT MOBILE</th>
                                <th className="px-8 py-5">EMAIL</th>
                                <th className="px-8 py-5">RATING</th>
                                <th className="px-8 py-5">STATUS</th>
                                <th className="px-8 py-5 text-right">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {currentLeads.map((lead) => (
                                <tr key={lead.id} className={`group hover:bg-primary/[0.02] transition-colors ${selectedLeads.includes(lead.id) ? 'bg-primary/[0.02]' : 'even:bg-gray-100/40'}`}>
                                    <td className="px-8 py-6 w-10">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                                                checked={selectedLeads.includes(lead.id)}
                                                onChange={() => toggleSelectLead(lead.id)}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${lead.initialsColor}`}>
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

            <div className="flex justify-end">
                <Button
                    className="px-10 shadow-2xl shadow-primary/30 text-lg"
                    onClick={() => navigate('/review-leads')}
                >
                    Next
                    <ChevronRight size={18} strokeWidth={3} />
                </Button>
            </div>
        </div>
    );
};

export default EnrichLeads;
