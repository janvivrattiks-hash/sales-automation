import React from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    ExternalLink,
    Linkedin,
    Twitter,
    Facebook,
    Instagram,
    Youtube,
    Github
} from 'lucide-react';

// Modular Components
import SingleAudienceHeader from '../components/singleAudience/SingleAudienceHeader';
import SingleAudienceSidebar from '../components/singleAudience/SingleAudienceSidebar';
import SingleAudienceTabs from '../components/singleAudience/SingleAudienceTabs';
import SummaryTab from '../components/singleAudience/SummaryTab';
import MessagesTab from '../components/singleAudience/MessagesTab';
import ActivityTab from '../components/singleAudience/ActivityTab';
import NotesTab from '../components/singleAudience/NotesTab';
import TasksTab from '../components/singleAudience/TasksTab';

// Hooks
import useSingleAudience from '../hooks/useSingleAudience.jsx';

const SingleAudienceView = () => {
    const location = useLocation();
    // AudienceDetails navigates with { singleLead, audience } — support both keys
    const leadData = location.state?.singleLead || location.state?.leadData || null;
    const audienceData = location.state?.audience || location.state?.selectedAudience || null;
    const fromTab = location.state?.fromTab || null;
    const leadId = leadData?.id || leadData?._id || leadData?.result_id || leadData?.business_information_id;

    const {
        activeTab,
        setActiveTab,
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
        isAddingNote, setIsAddingNote,
        noteTitle, setNoteTitle,
        noteContent, setNoteContent,
        isAddingTask, setIsAddingTask,
        taskName, setTaskName,
        taskDueDate, setTaskDueDate,
        taskStatus, setTaskStatus,
        taskDescription, setTaskDescription,
        isSubmitting,
        handleAddNote,
        openDeleteModal,
        confirmDeleteNote,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        handleTriggerReminders,
        isTriggeringReminders,
        handleAddTask,
        handleDeleteLead,
        getHostname,
        derivedData
    } = useSingleAudience(leadId, leadData, audienceData);

    const renderSocialIcon = (url) => {
        const host = getHostname(url).toLowerCase();
        if (host.includes('linkedin')) return <Linkedin size={14} />;
        if (host.includes('twitter') || host.includes('x.com')) return <Twitter size={14} />;
        if (host.includes('facebook')) return <Facebook size={14} />;
        if (host.includes('instagram')) return <Instagram size={14} />;
        if (host.includes('youtube')) return <Youtube size={14} />;
        if (host.includes('github')) return <Github size={14} />;
        return <ExternalLink size={14} />;
    };

    const tabs = [
        { id: 'summary', label: 'Summary' },
        { id: 'messages', label: 'Message & Strategy' },
        { id: 'activity', label: 'Activity' },
        { id: 'notes', label: 'Notes & Comments' },
        { id: 'tasks', label: 'Tasks & Actions' },
    ];

    // Global pre-loader to hide empty/shimmer UI while POST/GET sequences are executing
    const isCoreDataLoading = isLoadingContactInfo || isLoadingSummary;

    if (isCoreDataLoading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-5">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-primary animate-spin opacity-80"></div>
                    <div className="h-16 w-16 rounded-full border-r-4 border-l-4 border-blue-200 animate-spin absolute inset-0 animation-delay-150"></div>
                </div>
                <div className="text-center space-y-1">
                    <p className="text-sm font-bold text-gray-700 tracking-wider">Acquiring Prospect Intelligence</p>
                    <p className="text-[10px] font-extrabold uppercase text-gray-400 tracking-widest animate-pulse">Running Background Process...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">

                <SingleAudienceHeader
                    contactName={derivedData.contactName}
                    businessName={derivedData.businessName}
                    audienceName={derivedData.audienceName}
                    category={derivedData.category}
                    icpScore={derivedData.icpScore}
                    leadStage={derivedData.leadStage}
                    leadTitle={derivedData.leadTitle}
                    fromTab={fromTab}
                    onDelete={handleDeleteLead}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Sidebar */}
                    <div className="lg:col-span-3 space-y-6">
                        <SingleAudienceSidebar
                            businessName={derivedData.businessName}
                            contactName={derivedData.contactName}
                            category={derivedData.category}
                            locationStr={derivedData.locationStr}
                            phoneStr={derivedData.phoneStr}
                            emailsArray={derivedData.emailsArray}
                            websiteStr={derivedData.websiteStr}
                            socialLinks={derivedData.socialLinks}
                            ratingVal={derivedData.ratingVal}
                            source={derivedData.source}
                            leadOwner={derivedData.leadOwner}
                            isLoadingContactInfo={isLoadingContactInfo}
                            renderSocialIcon={renderSocialIcon}
                            getHostname={getHostname}
                        />
                    </div>

                    {/* Right Column: Dynamic Content Tabs */}
                    <div className="lg:col-span-9 h-[calc(100vh-250px)] min-h-[600px]">
                        <SingleAudienceTabs
                            tabs={tabs}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        >
                            {activeTab === 'summary' && (
                                <SummaryTab
                                    summaryData={summaryData}
                                    isLoadingSummary={isLoadingSummary}
                                    poiDetails={poiDetails}
                                    isLoadingPoi={isLoadingPoi}
                                    icpScore={derivedData.icpScore}
                                    leadId={leadId}
                                    contactInfo={leadData}
                                />
                            )}

                            {activeTab === 'messages' && (
                                <MessagesTab
                                    messagesData={messagesData}
                                    isLoadingMessages={isLoadingMessages}
                                    contactName={derivedData.contactName}
                                    businessName={derivedData.businessName}
                                    emailsArray={derivedData.emailsArray}
                                    phoneStr={derivedData.phoneStr}
                                />
                            )}

                            {activeTab === 'activity' && (
                                <ActivityTab
                                    activityLogs={activityLogs}
                                    isLoadingActivity={isLoadingActivity}
                                />
                            )}

                            {activeTab === 'notes' && (
                                <NotesTab
                                    notesList={notesList}
                                    isLoadingNotes={isLoadingNotes}
                                    isAddingNote={isAddingNote}
                                    setIsAddingNote={setIsAddingNote}
                                    noteTitle={noteTitle}
                                    setNoteTitle={setNoteTitle}
                                    noteContent={noteContent}
                                    setNoteContent={setNoteContent}
                                    isSubmitting={isSubmitting}
                                    handleAddNote={handleAddNote}
                                    openDeleteModal={openDeleteModal}
                                    confirmDeleteNote={confirmDeleteNote}
                                    isDeleteDialogOpen={isDeleteDialogOpen}
                                    setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                                />
                            )}

                            {activeTab === 'tasks' && (
                                <TasksTab
                                    tasksList={tasksList}
                                    isLoadingTasks={isLoadingTasks}
                                    isAddingTask={isAddingTask}
                                    setIsAddingTask={setIsAddingTask}
                                    taskName={taskName}
                                    setTaskName={setTaskName}
                                    taskDueDate={taskDueDate}
                                    setTaskDueDate={setTaskDueDate}
                                    taskStatus={taskStatus}
                                    setTaskStatus={setTaskStatus}
                                    taskDescription={taskDescription}
                                    setTaskDescription={setTaskDescription}
                                    isSubmitting={isSubmitting}
                                    handleAddTask={handleAddTask}
                                    handleTriggerReminders={handleTriggerReminders}
                                    isTriggeringReminders={isTriggeringReminders}
                                />
                            )}
                        </SingleAudienceTabs>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={true} />
        </div>
    );
};

export default SingleAudienceView;
