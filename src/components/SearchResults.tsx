import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Phone, User, Tag, Calendar, Camera, Search, X, ChevronRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import { ref, update } from 'firebase/database';
import { database } from '../firebase';
import { ScammerReport } from '../types';

interface SearchResultsProps {
  results: ScammerReport[];
  hasSearched: boolean;
  loading: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, hasSearched, loading }) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="text-center py-12">
        <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <p className="text-gray-600 text-lg">Enter a name, phone number, or keyword to search for scammers</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center shadow-sm">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">Clean – No Scammer Found</h3>
          <p className="text-green-700">No reports found matching your search criteria. This appears to be clean.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {results.length} Verified Scammer{results.length !== 1 ? 's' : ''} Found
        </h3>
        <p className="text-gray-600">Click on any card to view full details</p>
      </div>
      
      {/* 4x4 Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {results.map((report) => (
          <ScammerCard 
            key={report.id} 
            report={report}
            isExpanded={expandedCard === report.id}
            onToggle={() => setExpandedCard(expandedCard === report.id ? null : report.id)}
          />
        ))}
      </div>

      {/* Expanded Card Modal */}
      {expandedCard && (
        <ExpandedCardModal 
          report={results.find(r => r.id === expandedCard)!}
          onClose={() => setExpandedCard(null)}
        />
      )}
    </div>
  );
};

interface ScammerCardProps {
  report: ScammerReport;
  isExpanded: boolean;
  onToggle: () => void;
}

