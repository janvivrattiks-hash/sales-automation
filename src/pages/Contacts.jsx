import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Users, Search, Filter, Download, Upload, Loader2, Zap, ArrowRight, Plus, ChevronRight, ChevronDown, X
} from 'lucide-react';

// UI Components
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import StarRating from '../components/ui/StarRating';

// Modularized Parts
import { useContacts } from '../hooks/useContacts';
import ContactRow from '../components/contacts/ContactRow';
import AudienceTable from '../components/contacts/AudienceTable';
import FilterForm from '../components/contacts/FilterForm';
import DeleteModal from '../components/contacts/DeleteModal';
import Api from '../../scripts/Api';
import { AppContext } from '../context/AppContext';

const Contacts = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { adminToken, leads: contextLeads } = useContext(AppContext);

    // Hooks & State
    const contactsHook = useContacts(navigate);
    const {
        rawContacts, enrichedContacts, audiences,
        rawLoading, audLoading, loading, setLoading,
        isFiltering, isSavingAudience,
        selectedLeads, setSelectedLeads,
        selectedLeadsInModal, setSelectedLeadsInModal,
        viewingId, setViewingId,
        deletingId,
        filters, setFilters,
        audienceData, setAudienceData,
        uiTags, setUiTags,
        fetchEnrichedData, fetchRawData, fetchAudiences,
        toggleLeadSelection, toggleModalLeadSelection,
        handleFilter, handleSaveAudience, handleDeleteLead, handleDeleteAudience
    } = contactsHook;

    const [isEnriched, setIsEnriched] = useState(location.state?.activeTab === 'enriched');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [audSearchQuery, setAudSearchQuery] = useState('');
    const [isMainFilterOpen, setIsMainFilterOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isSaveAudienceModalOpen, setIsSaveAudienceModalOpen] = useState(false);
    const [filterLeadsData, setFilterLeadsData] = useState([]);
    const [modalCurrentPage, setModalCurrentPage] = useState(1);
    const [deleteModalState, setDeleteModalState] = useState({ open: false, type: 'lead', data: null });

    const itemsPerPage = 10;
    const modalItemsPerPage = 5;

    // Lifecycles
    useEffect(() => {
        window.scrollTo(0, 0);
        if (adminToken) {
            fetchRawData();
            fetchEnrichedData();
            fetchAudiences();
        }
    }, [adminToken, fetchRawData, fetchEnrichedData, fetchAudiences]);

    // Derived State
    const activeContacts = isEnriched ? enrichedContacts : rawContacts;

    const filteredLeads = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return activeContacts.filter(contact =>
            (contact.name || contact.BusinessName || '').toLowerCase().includes(q) ||
            (contact.email || contact.Email || '').toLowerCase().includes(q) ||
            (contact.phone || contact.MobileNumber || contact.mobile || '').toLowerCase().includes(q)
        );
    }, [activeContacts, searchQuery]);

    const filteredAudiences = useMemo(() => {
        const q = audSearchQuery.toLowerCase();
        return audiences.filter(audience =>
            (audience.audiance_name || '').toLowerCase().includes(q) ||
            (audience.tag || '').toLowerCase().includes(q)
        );
    }, [audiences, audSearchQuery]);

    const displayContacts = filteredLeads;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentContacts = displayContacts.slice(startIndex, startIndex + itemsPerPage);

    // Handlers
    const handleEnrichLeads = () => {
        const leadsToEnrich = selectedLeads.length > 0
            ? rawContacts.filter(l => selectedLeads.includes(l.id || l.result_id))
            : rawContacts;

        navigate('/enrich', { state: { results: leadsToEnrich, fromContacts: true } });
    };

    const handleViewRawContact = (lead) => {
        navigate('/contact-details', { state: { singleLead: lead, fromTab: 'raw' } });
    };

    const handleViewLead = async (lead) => {
        const resultId = lead.result_id || lead.id;

        if (!resultId) {
            console.error("Lead ID not found");
            return;
        }

        setViewingId(resultId);

        try {
            // Parallel fetch for enrichment data and POI details
            const [resData, poiData] = await Promise.all([
                Api.getEnrichmentJson(resultId, adminToken),
                Api.getPOIDetails(resultId, adminToken)
            ]);

            if (!resData) {
                console.error("No data received from API or data is empty");
                return;
            }

            // Extract the core data from the full response body
            const body = resData.data || resData.results || resData.lead || resData;
            const coreData = Array.isArray(body) ? body[0] : body;

            // Clean merge (POI data will be handled in the Single View page if needed)
            const mergedLead = {
                ...lead,
                ...coreData,
                poi_details: poiData
            };

            navigate('/contact-details', {
                state: {
                    singleLead: mergedLead,
                    fromTab: 'enriched'
                }
            });

        } catch (error) {
            console.error("Failed to load details", error);
        } finally {
            setViewingId(null);
        }
    };

    const handleOpenFilterModal = () => {
        setFilterLeadsData(activeContacts);
        setIsFilterModalOpen(true);
        setSelectedLeadsInModal([]);
        setModalCurrentPage(1);
    };

    const handleDeleteConfirm = async (id) => {
        const { type } = deleteModalState;
        if (type === 'audience') {
            await handleDeleteAudience(id);
        } else {
            await handleDeleteLead(id, isEnriched);
        }
        setDeleteModalState({ open: false, type: 'lead', data: null });
    };

    return (
        <div className="animate-in fade-in duration-700 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Contact Management</h1>
                        <p className="text-gray-500 text-sm mt-1">View and manage your source leads and potential partners.</p>
                    </div>
                    <div className="flex items-center gap-1 bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
                        <button onClick={() => setIsEnriched(false)} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${!isEnriched ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-700'}`}>Raw Data</button>
                        <button onClick={() => setIsEnriched(true)} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${isEnriched ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-700'}`}>Enriched Data</button>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {!isEnriched && (
                        <Button variant="outline" className="flex items-center gap-2 px-4 shadow-sm"><Download size={16} /> Export</Button>
                    )}
                    <Button variant="outline" className="flex items-center gap-2 px-4 shadow-sm"><Upload size={16} /> Import</Button>
                    {!isEnriched && (
                        <Button variant="outline" onClick={() => setIsMainFilterOpen(true)} className="flex items-center gap-2 px-4 shadow-sm"><Filter size={16} /> Filter</Button>
                    )}
                    <Button 
                        onClick={isEnriched 
                            ? (selectedLeads.length > 0 ? () => setIsSaveAudienceModalOpen(true) : handleOpenFilterModal) 
                            : handleEnrichLeads
                        } 
                        className="flex items-center gap-2 px-6 shadow-lg bg-blue-600 hover:bg-blue-700 font-bold" 
                        disabled={!isEnriched && selectedLeads.length === 0 && loading}
                    >
                        {isEnriched ? <Users size={16} /> : <Zap size={16} className="fill-current" />}
                        {isEnriched ? "Create Audience" : "Enrich Data"}
                        {loading && !isEnriched && <Loader2 size={14} className="animate-spin ml-1" />}
                    </Button>
                </div>
            </div>

            <Card className="p-0">
                <div className="p-4 border-b border-gray-50 flex flex-wrap gap-4 items-center justify-between bg-gray-50/30">
                    <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <Input placeholder="Search by name, email or company..." className="pl-10" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
                        </div>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                        Showing <span className="text-gray-900">{displayContacts.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, displayContacts.length)}</span> of {displayContacts.length.toLocaleString()} contacts
                    </div>
                </div>

                <div className="overflow-x-auto relative min-h-[400px]">
                    {rawLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 z-10">
                            <Loader2 className="animate-spin text-primary mb-2" size={32} />
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading contacts...</p>
                        </div>
                    ) : displayContacts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                            <Users size={32} className="text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-900">No {isEnriched ? 'enriched' : 'raw'} contacts found</h3>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                                    <th className="px-6 py-4">
                                        <input type="checkbox" onChange={(e) => setSelectedLeads(e.target.checked ? currentContacts.map(l => l.id || l.result_id) : [])} checked={currentContacts.length > 0 && currentContacts.every(l => selectedLeads.includes(l.id || l.result_id))} />
                                    </th>
                                    <th className="px-6 py-4">{isEnriched ? 'BUSINESS NAME' : 'Business Name'}</th>
                                    <th className="px-6 py-4">{isEnriched ? 'CONTACT INFO' : 'Contact Mobile'}</th>
                                    <th className="px-6 py-4">{isEnriched ? 'SOCIAL LINKS' : 'Email'}</th>
                                    <th className="px-6 py-4">WEBSITE</th>
                                    <th className="px-6 py-4">RATING</th>
                                    <th className="px-6 py-4">STATUS</th>
                                    <th className="px-6 py-4 text-right">ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentContacts.map((contact, idx) => (
                                    <ContactRow
                                        key={contact.id || idx}
                                        contact={contact}
                                        idx={idx}
                                        isEnriched={isEnriched}
                                        selectedLeads={selectedLeads}
                                        toggleLeadSelection={toggleLeadSelection}
                                        handleViewLead={handleViewLead}
                                        handleViewRawContact={handleViewRawContact}
                                        setDeleteModal={setDeleteModalState}
                                        viewingId={viewingId}
                                        deletingId={deletingId}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <Pagination currentPage={currentPage} totalItems={displayContacts.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
            </Card>

            <AudienceTable
                audiences={audiences}
                filteredAudiences={filteredAudiences}
                audLoading={audLoading}
                navigate={navigate}
                setDeleteModal={setDeleteModalState}
            />

            {/* Modals */}
            <Modal isOpen={isMainFilterOpen} onClose={() => setIsMainFilterOpen(false)} title="Filter Data" footer={(
                <div className="flex items-center justify-end gap-3 w-full">
                    <Button onClick={() => handleFilter(true, isEnriched, () => setIsMainFilterOpen(false))} className="bg-blue-600" disabled={isFiltering}>
                        {isFiltering ? <Loader2 className="animate-spin" size={18} /> : 'Apply Filters'}
                    </Button>
                </div>
            )}>
                <FilterForm filters={filters} setFilters={setFilters} />
            </Modal>

            <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Filter Leads" footer={(
                <div className="flex items-center justify-between w-full">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedLeadsInModal.length} Selected</div>
                    <Button onClick={() => { setIsFilterModalOpen(false); setIsSaveAudienceModalOpen(true); }} className="bg-blue-600">Next <ArrowRight size={18} /></Button>
                </div>
            )}>
                <FilterForm filters={filters} setFilters={setFilters} />

            </Modal>

            <Modal isOpen={isSaveAudienceModalOpen} onClose={() => setIsSaveAudienceModalOpen(false)} title="Create New Audience" footer={(
                <Button onClick={() => handleSaveAudience(isEnriched, activeContacts, filterLeadsData)} className="bg-blue-600" disabled={isSavingAudience}>Complete & Save</Button>
            )}>
                <div className="space-y-6 text-left">
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Leads to Save</p>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                    {Array.from(new Set([...selectedLeads, ...selectedLeadsInModal])).length || activeContacts.length} Contacts Ready
                                </p>
                            </div>
                        </div>
                    </div>

                    <Input label="Audience Name" placeholder="e.g., Surat Cafes" value={audienceData.audiance_name} onChange={(e) => setAudienceData({ ...audienceData, audiance_name: e.target.value })} />

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase pb-1.5 block">Description</label>
                        <textarea className="w-full mt-2 p-3 bg-gray-50 border border-gray-100 rounded-xl min-h-[100px]" value={audienceData.discription} onChange={(e) => setAudienceData({ ...audienceData, discription: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Tags</label>
                        <div className="flex flex-wrap gap-2 mt-2 mb-3">
                            {uiTags.filter(t => t !== 'Enriched' && t !== 'Raw').map((tag, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-lg">
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => setUiTags(uiTags.filter(t => t !== tag))}
                                        className="hover:text-primary/70 focus:outline-none ml-1"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                        <Input
                            placeholder="Type a tag and press Enter"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const newTag = e.target.value.trim();
                                    if (newTag && !uiTags.includes(newTag)) {
                                        setUiTags([...uiTags, newTag]);
                                        e.target.value = '';
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </Modal>

            <DeleteModal
                isOpen={deleteModalState.open}
                onClose={() => setDeleteModalState({ open: false, type: 'lead', data: null })}
                type={deleteModalState.type}
                data={deleteModalState.data}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
};

export default Contacts;
