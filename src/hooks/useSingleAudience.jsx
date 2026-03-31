import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Api from '../../scripts/Api';
import { findField, extractString, getDeepField } from '../utils/dataHelpers.jsx';

/**
 * Custom hook for managing Single Audience View logic.
 */
const useSingleAudience = (leadId, initialLeadData) => {
    // Basic States
    const [activeTab, setActiveTab] = useState('summary');
    const [leads, setLeads] = useState(initialLeadData || null);

    // Data States
    const [summaryData, setSummaryData] = useState(null);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [poiDetails, setPoiDetails] = useState(null);
    const [isLoadingPoi, setIsLoadingPoi] = useState(false);
    const [messagesData, setMessagesData] = useState(null);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [activityLogs, setActivityLogs] = useState([]);
    const [isLoadingActivity, setIsLoadingActivity] = useState(false);
    const [notesList, setNotesList] = useState([]);
    const [isLoadingNotes, setIsLoadingNotes] = useState(false);
    const [tasksList, setTasksList] = useState([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [isLoadingContactInfo, setIsLoadingContactInfo] = useState(false);

    // Form States
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [taskName, setTaskName] = useState('');
    const [taskDueDate, setTaskDueDate] = useState('');
    const [taskStatus, setTaskStatus] = useState('To Do');
    const [taskDescription, setTaskDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial Fetch
    useEffect(() => {
        if (!leadId) return;
        fetchContactInfo(); // Fetch enriched contact info first to populate sidebar
        fetchSummary();
        fetchPOIDetails();
        fetchMessages();
        fetchActivity();
        fetchNotes();
        fetchTasks();
    }, [leadId]);

    // Fetching Logic

    // Fetch POI (Point of Interest) Details
    const fetchPOIDetails = async () => {
        try {
            setIsLoadingPoi(true);
            const token = localStorage.getItem('admin_token');
            const data = await Api.getPOIDetails(leadId, token);
            setPoiDetails(data || null);
        } catch (error) {
            console.warn('Error fetching POI details:', error);
            setPoiDetails(null);
        } finally {
            setIsLoadingPoi(false);
        }
    };

    // Fetch all contact data (CRM + Enrichment) and merge into leads state
    const fetchContactInfo = async () => {
        try {
            setIsLoadingContactInfo(true);
            const token = localStorage.getItem('admin_token');

            // Try fetching latest CRM data to ensure Maximum coverage of enriched details
            const crmData = await Api.getContactInfo(leadId, token);

            const merged = {};
            if (crmData) {
                Object.assign(merged, crmData);
            }

            if (Object.keys(merged).length > 0) {
                setLeads(prev => ({ ...(prev || {}), ...merged }));
                console.log('COMPREHENSIVE_DATA_MERGED:', merged);
            }
        } catch (error) {
            console.warn('Full contact data merge failed:', error?.message);
        } finally {
            setIsLoadingContactInfo(false);
        }
    };

    const fetchSummary = async () => {
        try {
            setIsLoadingSummary(true);
            const token = localStorage.getItem('admin_token');
            const data = await Api.getSummary(leadId, token);
            setSummaryData(data || null);
        } catch (error) {
            console.error('Error fetching summary:', error);
            setSummaryData(null);
        } finally {
            setIsLoadingSummary(false);
        }
    };

    const fetchMessages = async () => {
        try {
            setIsLoadingMessages(true);
            const token = localStorage.getItem('admin_token');
            const data = await Api.generateMessagesStrategy(leadId, token);
            setMessagesData(data || null);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setMessagesData(null);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const fetchActivity = async () => {
        try {
            setIsLoadingActivity(true);
            const token = localStorage.getItem('admin_token');
            const data = await Api.getEmailActivityStatus(token, leadId);
            setActivityLogs(data || []);
        } catch (error) {
            console.error('Error fetching activity:', error);
            setActivityLogs([]);
        } finally {
            setIsLoadingActivity(false);
        }
    };

    const fetchNotes = async () => {
        try {
            setIsLoadingNotes(true);
            const token = localStorage.getItem('admin_token');
            // getNotes(token, id) - Scoped to leadId
            const data = await Api.getNotes(token, leadId);
            setNotesList(data || []);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setIsLoadingNotes(false);
        }
    };

    const fetchTasks = async () => {
        try {
            setIsLoadingTasks(true);
            const token = localStorage.getItem('admin_token');
            // getTasks(token, skip, limit)
            const data = await Api.getTasks(token);
            setTasksList(data || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setIsLoadingTasks(false);
        }
    };

    // Actions
    const handleAddNote = async (e) => {
        if (e) e.preventDefault();
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('admin_token');
            // Api.addNote signature: (data, token)
            await Api.addNote({
                lead_id: leadId,
                title: noteTitle,
                content: noteContent
            }, token);
            toast.success('Note added successfully');
            setNoteTitle('');
            setNoteContent('');
            setIsAddingNote(false);
            fetchNotes();
        } catch (error) {
            toast.error('Failed to add note');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!window.confirm('Are you sure you want to delete this note?')) return;
        try {
            const token = localStorage.getItem('admin_token');
            // Api.deleteNote signature: (id, token)
            await Api.deleteNote(noteId, token);
            toast.success('Note deleted');
            fetchNotes();
        } catch (error) {
            toast.error('Failed to delete note');
        }
    };

    const handleAddTask = async (e) => {
        if (e) e.preventDefault();
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('admin_token');
            // Api.addTask signature: (data, token)
            await Api.addTask({
                lead_id: leadId,
                task_name: taskName,
                due_date: taskDueDate,
                status: taskStatus,
                description: taskDescription
            }, token);
            toast.success('Task created successfully');
            setTaskName('');
            setTaskDueDate('');
            setTaskStatus('To Do');
            setTaskDescription('');
            setIsAddingTask(false);
            fetchTasks();
        } catch (error) {
            toast.error('Failed to create task');
        } finally {
            setIsSubmitting(false);
        }
    };

    // UI Logic (Moved here for leaner component)
    const getSocialLinks = () => {
        const links = [];
        const extractSocialLinksRecursively = (obj) => {
            if (!obj || typeof obj !== 'object') return;
            Object.entries(obj).forEach(([key, value]) => {
                if (typeof value === 'string' && (
                    value.includes('linkedin.com') ||
                    value.includes('twitter.com') ||
                    value.includes('facebook.com') ||
                    value.includes('instagram.com') ||
                    value.includes('youtube.com') ||
                    value.includes('github.com') ||
                    key.toLowerCase().includes('social') ||
                    key.toLowerCase().includes('linkedin')
                )) {
                    if (value.startsWith('http') && !links.includes(value)) {
                        links.push(value);
                    }
                } else if (typeof value === 'object') {
                    extractSocialLinksRecursively(value);
                }
            });
        };
        extractSocialLinksRecursively(leads);
        return links;
    };

    const getHostname = (url) => {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch (e) {
            return url;
        }
    };

    const getDerivedData = () => {
        const contactInfo = leads || {};

        // --- SUPER SCANNER: Finds fields at any depth ---
        const discovered = {
            ratingVal: '0.0',
            phoneStr: '',
            websiteStr: '',
            source: '',
            owner: '',
            audienceName: '',
            icpScore: ''
        };

        const recursiveScanner = (ob) => {
            if (!ob || typeof ob !== 'object') return;

            // Handle arrays
            if (Array.isArray(ob)) {
                ob.forEach(item => recursiveScanner(item));
                return;
            }

            for (const key in ob) {
                const val = ob[key];
                const lowKey = key.toLowerCase();

                // 1. Rating
                if ((lowKey.includes('rating') || lowKey.includes('star')) && !lowKey.includes('id') && val) {
                    if (typeof val === 'number' || (typeof val === 'string' && !isNaN(parseFloat(val)))) {
                        discovered.ratingVal = String(val);
                    } else if (typeof val === 'object' && val.value) {
                        discovered.ratingVal = String(val.value);
                    }
                }

                // 2. Phone
                if ((lowKey.includes('phone') || lowKey.includes('mobile') || lowKey.includes('contact_no') || lowKey.includes('telephone') || lowKey.includes('contact_number') || lowKey.includes('mobilenumber') || lowKey.includes('cell') || lowKey.includes('tel') || lowKey.includes('office')) && val) {
                    if (typeof val === 'string' && val.length > 5 && /[\d]/.test(val)) {
                        discovered.phoneStr = val;
                    } else if (typeof val === 'object' && !Array.isArray(val)) {
                        // Check nested properties within phone object
                        const possiblePhoneValue = val.number || val.value || val.contact || val.phone || val.mobile || val.formatted || val.international;
                        if (typeof possiblePhoneValue === 'string' && possiblePhoneValue.length > 5 && /[\d]/.test(possiblePhoneValue)) {
                            discovered.phoneStr = possiblePhoneValue;
                        }
                    }
                }

                // 3. Website
                if ((lowKey.includes('website') || lowKey.includes('url') || lowKey.includes('domain')) && typeof val === 'string' && val.includes('.') && !discovered.socialLinks?.includes(val)) {
                    if (!val.includes('linkedin.com') && !val.includes('twitter.com') && !val.includes('facebook.com')) {
                        discovered.websiteStr = val;
                    }
                }

                // 4. Source
                if (lowKey.includes('source') && typeof val === 'string' && val.length > 2) {
                    discovered.source = val;
                }

                // 5. Owner
                if ((lowKey.includes('owner') || lowKey.includes('assigned')) && typeof val === 'string' && val.length > 2) {
                    discovered.owner = val;
                }

                // 6. Audience Name
                if ((lowKey.includes('audience_name') || lowKey.includes('audiencename') || lowKey.includes('audiance_name') || lowKey.includes('audiancename') || lowKey.includes('audience_id')) && val) {
                    const audName = typeof val === 'object' ? (val.audience_name || val.audiance_name || val.name) : val;
                    if (typeof audName === 'string' && audName.length > 2) {
                        discovered.audienceName = audName;
                    }
                }

                // 7. ICP Score
                if ((lowKey.includes('icp_score') || lowKey.includes('fit_score') || lowKey.includes('match_score') || lowKey.includes('icp_match')) && val) {
                    if (typeof val === 'number' || typeof val === 'string') {
                        discovered.icpScore = String(val);
                    }
                }

                // Recurse
                if (val && typeof val === 'object') {
                    recursiveScanner(val);
                }
            }
        };

        recursiveScanner(contactInfo);

        return {
            businessName: extractString(getDeepField(contactInfo, ['business_name', 'BusinessName', 'company_name', 'name', 'Business Name', 'organization', 'trade_name', 'Company', 'brand_name', 'Business_Name']), 'N/A'),
            contactName: extractString(getDeepField(contactInfo, ['full_name', 'contact_name', 'contact_person', 'owner_name', 'name', 'Contact Name', 'Full Name', 'OwnerName', 'ContactPerson', 'ownerName', 'first_name', 'last_name']), 'N/A'),
            category: extractString(getDeepField(contactInfo, ['category', 'industry', 'business_type', 'Industry', 'niche', 'sector', 'business_category', 'business_category_name']), 'N/A'),
            locationStr: extractString(getDeepField(contactInfo, ['location', 'address', 'Address', 'full_address', 'formatted_address', 'city', 'Location', 'City', 'full_location', 'physical_address']), 'N/A'),
            phoneStr: discovered.phoneStr || extractString(getDeepField(contactInfo, ['phone', 'phone_number', 'mobile', 'MobileNumber', 'contact_number', 'Phone', 'work_phone', 'contact_phone', 'telephone', 'mobile_no', 'contact_no', 'Mobile', 'contact_mobile', 'phoneNumber']), 'N/A'),
            websiteStr: discovered.websiteStr || extractString(getDeepField(contactInfo, ['website', 'website_url', 'domain', 'url', 'Website', 'site_url', 'home_page', 'homepage', 'web']), 'N/A'),
            ratingVal: discovered.ratingVal !== '0.0' ? discovered.ratingVal : (getDeepField(contactInfo, ['rating', 'google_rating', 'Rating', 'stars', 'star_rating', 'google_map_rating', 'average_rating', 'score', 'googleRating', 'avg_rating']) || '0.0'),
            source: discovered.source || (getDeepField(contactInfo, ['source', 'lead_source', 'Lead Source', 'source_job', 'origin']) || 'Manual / Imported'),
            socialLinks: getSocialLinks(),
            emailsArray: (() => {
                const emailsField = getDeepField(contactInfo, ['emails', 'email_addresses', 'emails_found', 'email', 'Email', 'contact_emails', 'personal_email', 'work_email', 'email1', 'email2']);
                if (Array.isArray(emailsField)) return emailsField.map(e => String(e).trim()).filter(Boolean);
                if (typeof emailsField === 'string') return emailsField.split(',').map(s => s.trim()).filter(Boolean);
                return emailsField ? [String(emailsField).trim()] : [];
            })(),
            audienceName: discovered.audienceName || leads?.audience_id?.audience_name || leads?.audience_id?.audiance_name || leads?.audiance_name || leads?.audience_name || 'Individual Prospect',
            icpScore: discovered.icpScore || leads?.icp_score || leads?.fit_score || 'N/A',
            leadStage: leads?.stage || leads?.status || leads?.job_status || 'New Prospect',
            leadTitle: leads?.title || leads?.job_title || leads?.position || 'Lead Profile',
            leadOwner: discovered.owner || (leads?.owner || leads?.assigned_to || leads?.owner_name || 'Account Executive')
        };
    };

    return {
        // States
        activeTab,
        setActiveTab,
        leads,
        summaryData,
        isLoadingSummary,
        poiDetails,
        isLoadingPoi,
        messagesData,
        isLoadingMessages,
        activityLogs,
        isLoadingActivity,
        notesList,
        isLoadingNotes,
        tasksList,
        isLoadingTasks,
        isLoadingContactInfo,

        // Form States
        isAddingNote, setIsAddingNote,
        noteTitle, setNoteTitle,
        noteContent, setNoteContent,
        isAddingTask, setIsAddingTask,
        taskName, setTaskName,
        taskDueDate, setTaskDueDate,
        taskStatus, setTaskStatus,
        taskDescription, setTaskDescription,
        isSubmitting,

        // Actions
        handleAddNote,
        handleDeleteNote,
        handleAddTask,

        // UI Utils
        getHostname,
        derivedData: getDerivedData()
    };
};

export default useSingleAudience;
