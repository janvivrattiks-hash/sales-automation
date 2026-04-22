import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Api from '../../scripts/Api';
import { findField, extractString, getDeepField } from '../utils/dataHelpers.jsx';

/**
 * Custom hook for managing Single Audience View logic.
 */
const useSingleAudience = (leadId, initialLeadData, initialAudience) => {
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
    const [isEditingTask, setIsEditingTask] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [taskName, setTaskName] = useState('');
    const [taskDueDate, setTaskDueDate] = useState('');
    const [taskStatus, setTaskStatus] = useState('To Do');
    const [taskDescription, setTaskDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteTaskDialogOpen, setIsDeleteTaskDialogOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    // Initial Fetch
    useEffect(() => {
        if (!leadId) return;
        
        const fetchAllData = async () => {
            // Sequential Contact Info (POST then GET)
            await processAndFetchContactInfo();

            // Parallel Summary execution (POST then GET) runs alongside the other parallel fetches
            processAndFetchSummary();
            
            // Only fetch POI Details; other tabs will be lazy loaded on click
            fetchPOIDetails();
        };

        fetchAllData();
    }, [leadId]);

    const processAndFetchContactInfo = async () => {
        try {
            setIsLoadingContactInfo(true);
            const token = localStorage.getItem('admin_token');
            // 1. Process API (POST)
            await Api.processContactInfo(leadId, token);
            // 2. Fetch API (GET)
            await fetchContactInfo();
        } catch (err) {
            console.error("Error in contact info processing sequence:", err);
            setIsLoadingContactInfo(false);
        }
    };

    const processAndFetchSummary = async () => {
        try {
            setIsLoadingSummary(true);
            const token = localStorage.getItem('admin_token');
            // 1. Process API (POST)
            await Api.processSummary(leadId, token);
            // 2. Fetch API (GET)
            await fetchSummary();
        } catch (err) {
            console.error("Error in summary processing sequence:", err);
            setIsLoadingSummary(false);
        }
    };

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

            // Try fetching latest CRM data for maximum detail coverage
            const crmData = await Api.getContactInfo(leadId, token);
            console.log('GET_CONTACT_INFO_RESULT:', crmData);

            if (crmData) {
                // Ensure we merge into existing state to preserve any local updates
                setLeads(prev => {
                    const updated = { ...(prev || {}), ...crmData };
                    // console.log('MERGED_LEAD_STATE_FINAL:', updated);
                    return updated;
                });
            }
        } catch (error) {
            console.warn('Full contact data fetch failed:', error?.message);
        } finally {
            setIsLoadingContactInfo(false);
        }
    };

    const fetchSummary = async () => {
        try {
            setIsLoadingSummary(true);
            const token = localStorage.getItem('admin_token');
            const data = await Api.getSummary(leadId, token);
            console.log('SUMMARY_API_RESPONSE:', data);
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
            console.log('MESSAGES_STRATEGY_API_RESPONSE:', data);
            setMessagesData(data || null);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setMessagesData(null);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const fetchActivity = async () => {
        console.log("Triggering fetchActivity API for leadId:", leadId);
        try {
            setIsLoadingActivity(true);
            const token = localStorage.getItem('admin_token');
            
            // 1. Fetch the history logs first
            const data = await Api.getGmailLeadHistory(leadId, token);
            console.log("fetchActivity (Gmail) Logs Fetched:", data);
            setActivityLogs(data || []);

            // 2. Sync open status for each activity individually (by activity ID)
            if (data && data.length > 0) {
                console.log("Syncing open status for each activity...");
                await Promise.all(
                    data.map(log => {
                        if (log.id) {
                            return Api.syncGmailOpenStatus(log.id, token);
                        }
                        return Promise.resolve();
                    })
                );
                
                // 3. Re-fetch after syncing to get updated timestamps/is_opened status
                const updatedData = await Api.getGmailLeadHistory(leadId, token);
                setActivityLogs(updatedData || []);
            }
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
            const data = await Api.getNotesByBusinessId(leadId, token);

            // 1. Ultimate Recursive Array Discovery
            const findArray = (obj) => {
                if (Array.isArray(obj)) return obj;
                if (!obj || typeof obj !== 'object') return null;
                for (const key in obj) {
                    const found = findArray(obj[key]);
                    if (found) return found;
                }
                return null;
            };

            const rawNotes = findArray(data) || [];

            setNotesList(rawNotes);
        } catch (error) {
            console.error('Error fetching notes:', error);
            setNotesList([]);
        } finally {
            setIsLoadingNotes(false);
        }
    };

    const [isTriggeringReminders, setIsTriggeringReminders] = useState(false);

    const handleTriggerReminders = async () => {
        try {
            setIsTriggeringReminders(true);
            const token = localStorage.getItem('admin_token');
            await Api.triggerTestReminders(token);
        } catch (error) {
            console.error('Error triggering reminders:', error);
        } finally {
            setIsTriggeringReminders(false);
        }
    };

    const fetchTasks = async () => {
        try {
            setIsLoadingTasks(true);
            const token = localStorage.getItem('admin_token');
            const data = await Api.getTasksByBusinessId(leadId, token);
            setTasksList(data || []);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setIsLoadingTasks(false);
        }
    };

    // Lazy load tab data when a user navigates to it
    useEffect(() => {
        console.log("Tab lazy loading trigger: activeTab =", activeTab, "leadId =", leadId);
        if (!leadId) return;

        switch (activeTab) {
            case 'messages':
                fetchMessages();
                break;
            case 'activity':
                fetchActivity();
                break;
            case 'notes':
                fetchNotes();
                break;
            case 'tasks':
                fetchTasks();
                break;
            default:
                break;
        }
    }, [activeTab, leadId]);

    const navigate = useNavigate();

    const handleDeleteLead = async () => {
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('admin_token');
            const audienceId = initialAudience?.id || initialAudience?.result_id || initialAudience?.audiance_id || initialAudience?.audience_id;
            
            console.log(`📡 Removing business ${leadId} from audience ${audienceId}`);
            const res = await Api.removeBusinessFromAudience(audienceId, leadId, token);
            if (res) {
                toast.success('Lead deleted successfully.');
                navigate(-1); // Safety redirection
                return true;
            } else {
                toast.error('Failed to delete lead.');
                return false;
            }
        } catch (error) {
            console.error('Error deleting lead:', error);
            toast.error('An error occurred while deleting the lead.');
            return false;
        } finally {
            setIsSubmitting(false);
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
                business_id: leadId,
                note_name: noteTitle,
                comments: noteContent
            }, token);
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

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);

    const openDeleteModal = (noteId) => {
        setNoteToDelete(noteId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteNote = async () => {
        if (!noteToDelete) return;
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('admin_token');
            await Api.deleteNote(noteToDelete, token);
            fetchNotes();
            setIsDeleteDialogOpen(false);
            setNoteToDelete(null);
        } catch (error) {
            toast.error('Failed to delete note');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddTask = async (e) => {
        if (e) e.preventDefault();
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('admin_token');
            
            const taskData = {
                business_id: leadId,
                task_name: taskName,
                due_date: taskDueDate,
                status: taskStatus,
                description: taskDescription
            };

            if (isEditingTask && taskToEdit) {
                await Api.updateTask(taskToEdit.id || taskToEdit._id, taskData, token);
            } else {
                await Api.addTask(taskData, token);
            }

            resetTaskForm();
            fetchTasks();
        } catch (error) {
            toast.error(isEditingTask ? 'Failed to update task' : 'Failed to create task');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openDeleteTaskModal = (task) => {
        setTaskToDelete(task);
        setIsDeleteTaskDialogOpen(true);
    };

    const confirmDeleteTask = async () => {
        if (!taskToDelete) return;
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('admin_token');
            await Api.deleteTask(taskToDelete.id || taskToDelete._id, token);
            fetchTasks();
            setIsDeleteTaskDialogOpen(false);
            setTaskToDelete(null);
        } catch (error) {
            toast.error('Failed to delete task');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditTask = (task) => {
        setTaskToEdit(task);
        setTaskName(task.task_name || '');
        setTaskDueDate(task.due_date || '');
        setTaskStatus(task.status || 'To Do');
        setTaskDescription(task.description || '');
        setIsEditingTask(true);
        setIsAddingTask(true);
    };

    const resetTaskForm = () => {
        setTaskName('');
        setTaskDueDate('');
        setTaskStatus('To Do');
        setTaskDescription('');
        setIsAddingTask(false);
        setIsEditingTask(false);
        setTaskToEdit(null);
    };

    // UI Logic (Moved here for leaner component)
    const getSocialLinks = () => {
        const links = [];
        const extractSocialLinksRecursively = (obj) => {
            if (!obj || typeof obj !== 'object') return;

            // Check known profiles object from analyze-raw
            const profiles = obj.social_media_profiles || obj.social_profiles || obj.profiles || {};
            Object.values(profiles).forEach(val => {
                if (typeof val === 'string' && val.includes('http')) {
                    if (!links.includes(val)) links.push(val);
                }
            });

            Object.entries(obj).forEach(([key, value]) => {
                if (typeof value === 'string' && (
                    value.includes('linkedin.com') ||
                    value.includes('twitter.com') ||
                    value.includes('x.com') ||
                    value.includes('facebook.com') ||
                    value.includes('instagram.com') ||
                    value.includes('youtube.com') ||
                    value.includes('github.com') ||
                    key.toLowerCase().includes('social') ||
                    key.toLowerCase().includes('linkedin')
                )) {
                    let finalUrl = value;
                    if (!value.startsWith('http') && (value.includes('.') || value.includes('/'))) {
                        finalUrl = `https://${value.replace(/^\/\//, '')}`;
                    }
                    if (!links.includes(finalUrl)) {
                        links.push(finalUrl);
                    }
                } else if (typeof value === 'object' && key !== 'social_media_profiles') {
                    extractSocialLinksRecursively(value);
                }
            });
        };
        extractSocialLinksRecursively(leads);
        // Also check if social links exist in summary/poi
        if (summaryData) extractSocialLinksRecursively(summaryData);
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
        const bizInfo = contactInfo.business_information || contactInfo.business_info || {};
        const ctrInfo = contactInfo.contact_info || contactInfo.contact_details || {};

        // --- SUPER SCANNER: Finds fields at any depth ---
        const discovered = {
            ratingVal: '0.0',
            allPhones: [],
            websiteStr: '',
            sources: [], // Array to collect multiple sources
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
                    const addIfUnique = (p) => {
                        if (!p || typeof p !== 'string') return;
                        const digits = p.replace(/\D/g, '');
                        if (digits.length < 7) return; // Ignore very short numbers
                        const last10 = digits.slice(-10);
                        const isDup = discovered.allPhones.some(existing => {
                            const exDigits = existing.replace(/\D/g, '');
                            return exDigits.slice(-10) === last10;
                        });
                        if (!isDup) discovered.allPhones.push(p);
                    };

                    if (typeof val === 'string' && val.length > 5 && /[\d]/.test(val)) {
                        addIfUnique(val);
                    } else if (typeof val === 'object' && !Array.isArray(val)) {
                        const possiblePhoneValue = val.number || val.value || val.contact || val.phone || val.mobile || val.formatted || val.international || val.primary;
                        if (typeof possiblePhoneValue === 'string' && possiblePhoneValue.length > 5 && /[\d]/.test(possiblePhoneValue)) {
                            addIfUnique(possiblePhoneValue);
                        }
                    } else if (Array.isArray(val)) {
                        val.forEach(v => addIfUnique(v));
                    }
                }

                // 3. Website
                if ((lowKey.includes('website') || lowKey.includes('url') || lowKey.includes('domain')) && typeof val === 'string' && val.includes('.') && val.length > 4) {
                    if (!val.includes('linkedin.com') && !val.includes('twitter.com') && !val.includes('facebook.com')) {
                        discovered.websiteStr = val;
                    }
                }

                // 4. Source
                if ((lowKey.includes('source') || lowKey.includes('query_name') || lowKey.includes('niche') || lowKey.includes('search_query') || lowKey.includes('discovery_method') || lowKey.includes('extracted_from')) && val) {
                    if (typeof val === 'string' && val.length > 2) {
                        if (!discovered.sources.includes(val)) discovered.sources.push(val);
                    } else if (typeof val === 'object' && !Array.isArray(val)) {
                        const sub = val.name || val.value || val.query || val.niche || val.keyword || val.source;
                        if (typeof sub === 'string' && sub.length > 2) {
                            if (!discovered.sources.includes(sub)) discovered.sources.push(sub);
                        }
                    }
                }

                // 5. Owner/Lead Mapping
                if ((lowKey.includes('owner') || lowKey.includes('assigned') || lowKey.includes('admin_name') || lowKey.includes('handler') || lowKey.includes('lead_owner')) && typeof val === 'string' && val.length > 2) {
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
                if ((lowKey.includes('icp_score') || lowKey.includes('fit_score') || lowKey.includes('match_score') || lowKey.includes('icp_match') || lowKey.includes('suitability_score') || (lowKey === 'score')) && val) {
                    if (typeof val === 'number' || typeof val === 'string') {
                        discovered.icpScore = String(val);
                    }
                }

                // Recurse
                if (val && typeof val === 'object' && key !== 'social_media_profiles' && key !== 'contact_info') {
                    recursiveScanner(val);
                }
            }
        };

        recursiveScanner(contactInfo);
        if (summaryData) recursiveScanner(summaryData);

        // --- Final Field Normalization ---
        return {
            businessName: extractString(bizInfo.name || bizInfo.business_name || getDeepField(contactInfo, ['business_name', 'BusinessName', 'company_name', 'name', 'Business Name', 'organization', 'trade_name', 'Company', 'brand_name', 'Business_Name']), 'N/A'),
            contactName: (() => {
                const rawOwner = discovered.owner || getDeepField(contactInfo, ['lead_owner', 'main_owner', 'full_name', 'contact_name', 'contact_person', 'owner_name', 'name', 'Contact Name', 'Full Name', 'OwnerName', 'ContactPerson', 'ownerName', 'first_name', 'last_name']);
                if (!rawOwner) return 'N/A';
                // Split by common delimiters and take the first one
                const names = String(rawOwner).split(/[,;|]/).map(n => n.trim()).filter(Boolean);
                return names.length > 0 ? names[0] : 'N/A';
            })(),
            category: extractString(bizInfo.category || bizInfo.industry || getDeepField(contactInfo, ['category', 'industry', 'business_type', 'Industry', 'niche', 'sector', 'business_category', 'business_category_name']), 'N/A'),
            locationStr: extractString(bizInfo.full_address || bizInfo.address || getDeepField(contactInfo, ['location', 'address', 'Address', 'full_address', 'formatted_address', 'city', 'Location', 'City', 'full_location', 'physical_address']), 'N/A'),
            phoneStr: discovered.allPhones.length > 0 ? discovered.allPhones.join(', ') : extractString(bizInfo.phone || getDeepField(contactInfo, ['phone', 'phone_number', 'mobile', 'MobileNumber', 'contact_number', 'Phone', 'work_phone', 'contact_phone', 'telephone', 'mobile_no', 'contact_no', 'Mobile', 'contact_mobile', 'phoneNumber']), 'N/A'),
            allPhones: discovered.allPhones, // Also passing as array for dedicated rendering
            websiteStr: (() => {
                const raw = discovered.websiteStr || bizInfo.website || getDeepField(contactInfo, ['website', 'website_url', 'domain', 'url', 'Website', 'site_url', 'home_page', 'homepage', 'web']) || poiDetails?.website || poiDetails?.url;
                const isUrl = (val) => typeof val === 'string' && val.includes('.') && val.length > 5 && !['yes', 'no', 'true', 'false', 'unknown'].includes(val.toLowerCase().trim());
                return isUrl(raw) ? raw : '';
            })(),
            ratingVal: (() => {
                const raw = poiDetails?.rating || poiDetails?.Rating || (discovered.ratingVal !== '0.0' ? discovered.ratingVal : (bizInfo.rating || getDeepField(contactInfo, ['rating', 'google_rating', 'Rating', 'stars', 'star_rating', 'google_map_rating', 'average_rating', 'score', 'googleRating', 'avg_rating']) || '0.0'));
                if (raw === true || raw === 'yes' || raw === 'true') return '0.0';
                return String(raw);
            })(),
            source: discovered.sources.length > 0
                ? discovered.sources.join(', ')
                : (getDeepField(contactInfo, ['source', 'lead_source', 'Lead Source', 'source_job', 'origin', 'query_name', 'niche_or_keyword']) || 'Manual / Imported'),
            socialLinks: getSocialLinks(),
            emailsArray: (() => {
                const emailsFromCtr = ctrInfo.emails || ctrInfo.email_addresses || ctrInfo.emails_found || ctrInfo.business_emails;
                const fieldList = ['emails', 'email_addresses', 'emails_found', 'email', 'Email', 'business_emails', 'email_enrichment', 'contact_emails', 'personal_email', 'work_email', 'email1', 'email2', 'primary_email', 'biz_email', 'business_email', 'email_addr'];
                const emailsField = emailsFromCtr || getDeepField(contactInfo, fieldList) || getDeepField(poiDetails, fieldList);
                
                if (Array.isArray(emailsField)) return emailsField.map(e => String(e).trim()).filter(Boolean);
                if (typeof emailsField === 'string') return emailsField.split(',').map(s => s.trim()).filter(Boolean);
                return emailsField ? [String(emailsField).trim()] : [];
            })(),
            audienceName: discovered.audienceName || initialAudience?.audiance_name || initialAudience?.name || 'Individual Prospect',
            icpScore: discovered.icpScore || leads?.icp_score || leads?.fit_score || 'N/A',
            leadStage: leads?.stage || leads?.status || leads?.pipeline_stage || leads?.lead_status || 'New Prospect',
            leadTitle: leads?.title || leads?.job_title || leads?.position || leads?.job_position || 'Lead Profile',
            leadOwner: discovered.owner || (leads?.owner || leads?.assigned_to || 'Account Executive')
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

        // Tab actions
        fetchNotes,
        fetchTasks,
        fetchActivity,
        fetchMessages,

        // Actions
        handleAddNote,
        openDeleteModal,
        confirmDeleteNote,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        handleTriggerReminders,
        isTriggeringReminders,
        handleAddTask,
        openDeleteTaskModal,
        confirmDeleteTask,
        isDeleteTaskDialogOpen,
        taskToDelete,
        setIsDeleteTaskDialogOpen,
        handleEditTask,
        resetTaskForm,
        handleDeleteLead,
        isEditingTask,

        // UI Utils
        getHostname,
        derivedData: getDerivedData()
    };
};

export default useSingleAudience;
