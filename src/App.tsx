import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, Settings, Search, CheckCircle } from 'lucide-react';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { database } from './firebase';
import { ScammerReport, SearchFilters } from './types';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import ReportForm from './components/ReportForm';
import AdminPanel from './components/AdminPanel';

function App() {
  const [reports, setReports] = useState<ScammerReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<ScammerReport[]>([]);
  const [currentView, setCurrentView] = useState<'search' | 'admin'>('search');
  const [showReportForm, setShowReportForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(true); // Show all reports by default

  // Load approved reports from Firebase
  useEffect(() => {
    const reportsRef = ref(database, 'reports');
    const approvedQuery = query(reportsRef, orderByChild('approved'), equalTo(true));
    
    const unsubscribe = onValue(approvedQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const reportsArray = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value
        }));
        setReports(reportsArray);
        setFilteredReports(reportsArray); // Show all reports by default
      } else {
        setReports([]);
        setFilteredReports([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Search functionality
  const handleSearch = useCallback((filters: SearchFilters) => {
    if (!filters.query.trim() && !filters.category) {
      setFilteredReports(reports); // Show all reports when search is empty
      setHasSearched(true);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    // Simulate search delay for better UX
    setTimeout(() => {
      const query = filters.query.toLowerCase().trim();
      const filtered = reports.filter(report => {
        const matchesQuery = !query || 
          report.phoneNumber.toLowerCase().includes(query) ||
          report.name?.toLowerCase().includes(query) ||
          report.category.toLowerCase().includes(query);
        
        const matchesCategory = !filters.category || report.category === filters.category;
        
        return matchesQuery && matchesCategory;
      });

      setFilteredReports(filtered);
      setLoading(false);
    }, 300);
  }, [reports]);

  if (currentView === 'admin') {
    return <AdminPanel onBack={() => setCurrentView('search')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-red-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ScammerAlert</h1>
                <p className="text-sm text-gray-600">Protect your community from scammers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowReportForm(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Report Scammer
              </button>
              <button
                onClick={() => setCurrentView('admin')}
                className="text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-gray-100"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Verified Scammer Database
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Browse verified scammer reports or search by phone number, name, or scam type to protect yourself and your community.
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} loading={loading} />

        {/* Search Results */}
        <SearchResults 
          results={filteredReports} 
          hasSearched={hasSearched}
          loading={loading}
        />

        {/* Statistics */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">{reports.length}</div>
              <div className="text-gray-600">Verified Scammers</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                {reports.reduce((sum, report) => sum + report.reportCount, 0)}
              </div>
              <div className="text-gray-600">Total Reports</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                {reports.filter(report => report.screenshots?.length > 0).length}
              </div>
              <div className="text-gray-600">With Evidence</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 sm:p-8 text-white text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-4">Help Protect Your Community</h3>
          <p className="text-red-100 mb-6 max-w-2xl mx-auto">
            If you've been contacted by a scammer, report them to help protect others. Your report helps build a safer community for everyone.
          </p>
          <button
            onClick={() => setShowReportForm(true)}
            className="bg-white text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-50 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus className="h-5 w-5" />
            Report a Scammer
          </button>
        </div>
      </div>

      {/* Report Form Modal */}
      {showReportForm && (
        <ReportForm onClose={() => setShowReportForm(false)} />
      )}
    </div>
  );
}

export default App;