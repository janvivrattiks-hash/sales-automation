import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    Trash2,
    Facebook,
    Instagram,
    Linkedin,
    Mail,
    Phone,
    Globe
} from 'lucide-react';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';
import Api from '../../scripts/Api';
import { AppContext } from '../context/AppContext';

const FinalEnrichedLeads = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { leads: contextLeads, adminToken } = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [audienceData, setAudienceData] = useState({
        audiance_name: '',
        discription: '',
        icp: '',
        tag: 'High Priority'
    });
    // Internal state for multiple tags support in UI
    const [uiTags, setUiTags] = useState(['High Priority']);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Get leads from location state or fallback to contextLeads
    const rawLeads = location.state?.results || contextLeads || [];
    const leads = Array.isArray(rawLeads) ? rawLeads : (rawLeads.results || rawLeads.data || []);
    const queryInfo = location.state?.queryInfo || {};

    const totalLeads = leads.length;
    const verifiedEmails = leads.filter(l => l.email || l.Email || l.verified_email).length;
    const enrichmentRate = totalLeads > 0 ? Math.round((leads.filter(l => l.is_enriched || l.email || l.instagram || l.facebook).length / totalLeads) * 100) : 0;

    const filteredLeads = leads.filter(lead => {
        console.log("Lead:", lead);
        const search = searchTerm.toLowerCase();
        return (
            (lead.name || lead.BusinessName || '').toLowerCase().includes(search) ||
            (lead.email || lead.Email || '').toLowerCase().includes(search) ||
            (lead.category || lead.industry || '').toLowerCase().includes(search)
        );
    });

    const stats = [
        {
            label: 'Total Contact Leads',
            value: totalLeads.toLocaleString(),
            change: '',
            icon: Users,
            color: 'text-blue-500',
            bgColor: 'bg-blue-50'
        },
        {
            label: 'Verified Emails',
            value: verifiedEmails.toLocaleString(),
            change: '',
            icon: CheckCircle2,
            color: 'text-green-500',
            bgColor: 'bg-green-50'
        },
        {
            label: 'Enrichment Rate',
            value: `${enrichmentRate}%`,
            change: '',
            icon: Zap,
            color: 'text-purple-500',
            bgColor: 'bg-purple-50'
        }
    ];

    // StarRating Component with fractional support
    const StarRating = ({ rating, max = 5, size = 'md' }) => {
        const sizeClasses = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' };
        return (
            <div className="flex items-center gap-0.5">
                {[...Array(max)].map((_, i) => {
                    const fill = Math.min(Math.max(rating - i, 0), 1);
                    const fillPct = Math.round(fill * 100);
                    return (
                        <span key={i} className={`relative inline-block ${sizeClasses[size] || 'text-base'} leading-none`} style={{ width: '1em', height: '1em' }}>
                            <span className="text-gray-200">★</span>
                            {fillPct > 0 && (
                                <span className="absolute inset-0 overflow-hidden text-yellow-400" style={{ width: `${fillPct}%` }}>★</span>
                            )}
                        </span>
                    );
                })}
                <span className="ml-1 text-[10px] text-gray-400 font-bold">{rating}</span>
            </div>
        );
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

    const handleExportCSV = () => {
        if (leads.length === 0) return;

        const headers = ["Business Name", "Address", "Mobile", "Email", "Website", "Facebook", "Instagram", "LinkedIn", "Rating"];
        const csvRows = leads.map(l => [
            `"${l.name || l.BusinessName || ''}"`,
            `"${l.address || l.Address || ''}"`,
            `"${l.mobile || l.MobileNumber || l.phone || ''}"`,
            `"${l.email || l.Email || ''}"`,
            `"${l.website || ''}"`,
            `"${l.facebook || l.facebook_url || ''}"`,
            `"${l.instagram || l.instagram_url || ''}"`,
            `"${l.linkedin || l.linkedin_url || ''}"`,
            l.rating || l.Rating || 0
        ].join(','));

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `enriched_leads_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("CSV exported successfully");
    };


    const handleSaveAudience = async () => { // handle save audience
        // Prepare payload according to Python curl requirements
        const payload = {
            audiance_name: audienceData.audiance_name,
            discription: audienceData.discription,
            icp: audienceData.icp,
            tag: uiTags.join(', ') // backend expects a string "tag"
        };

        console.log("Saving Audience with Payload:", payload);
        try {
            const response = await Api.saveAudience(payload, adminToken); // call API to save audience
            if (response) { // if response is not null
                toast.success("Audience saved successfully"); // show success message
                setIsModalOpen(false); // close modal
                // Reset form
                setAudienceData({ audiance_name: '', discription: '', icp: '', tag: '' });
                setUiTags(['High Priority']);
                navigate('/contacts');
            }
        } catch (error) { // catch error
            console.error("Error saving audience:", error); // log error message
            toast.error("Failed to save audience"); // show error message
        }
    };


    useEffect(() => {
        window.scrollTo(0, 0);
        const timer = setTimeout(() => window.scrollTo(0, 0), 10);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="animate-in fade-in duration-700 space-y-8 pb-10">
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
            <Card noPadding className="border-none shadow-sm rounded-2xl bg-white">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search in enriched results..."
                            className="w-full pl-12 pr-4 py-2.5 bg-gray-50/50 border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-bold"
                            onClick={handleExportCSV}
                        >
                            <Download size={16} />
                            Export CSV
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <th className="px-8 py-5">BUSINESS NAME</th>
                                <th className="px-8 py-5">CONTACT INFO</th>
                                <th className="px-8 py-5">SOCIAL LINKS</th>
                                <th className="px-8 py-5">WEBSITE</th>
                                <th className="px-8 py-5">LEAD RATING</th>
                                <th className="px-8 py-5">STATUS</th>
                                <th className="px-8 py-5 text-right">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentLeads.map((lead, index) => {
                                const initials = (lead.name || lead.BusinessName || 'NA').substring(0, 2).toUpperCase();
                                const colors = [
                                    'bg-blue-50 text-blue-500',
                                    'bg-purple-50 text-purple-500',
                                    'bg-orange-50 text-orange-500',
                                    'bg-cyan-50 text-cyan-500',
                                    'bg-pink-50 text-pink-500',
                                    'bg-green-50 text-green-500'
                                ];
                                const initialsColor = colors[index % colors.length];

                                return (
                                    <tr key={lead.id || index} className="group hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors cursor-pointer">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                {/* <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs ${initialsColor}`}>
                                                    {initials}
                                                </div> */}
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm leading-tight">{lead.name || lead.BusinessName || 'N/A'}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 tracking-tight uppercase mt-0.5">{lead.category || lead.Industry || lead.address || 'No category'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                                    <Phone size={12} className="text-gray-400" />
                                                    {lead.mobile || lead.MobileNumber || lead.phone || 'N/A'}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                                    <Mail size={12} className="text-gray-400" />
                                                    <span className="truncate max-w-[150px]">{lead.email || lead.Email || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                {(lead.facebook || lead.facebook_url) && (
                                                    <a href={lead.facebook || lead.facebook_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#1877F2] hover:opacity-80 transition-opacity font-bold text-[10px] group/soc" title="Facebook">
                                                        <Facebook size={12} className="group-hover/soc:scale-110 transition-transform" />
                                                        <span className="truncate max-w-[100px]">{(lead.name || lead.BusinessName || 'Business').split(' ')[0]} FB</span>
                                                    </a>
                                                )}
                                                {(lead.instagram || lead.instagram_url || lead.Instagram_link) && (
                                                    <a href={lead.instagram || lead.instagram_url || lead.Instagram_link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#E4405F] hover:opacity-80 transition-opacity font-bold text-[10px] group/soc" title="Instagram">
                                                        <Instagram size={12} className="group-hover/soc:scale-110 transition-transform" />
                                                        <span className="truncate max-w-[100px]">{(lead.name || lead.BusinessName || 'Business').split(' ')[0]} IG</span>
                                                    </a>
                                                )}
                                                {(lead.linkedin || lead.linkedin_url || lead.Linkedin_link) && (
                                                    <a href={lead.linkedin || lead.linkedin_url || lead.Linkedin_link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#0A66C2] hover:opacity-80 transition-opacity font-bold text-[10px] group/soc" title="LinkedIn">
                                                        <Linkedin size={12} className="group-hover/soc:scale-110 transition-transform" />
                                                        <span className="truncate max-w-[100px]">{(lead.name || lead.BusinessName || 'Business').split(' ')[0]} LI</span>
                                                    </a>
                                                )}
                                                {!(lead.facebook || lead.facebook_url || lead.instagram || lead.instagram_url || lead.Instagram_link || lead.linkedin || lead.linkedin_url || lead.Linkedin_link) && (
                                                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded w-fit">No social</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {lead.website || lead.Website || lead.website_url ? (
                                                <a
                                                    href={lead.website || lead.Website || lead.website_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold text-[11px] transition-all group/link underline-offset-4 hover:underline"
                                                >
                                                    <Globe size={14} className="text-blue-400 group-hover/link:scale-110 transition-transform" />
                                                    <span className="truncate max-w-[140px]">
                                                        {(lead.name || lead.BusinessName || 'Business').split(' ')[0]} Website
                                                    </span>
                                                </a>
                                            ) : (
                                                <span className="text-xs font-bold text-gray-300">N/A</span>
                                            )}
                                        </td>

                                        <td className="px-8 py-5">
                                            <StarRating rating={lead.rating || lead.Rating || lead.ratting || 0} size="sm" />
                                        </td>
                                        <td className="px-8 py-5 text-sm">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-tighter ${['VERIFIED', 'Active', 'Enriched', 'Validated'].includes(lead.status) ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
                                                {lead.status || 'ENRICHED'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-3 text-gray-300">
                                                <button
                                                    className="p-2 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg active:scale-90"
                                                    onClick={() => navigate('/lead-details', { state: { singleLead: lead, results: leads, queryInfo } })}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button className="p-2 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg active:scale-90">
                                                    <Trash2 size={18} />
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
                    totalItems={filteredLeads.length}
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
                            onClick={handleSaveAudience}
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
                            value={audienceData.audiance_name}
                            onChange={(e) => setAudienceData({ ...audienceData, audiance_name: e.target.value })}
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
                            value={audienceData.discription}
                            onChange={(e) => setAudienceData({ ...audienceData, discription: e.target.value })}
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
                            {uiTags.map((tag, i) => (
                                <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg group animate-in zoom-in-95">
                                    {tag}
                                    <button
                                        onClick={() => setUiTags(uiTags.filter((_, idx) => idx !== i))}
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
                                        setUiTags([...uiTags, e.target.value.trim()]);
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
