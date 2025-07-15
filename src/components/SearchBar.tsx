import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertTriangle, CheckCircle } from 'lucide-react';
import { SearchFilters } from '../types';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  loading: boolean;
}

const SCAM_CATEGORIES = [
  'Online Fraud',
  'Bank Scam',
  'Freelance Scam',
  'Investment Scam',
  'Romance Scam',
  'Tech Support Scam',
  'Phone Scam',
  'Email Scam',
  'Other'
];

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, loading }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(filters);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters, onSearch]);

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto mb-8">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search scammers by name, phone number, or keyword..."
              value={filters.query}
              onChange={(e) => handleInputChange('query', e.target.value)}
              className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-lg"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            <Filter className="h-5 w-5" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="animate-slide-down">
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scam Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {SCAM_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
            <span className="ml-2 text-gray-600">Searching...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;