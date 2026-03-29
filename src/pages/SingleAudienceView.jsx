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
    const { leadData, fromTab } = location.state || {};
    const leadId = leadData?.id || leadData?._id;

    const {
        activeTab,
        setActiveTab,
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
        handleDeleteNote,
        handleAddTask,
        getHostname,
        derivedData
    } = useSingleAudience(leadId, leadData);

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
        { id: 'summary', label: 'Strategy Summary' },
        { id: 'messages', label: 'Outreach Scripts' },
        { id: 'activity', label: 'Recent Activity' },
        { id: 'notes', label: 'Personal Notes' },
        { id: 'tasks', label: 'Tasks' },
    ];

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
                            leadOwner={derivedData.owner}
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
                                    handleDeleteNote={handleDeleteNote}
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
