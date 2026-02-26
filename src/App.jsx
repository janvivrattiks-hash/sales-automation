import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';

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
// Simple placeholder components
const Reports = () => <div className="animate-in slide-in-from-bottom-4 duration-500 bg-white p-8 rounded-xl border border-gray-100"><h1 className="text-2xl font-bold text-gray-900 tracking-tight">Search Reports</h1><p className="text-gray-500 text-sm mt-1">Analysis and detailed results of your automated searches.</p></div>;
const Settings = () => <div className="animate-in slide-in-from-bottom-4 duration-500 bg-white p-8 rounded-xl border border-gray-100"><h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1><p className="text-gray-500 text-sm mt-1">Personalize your experience and manage account details.</p></div>;

const App = () => {

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="*"
        element={
          <MainLayout>
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
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Routes>
          </MainLayout>
        }
      />
    </Routes>
  );
};

export default App;
