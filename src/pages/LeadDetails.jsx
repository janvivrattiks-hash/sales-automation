import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Search, Loader2, Trash2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Api from '../../scripts/Api';
import { useApp } from '../context/AppContext';

// Modular Components
import SingleLeadDetail from '../components/leadDetails/SingleLeadDetail';
import LeadDetailsHeader from '../components/leadDetails/LeadDetailsHeader';
import LeadDetailsStats from '../components/leadDetails/LeadDetailsStats';
import LeadDetailsTable from '../components/leadDetails/LeadDetailsTable';

// Reuse the DeleteLeadModal already built for Dashboard
import DeleteLeadModal from '../components/dashboard/DeleteLeadModal';

const LeadDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { adminToken } = useApp();

    const [leadData, setLeadData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [viewingId, setViewingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ open: false, lead: null });

    useEffect(() => {
        if (location.state?.results) {
            setLeadData({
                leads: location.state.results,
                ...(location.state.queryInfo || {})
            });
        }
    }, [location.state]);

    // ── Single Lead View (from Dashboard eye icon) ────────────────────────────
    if (location.state?.singleLead) {
        return (
            <SingleLeadDetail
                lead={location.state.singleLead}
                onBack={() => navigate('/dashboard')}
            />
        );
    }

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleViewLead = async (lead) => {
        const resultId = lead.result_id || lead.id;
        if (!resultId) return;
        setViewingId(resultId);
        try {
            const response = await Api.getSingleLead(resultId, adminToken);
            if (response?.data) {
                navigate('/lead-details', { state: { singleLead: response.data } });
            } else {
                navigate('/lead-details', { state: { singleLead: lead } });
            }
        } catch (error) {
            console.error('Error fetching lead:', error);
        } finally {
            setViewingId(null);
        }
    };

    const handleDeleteConfirm = async () => {
        const lead = deleteModal.lead;
        if (!lead?.id) {
            setDeleteModal({ open: false, lead: null });
            return;
        }
        setDeletingId(lead.id);
        try {
            const response = await Api.deleteLead(lead.id, adminToken);
            if (response) {
                setLeadData(prev => ({
                    ...prev,
                    leads: prev.leads.filter(l => l.id !== lead.id)
                }));
                setDeleteModal({ open: false, lead: null });
            }
        } catch (error) {
            console.error('Error deleting lead:', error);
        } finally {
            setDeletingId(null);
        }
    };

    // ── Loading state ─────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 py-20">
                <Loader2 size={48} className="animate-spin mb-4 text-primary" />
                <p className="font-medium">Loading search results...</p>
            </div>
        );
    }

    // ── Empty state ───────────────────────────────────────────────────────────
    if (!leadData && !loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 space-y-6 py-20">
                <div className="bg-gray-50 p-6 rounded-full">
                    <Search size={48} className="text-gray-300" />
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">No Search Data Found</p>
                    <p className="text-sm text-gray-500 mt-1">Please generate leads from the generator page first.</p>
                </div>
                <Button onClick={() => navigate('/lead-generator')} className="px-8">
                    Go to Generator
                </Button>
            </div>
        );
    }

    // ── Derived data ──────────────────────────────────────────────────────────
    const queryValue = leadData?.niche || 'N/A';
    const cityValue = leadData?.city || 'N/A';
    const areaValue = leadData?.area || 'N/A';
    const leads = leadData?.leads || [];

    const stats = [
        { label: 'SEARCH QUERY', value: queryValue },
        { label: 'CITY', value: cityValue },
        { label: 'AREA', value: areaValue },
        { label: 'TOTAL LEADS', value: leads.length.toString(), icon: Users },
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-32">
            <LeadDetailsHeader
                navigate={navigate}
                leads={leads}
                queryValue={queryValue}
                cityValue={cityValue}
                areaValue={areaValue}
            />

            <LeadDetailsStats stats={stats} />

            <LeadDetailsTable
                leads={leads}
                viewingId={viewingId}
                deletingId={deletingId}
                onViewLead={handleViewLead}
                onDeleteLead={(lead) => setDeleteModal({ open: true, lead })}
            />

            {deleteModal.open && (
                <DeleteLeadModal
                    lead={deleteModal.lead}
                    onCancel={() => setDeleteModal({ open: false, lead: null })}
                    onConfirm={handleDeleteConfirm}
                />
            )}
        </div>
    );
};

export default LeadDetails;
