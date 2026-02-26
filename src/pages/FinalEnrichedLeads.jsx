import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    Search,
    Filter,
    Download,
    Star,
    ChevronLeft,
    Users,
    CheckCircle2,
    Zap,
    History,
    X,
    Plus,
    ChevronDown,
    Eye,
    Trash2
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';

const FinalEnrichedLeads = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [audienceData, setAudienceData] = useState({
        name: '',
        description: '',
        icp: '',
        tags: ['High Priority']
    });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const stats = [
        {
            label: 'Total Contact Leads',
            value: '1,248',
            change: '+12%',
            icon: Users,
            color: 'text-blue-500',
            bgColor: 'bg-blue-50'
        },
        {
            label: 'Verified Emails',
            value: '1,102',
            change: '+5%',
            icon: CheckCircle2,
            color: 'text-green-500',
            bgColor: 'bg-green-50'
        },
        {
            label: 'Enrichment Rate',
            value: '94%',
            change: '+2%',
            icon: Zap,
            color: 'text-purple-500',
            bgColor: 'bg-purple-50'
        }
    ];

    const leads = [
        {
            id: 1,
            initials: 'AC',
            initialsColor: 'bg-blue-50 text-blue-500',
            name: 'Acme Corp',
            category: 'RETAIL',
            mobile: '+1 (555) 012-3456',
            email: 'john.doe@acme.com',
            rating: 5,
            status: 'VERIFIED',
            statusColor: 'bg-green-50 text-green-500'
        },
        {
            id: 2,
            initials: 'TS',
            initialsColor: 'bg-blue-50 text-blue-500',
            name: 'TechStart Inc',
            category: 'TECHNOLOGY',
            mobile: '+1 (555) 987-6543',
            email: 'jane@techstart.io',
            rating: 5,
            status: 'ENRICHED',
            statusColor: 'bg-blue-50 text-blue-500'
        },
        {
            id: 3,
            initials: 'GS',
            initialsColor: 'bg-gray-50 text-gray-500',
            name: 'Global Solutions',
            category: 'CONSULTING',
            mobile: '+1 (555) 456-7890',
            email: 'contact@global.com',
            rating: 5,
            status: 'PENDING',
            statusColor: 'bg-gray-100 text-gray-500'
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
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">Final Enriched Leads</h1>
                    <p className="text-gray-500 text-sm mt-1">Review and export your data</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="p-4 border border-gray-100 shadow-sm bg-white rounded-[24px]">
                        <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bgColor} ${stat.color} shrink-0`}>
                                <stat.icon size={28} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold text-gray-900 leading-none">{stat.value}</p>
                                    <span className="text-[10px] font-bold text-green-500">{stat.change}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Table Container */}
            <Card noPadding className="overflow-hidden border-none shadow-sm rounded-2xl bg-white">
                {/* Table Header Controls */}
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-gray-900">Leads Preview</h2>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-white px-4 border-gray-100 text-gray-600 font-bold flex items-center gap-2">
                            <Filter size={16} /> Filter
                        </Button>
                        <Button variant="outline" size="sm" className="bg-white px-4 border-gray-100 text-gray-600 font-bold flex items-center gap-2">
                            <Download size={16} /> Export
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <th className="px-8 py-5">BUSINESS NAME</th>
                                <th className="px-8 py-5">CONTACT MOBILE</th>
                                <th className="px-8 py-5">EMAIL ADDRESS</th>
                                <th className="px-8 py-5">LEAD RATING</th>
                                <th className="px-8 py-5">STATUS</th>
                                <th className="px-8 py-5 text-right">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentLeads.map((lead) => (
                                <tr key={lead.id} className="group hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${lead.initialsColor}`}>
                                                {lead.initials}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">{lead.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 tracking-tight">{lead.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-gray-600">
                                        {lead.mobile}
                                    </td>
                                    <td className="px-8 py-5 text-sm font-medium text-gray-500">
                                        {lead.email}
                                    </td>
                                    <td className="px-8 py-5">
                                        <RatingStars count={lead.rating} />
                                    </td>
                                    <td className="px-8 py-5 text-sm">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-tighter ${lead.statusColor}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
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

            {/* Action Bar */}
            <div className="flex justify-end pt-4">
                <Button
                    className="px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold py-3 shadow-xl shadow-blue-200 transition-all active:scale-95"
                    onClick={() => setIsModalOpen(true)}
                >
                    Save Audience
                </Button>
            </div>
            {/* Create New Audience Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Audience"
                footer={(
                    <>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="px-8 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl">
                            Cancel
                        </Button>
                        <Button
                            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 transition-all active:scale-95"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Create Audience
                        </Button>
                    </>
                )}
            >
                <div className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900 flex items-center gap-1">
                            Audience Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="e.g., Surat Cafes Oct 2023"
                            value={audienceData.name}
                            onChange={(e) => setAudienceData({ ...audienceData, name: e.target.value })}
                            className="bg-white border-gray-200 py-3 px-4 focus:ring-primary/10 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900">
                            Description
                        </label>
                        <textarea
                            placeholder="Add a brief description to help your team understand this audience segment..."
                            className="w-full min-h-[100px] p-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                            value={audienceData.description}
                            onChange={(e) => setAudienceData({ ...audienceData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900 flex items-center gap-1">
                            Select ICP to be matched <span className="text-gray-400 font-medium">(Optional)</span>
                        </label>
                        <div className="relative">
                            <select
                                className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/10 appearance-none cursor-pointer"
                                value={audienceData.icp}
                                onChange={(e) => setAudienceData({ ...audienceData, icp: e.target.value })}
                            >
                                <option value="" disabled>Select an Ideal Customer Profile...</option>
                                <option value="surat-cafes">Surat Cafes</option>
                                <option value="retailers">Retailers India</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ChevronDown size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900">
                            Tags
                        </label>
                        <div className="flex flex-wrap items-center gap-2 p-3 bg-white border border-gray-200 rounded-xl min-h-[50px]">
                            {audienceData.tags.map((tag, i) => (
                                <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg group animate-in zoom-in-95">
                                    {tag}
                                    <button
                                        onClick={() => setAudienceData({ ...audienceData, tags: audienceData.tags.filter((_, idx) => idx !== i) })}
                                        className="hover:text-blue-800"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                            <input
                                placeholder="Type and press Enter..."
                                className="flex-1 bg-transparent border-none text-sm outline-none min-w-[150px] placeholder:text-gray-400"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.target.value.trim()) {
                                        setAudienceData({
                                            ...audienceData,
                                            tags: [...audienceData.tags, e.target.value.trim()]
                                        });
                                        e.target.value = '';
                                    }
                                }}
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium mt-1">Use tags to organize and filter audiences later.</p>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default FinalEnrichedLeads;
