import React, { useState, useEffect } from 'react';
import { Shield, Eye, Check, X, Edit, Trash2, Phone, User, Tag, Calendar, Camera, ArrowLeft } from 'lucide-react';
import { ref, onValue, update, remove } from 'firebase/database';
import { database } from '../firebase';
import { ScammerReport } from '../types';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [reports, setReports] = useState<ScammerReport[]>([]);
  const [loading, setLoading] = useState(true);

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

  useEffect(() => {
    if (isAuthenticated) {
      const reportsRef = ref(database, 'reports');
      const unsubscribe = onValue(reportsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const reportsArray = Object.entries(data).map(([key, value]: [string, any]) => ({
            id: key,
            ...value
          }));
          setReports(reportsArray.sort((a, b) => b.createdAt - a.createdAt));
        } else {
          setReports([]);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword(''); // Clear password after successful login
    } else {
      alert('Invalid password');
      setPassword(''); // Clear password on failed login
    }
  };

  const handleApprove = async (reportId: string) => {
    try {
      const reportRef = ref(database, `reports/${reportId}`);
      await update(reportRef, {
        approved: true,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Error approving report:', error);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        const reportRef = ref(database, `reports/${reportId}`);
        await remove(reportRef);
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter admin password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const unapprovedReports = reports.filter(report => !report.approved);
  const approvedReports = reports.filter(report => report.approved);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Reports</h3>
            <p className="text-3xl font-bold text-blue-600">{reports.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Approval</h3>
            <p className="text-3xl font-bold text-orange-600">{unapprovedReports.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Approved</h3>
            <p className="text-3xl font-bold text-green-600">{approvedReports.length}</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pending Approval ({unapprovedReports.length})
            </h2>
            <div className="space-y-4">
              {unapprovedReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onApprove={handleApprove}
                  onDelete={handleDelete}
                  isPending={true}
                />
              ))}
              {unapprovedReports.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No pending reports
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Approved Reports ({approvedReports.length})
            </h2>
            <div className="space-y-4">
              {approvedReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onApprove={handleApprove}
                  onDelete={handleDelete}
                  isPending={false}
                />
              ))}
              {approvedReports.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No approved reports
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ReportCardProps {
  report: ScammerReport;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onApprove, onDelete, isPending }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className={`px-6 py-4 ${isPending ? 'bg-orange-50 border-b border-orange-200' : 'bg-green-50 border-b border-green-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-gray-600" />
            <span className={`font-semibold ${isPending ? 'text-orange-800' : 'text-green-800'}`}>
              {isPending ? 'Pending Review' : 'Approved'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isPending && (
              <button
                onClick={() => onApprove(report.id)}
                className="bg-green-600 text-white px-3 py-1 rounded-full text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
              >
                <Check className="h-4 w-4" />
                Approve
              </button>
            )}
            <button
              onClick={() => onDelete(report.id)}
              className="bg-red-600 text-white px-3 py-1 rounded-full text-sm hover:bg-red-700 transition-colors flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="font-semibold">{report.phoneNumber}</p>
              </div>
            </div>

            {report.name && (
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">{report.name}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                  {report.category}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="font-semibold">{new Date(report.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {report.description && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg text-sm">{report.description}</p>
              </div>
            )}

            {report.screenshots && report.screenshots.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-600">Screenshots</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {report.screenshots.map((screenshot, index) => (
                    <img
                      key={index}
                      src={screenshot}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(screenshot, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;