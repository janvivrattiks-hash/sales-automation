import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Api from '../../scripts/Api';
import { findField, extractString } from '../utils/dataHelpers.jsx';

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
    const [messagesData, setMessagesData] = useState(null);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [activityLogs, setActivityLogs] = useState([]);
    const [isLoadingActivity, setIsLoadingActivity] = useState(false);
    const [notesList, setNotesList] = useState([]);
    const [isLoadingNotes, setIsLoadingNotes] = useState(false);
    const [tasksList, setTasksList] = useState([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);

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
        fetchSummary();
        fetchMessages();
        fetchActivity();
        fetchNotes();
        fetchTasks();
    }, [leadId]);

    // Fetching Logic
    const fetchSummary = async () => {
        try {
            setIsLoadingSummary(true);
            const token = localStorage.getItem('admin_token');
            // getSummary(id, token)
            const data = await Api.getSummary(leadId, token);
            setSummaryData(data);
        } catch (error) {
            console.error('Error fetching summary:', error);
        } finally {
            setIsLoadingSummary(false);
        }
    };

    const fetchMessages = async () => {
        try {
            setIsLoadingMessages(true);
            const token = localStorage.getItem('admin_token');
            // generateMessagesStrategy(businessId, token)
            const data = await Api.generateMessagesStrategy(leadId, token);
            setMessagesData(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const fetchActivity = async () => {
        try {
            setIsLoadingActivity(true);
            const token = localStorage.getItem('admin_token');
            // getEmailActivityStatus(token, id)
            const data = await Api.getEmailActivityStatus(token, leadId);
            setActivityLogs(data || []);
        } catch (error) {
            console.error('Error fetching activity:', error);
        } finally {
            setIsLoadingActivity(false);
        }
    };

    const fetchNotes = async () => {
        try {
            setIsLoadingNotes(true);
            const token = localStorage.getItem('admin_token');
            // getNotes(token) - This API doesn't seem to take an ID? 
            // In Api.jsx it's /contact_managment/notes/
            const data = await Api.getNotes(token);
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
            await Api.addNote(token, {
                lead_id: leadId,
                title: noteTitle,
                content: noteContent
            });
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
            await Api.deleteNote(token, noteId);
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
            await Api.addTask(token, {
                lead_id: leadId,
                task_name: taskName,
                due_date: taskDueDate,
                status: taskStatus,
                description: taskDescription
            });
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
        return {
            businessName: extractString(findField(contactInfo, ['business_name', 'company_name', 'name', 'Business Name', 'organization']), 'N/A'),
            contactName: extractString(findField(contactInfo, ['full_name', 'contact_name', 'name', 'Contact Name', 'Full Name']), 'N/A'),
            category: extractString(findField(contactInfo, ['category', 'industry', 'business_type', 'Industry']), 'N/A'),
            locationStr: extractString(findField(contactInfo, ['location', 'address', 'city', 'Location', 'City']), 'N/A'),
            phoneStr: extractString(findField(contactInfo, ['phone', 'phone_number', 'contact_number', 'Phone']), 'N/A'),
            websiteStr: extractString(findField(contactInfo, ['website', 'domain', 'url', 'Website']), 'N/A'),
            ratingVal: findField(contactInfo, ['rating', 'google_rating', 'Rating', 'stars']) || '0.0',
            source: findField(contactInfo, ['source', 'lead_source', 'Lead Source']) || 'Manual / Imported',
            socialLinks: getSocialLinks(),
            emailsArray: (() => {
                const emailsField = findField(contactInfo, ['emails', 'email_addresses', 'email', 'Email']);
                return Array.isArray(emailsField) ? emailsField : (emailsField ? [emailsField] : []);
            })(),
            audienceName: leads?.audience_id?.audience_name || 'Individual Prospect',
            icpScore: leads?.icp_score || leads?.fit_score || 'N/A',
            leadStage: leads?.stage || leads?.status || 'New Prospect',
            leadTitle: leads?.title || leads?.job_title,
            owner: leads?.owner
        };
    };

    return {
        // States
        activeTab,
        setActiveTab,
        leads,
        summaryData,
        isLoadingSummary,
        messagesData,
        isLoadingMessages,
        activityLogs,
        isLoadingActivity,
        notesList,
        isLoadingNotes,
        tasksList,
        isLoadingTasks,
        
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
