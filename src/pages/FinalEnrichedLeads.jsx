import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, CheckCircle2, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import { AppContext } from '../context/AppContext';
import Api from '../../scripts/Api';

// Utilities
import { exportLeadsCSV } from '../utils/exportCsvHelper';

// Modular Components
import EnrichedStatsRow from '../components/finalEnrichedLeads/EnrichedStatsRow';
import EnrichedLeadsTable from '../components/finalEnrichedLeads/EnrichedLeadsTable';
import SaveAudienceModal from '../components/finalEnrichedLeads/SaveAudienceModal';

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
    const [uiTags, setUiTags] = useState(['High Priority']);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        window.scrollTo(0, 0);
        const timer = setTimeout(() => window.scrollTo(0, 0), 10);
        return () => clearTimeout(timer);
    }, []);

    // ── Data Ingestion ────────────────────────────────────────────────────────
    const rawLeads = location.state?.results || contextLeads || [];
    const leadsData = Array.isArray(rawLeads) ? rawLeads : (rawLeads.results || rawLeads.data || []);
    const queryInfo = location.state?.queryInfo || {};

    // ── Multi-tier De-duplication ─────────────────────────────────────────────
    const uniqueLeads = [];
    const seenLeadKeys = new Set();
    (leadsData || []).forEach(lead => {
        if (!lead) return;
        const id = lead.id || lead.result_id || null;
        const rawName = lead.name || lead.BusinessName || lead.business_name || '';
        const rawAddr = lead.address || lead.Address || lead.full_address || lead.location || '';
        const normName = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normAddr = rawAddr.toLowerCase().replace(/[^a-z0-9]/g, '');
        const nameAddrKey = (normName && normAddr) ? `na-${normName}-${normAddr}` : null;
        const rawPhone = String(lead.mobile || lead.MobileNumber || lead.phone || '');
        const normPhone = rawPhone.replace(/\D/g, '');
        const phoneKey = (normPhone && normPhone.length >= 8) ? `ph-${normPhone}` : null;
        const rawEmail = lead.email || lead.Email || '';
        const emailKey = rawEmail ? `em-${rawEmail.toLowerCase().trim()}` : null;

        const isDup = (id && seenLeadKeys.has(id)) ||
            (nameAddrKey && seenLeadKeys.has(nameAddrKey)) ||
            (phoneKey && seenLeadKeys.has(phoneKey)) ||
            (emailKey && seenLeadKeys.has(emailKey));

        if (!isDup) {
            if (id) seenLeadKeys.add(id);
            if (nameAddrKey) seenLeadKeys.add(nameAddrKey);
            if (phoneKey) seenLeadKeys.add(phoneKey);
            if (emailKey) seenLeadKeys.add(emailKey);
            uniqueLeads.push(lead);
        }
    });

    const leads = uniqueLeads;
    const totalLeads = leads.length;
    const verifiedEmails = leads.filter(l => l.email || l.Email || l.verified_email).length;
    const enrichmentRate = totalLeads > 0
        ? Math.round((leads.filter(l => l.is_enriched || l.email || l.instagram || l.facebook).length / totalLeads) * 100)
        : 0;

    const stats = [
        { label: 'Total Contact Leads', value: totalLeads.toLocaleString(), change: '', icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-50' },
        { label: 'Verified Emails', value: verifiedEmails.toLocaleString(), change: '', icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-50' },
        { label: 'Enrichment Rate', value: `${enrichmentRate}%`, change: '', icon: Zap, color: 'text-purple-500', bgColor: 'bg-purple-50' },
    ];

    // ── Search Filter ──────────────────────────────────────────────────────────
    const filteredLeads = leads.filter(lead => {
        const search = searchTerm.toLowerCase();
        return (
            (lead.name || lead.BusinessName || '').toLowerCase().includes(search) ||
            (lead.email || lead.Email || '').toLowerCase().includes(search) ||
            (lead.category || lead.industry || '').toLowerCase().includes(search)
        );
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

    // ── Save Audience ─────────────────────────────────────────────────────────
    const handleSaveAudience = async () => {
        const payload = {
            audiance_name: audienceData.audiance_name,
            discription: audienceData.discription,
            icp: audienceData.icp,
            tag: uiTags.join(', ')
        };
        try {
            const response = await Api.saveAudience(payload, adminToken);
            if (response) {
                setIsModalOpen(false);
                setAudienceData({ audiance_name: '', discription: '', icp: '', tag: '' });
                setUiTags(['High Priority']);
                navigate('/contacts');
            }
        } catch (error) {
            console.error('Error saving audience:', error);
        }
    };

    return (
        <div className="animate-in fade-in duration-700 space-y-8 pb-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">Final Enriched Leads</h1>
                    <p className="text-gray-500 text-sm mt-1">Review and export your data</p>
                </div>
            </div>

            <EnrichedStatsRow stats={stats} />

            <EnrichedLeadsTable
                filteredLeads={filteredLeads}
                currentLeads={currentLeads}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onExportCSV={() => exportLeadsCSV(leads)}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                navigate={navigate}
                queryInfo={queryInfo}
                leads={leads}
            />

            {/* Action Bar */}
            <div className="flex justify-end pt-4">
                <Button
                    className="px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold py-3 shadow-xl shadow-blue-200 transition-all active:scale-95"
                    onClick={() => setIsModalOpen(true)}
                >
                    Save Audience
                </Button>
            </div>

            <SaveAudienceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                audienceData={audienceData}
                setAudienceData={setAudienceData}
                uiTags={uiTags}
                setUiTags={setUiTags}
                onSave={handleSaveAudience}
            />
        </div>
    );
};

export default FinalEnrichedLeads;
