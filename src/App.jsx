import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { useApp } from './context/AppContext';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import LeadGenerator from './pages/LeadGenerator';
import LeadDetails from './pages/LeadDetails';
import SearchHistory from './pages/SearchHistory';
import EnrichLeads from './pages/EnrichLeads';
import Contacts from './pages/Contacts';
import ICPManagement from './pages/ICPManagement';
import BusinessInfo from './pages/BusinessInfo';
import ReviewLeads from './pages/ReviewLeads';
import FinalEnrichedLeads from './pages/FinalEnrichedLeads';
import AudienceList from './pages/AudienceList';
import AudienceDetails from './pages/AudienceDetails';
import EditProfile from './pages/EditProfile';
import ContactDetails from './pages/ContactDetails';
import SingleAudienceView from './pages/SingleAudienceView';
import CreateICP from './pages/CreateICP';
import ICPDetails from './pages/ICPDetails';
import EditBusinessInfo from './pages/EditBusinessInfo';
import ScrollToTop from './utils/ScrollToTop';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Simple placeholder components
const Reports = () => <div className="animate-in slide-in-from-bottom-4 duration-500 bg-white p-8 rounded-xl border border-gray-100"><h1 className="text-2xl font-bold text-gray-900 tracking-tight">Search Reports</h1><p className="text-gray-500 text-sm mt-1">Analysis and detailed results of your automated searches.</p></div>;

const App = () => {
  const navigate = useNavigate();
  const { setAdminToken, setUser } = useApp();

  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem('admin_token');

    // Clear token from context
    setAdminToken(null);

    // Reset user to default
    setUser({ name: 'Loading...', role: 'User' });

    // Show success message
    console.log('Logged out successfully');

    // Navigate to login page
    setAdminToken(null);
    navigate('/');
  };

  return (
    <>
      <ScrollToTop />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/*"
          element={
            <MainLayout onLogout={handleLogout}>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="lead-generator" element={<LeadGenerator />} />
                <Route path="lead-details" element={<LeadDetails />} />
                <Route path="search-history" element={<SearchHistory />} />
                <Route path="enrich" element={<EnrichLeads />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="icp" element={<ICPManagement />} />
                <Route path="business" element={<BusinessInfo />} />
                <Route path="review-leads" element={<ReviewLeads />} />
                <Route path="final-leads" element={<FinalEnrichedLeads />} />
                <Route path="audience-list" element={<AudienceList />} />
                <Route path="audience-details" element={<AudienceDetails />} />
                <Route path="reports" element={<Reports />} />
                <Route path="edit-profile" element={<EditProfile />} />
                <Route path="contact-details" element={<ContactDetails />} />
                <Route path="single-audience-view" element={<SingleAudienceView />} />
                <Route path="create-icp" element={<CreateICP />} />
                <Route path="create-icp/:id" element={<CreateICP />} />
                <Route path="icp-details/:id" element={<ICPDetails />} />
                <Route path="edit-business-info" element={<EditBusinessInfo />} />
                {/* <Route path="settings" element={<Settings />} /> */}
              </Routes>
            </MainLayout>
          }
        />
      </Routes>
    </>
  );
};

export default App;