const ScammerCard: React.FC<ScammerCardProps> = ({ report, onToggle }) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  // Generate a simple user ID (in production, use proper user authentication)
  const getUserId = () => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', userId);
    }
    return userId;
  };

  const handleVote = async (voteType: 'yes' | 'no', e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion
    
    if (hasVoted || isVoting) return;
    
    setIsVoting(true);
    const userId = getUserId();
    
    try {
      const currentVotes = report.votes || { yes: 0, no: 0, voters: [] };
      
      // Check if user already voted
      if (currentVotes.voters.includes(userId)) {
        setHasVoted(true);
        setIsVoting(false);
        return;
      }

      const updatedVotes = {
        yes: voteType === 'yes' ? currentVotes.yes + 1 : currentVotes.yes,
        no: voteType === 'no' ? currentVotes.no + 1 : currentVotes.no,
        voters: [...currentVotes.voters, userId]
      };

      const reportRef = ref(database, `reports/${report.id}`);
      await update(reportRef, {
        votes: updatedVotes,
        updatedAt: Date.now()
      });

      setHasVoted(true);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const votes = report.votes || { yes: 0, no: 0, voters: [] };
  const totalVotes = votes.yes + votes.no;
  const yesPercentage = totalVotes > 0 ? (votes.yes / totalVotes) * 100 : 0;

  return (
    <div 
      className="bg-white rounded-lg shadow-md border border-red-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={onToggle}
    >
      {/* Alert Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-white" />
            <span className="text-white font-bold text-xs">SCAMMER</span>
          </div>
          <div className="bg-red-700 text-white px-2 py-1 rounded-full text-xs">
            {report.reportCount}
          </div>
        </div>
      </div>

      {/* Voting Section */}
      <div className="bg-amber-50 border-b border-amber-200 px-3 py-2">
        <p className="text-xs text-amber-800 font-medium mb-2">Is this scammer with you?</p>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => handleVote('yes', e)}
            disabled={hasVoted || isVoting}
            className="flex items-center gap-1 bg-red-100 hover:bg-red-200 disabled:bg-gray-100 text-red-700 disabled:text-gray-500 px-2 py-1 rounded-full text-xs font-medium transition-colors flex-1 justify-center"
          >
            <ThumbsUp className="h-3 w-3" />
            <span className="hidden xs:inline">Yes</span>
            <span className="ml-1">({votes.yes})</span>
          </button>
          <button
            onClick={(e) => handleVote('no', e)}
            disabled={hasVoted || isVoting}
            className="flex items-center gap-1 bg-green-100 hover:bg-green-200 disabled:bg-gray-100 text-green-700 disabled:text-gray-500 px-2 py-1 rounded-full text-xs font-medium transition-colors flex-1 justify-center"
          >
            <ThumbsDown className="h-3 w-3" />
            <span className="hidden xs:inline">No</span>
            <span className="ml-1">({votes.no})</span>
          </button>
        </div>
        {totalVotes > 0 && (
          <div className="mt-2">
            <div className="bg-gray-200 rounded-full h-1">
              <div 
                className="bg-red-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${yesPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1 text-center">
              {Math.round(yesPercentage)}% confirmed ({totalVotes} votes)
            </p>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3">
        {/* Phone Number - Most Important */}
        <div className="bg-red-50 rounded-md p-2 mb-3 border border-red-100">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-red-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-red-600 font-medium">Phone</p>
              <p className="font-bold text-sm text-red-800 break-all">{report.phoneNumber}</p>
            </div>
          </div>
        </div>

        {/* Name */}
        {report.name && (
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600">Name</p>
              <p className="font-semibold text-sm text-gray-900 truncate">{report.name}</p>
            </div>
          </div>
        )}

        {/* Category */}
        <div className="flex items-center gap-2 mb-2">
          <Tag className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-600">Type</p>
            <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium truncate max-w-full">
              {report.category}
            </span>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-600">Reported</p>
            <p className="text-xs text-gray-900">{new Date(report.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* View Details Button */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-3 w-3 flex-shrink-0" />
            <span className="text-xs font-medium">Verified</span>
          </div>
          <div className="flex items-center gap-1 text-blue-600">
            <span className="text-xs">Details</span>
            <ChevronRight className="h-3 w-3 flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface ExpandedCardModalProps {
  report: ScammerReport;
  onClose: () => void;
}

const ExpandedCardModal: React.FC<ExpandedCardModalProps> = ({ report, onClose }) => {

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-white" />
            <span className="text-white font-bold text-lg">SCAMMER DETAILS</span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-red-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Voting Results */}
        {votes.yes > 0 && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
            <h4 className="text-sm font-medium text-amber-800 mb-3">Community Confirmation</h4>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-red-700 mb-2">
                <ThumbsUp className="h-5 w-5" />
                <span className="font-bold text-lg">{votes.yes}</span>
              </div>
              <p className="text-sm text-red-600 font-medium">People confirmed this scammer</p>
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Phone Number */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm text-red-600 font-medium">Phone Number</p>
                    <p className="font-bold text-lg text-red-800 break-all">{report.phoneNumber}</p>
                  </div>
                </div>
              </div>

              {/* Name */}
              {report.name && (
                <div className="flex items-center gap-3 py-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-900">{report.name}</p>
                  </div>
                </div>
              )}

              {/* Category */}
              <div className="flex items-center gap-3 py-2">
                <Tag className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Scam Type</p>
                  <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium mt-1">
                    {report.category}
                  </span>
                </div>
              </div>

              {/* Date and Report Count */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 py-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Reported</p>
                    <p className="font-medium text-gray-900">{new Date(report.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <AlertTriangle className="h-5 w-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Reports</p>
                    <p className="font-medium text-gray-900">{report.reportCount}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Description */}
              {report.description && (
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-medium">Description</p>
                  <p className="text-gray-800 bg-gray-50 p-4 rounded-lg text-sm leading-relaxed">
                    {report.description}
                  </p>
                </div>
              )}

              {/* Screenshots */}
              {report.screenshots && report.screenshots.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Camera className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-600 font-medium">Evidence Screenshots</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {report.screenshots.map((screenshot, index) => (
                      <img
                        key={index}
                        src={screenshot}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(screenshot, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Verified Badge */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 bg-green-50 text-green-800 py-3 px-4 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Verified by Admin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;