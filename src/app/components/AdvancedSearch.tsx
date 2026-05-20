import { useState } from 'react';
import { Search, Filter, SlidersHorizontal, X, FileText, Users, MessageSquare, Calendar } from 'lucide-react';

interface SearchResult {
  id: number;
  type: 'proposal' | 'user' | 'document' | 'comment' | 'meeting';
  title: string;
  description: string;
  metadata: string;
  relevance: number;
}

const mockResults: SearchResult[] = [
  {
    id: 1,
    type: 'proposal',
    title: 'AI-Powered Chatbot for Education',
    description: 'Comprehensive AI chatbot system designed for educational contexts...',
    metadata: 'Dr. Nguyễn Văn A • Status: Approved • Score: 8.5',
    relevance: 95
  },
  {
    id: 2,
    type: 'proposal',
    title: 'Machine Learning for Student Performance',
    description: 'ML algorithms to predict and improve student learning outcomes...',
    metadata: 'Dr. Phạm Thị D • Status: Rejected • Score: 5.2',
    relevance: 88
  },
  {
    id: 3,
    type: 'document',
    title: 'Research_Proposal_v3.pdf',
    description: 'Latest version of the AI chatbot proposal with detailed methodology...',
    metadata: 'Uploaded by Dr. Nguyễn Văn A • 2.4 MB • May 10, 2026',
    relevance: 82
  },
  {
    id: 4,
    type: 'user',
    title: 'Dr. Hoàng Văn E',
    description: 'Reviewer specializing in AI and Machine Learning research...',
    metadata: 'Reviewer • Software Engineering Dept • 12 reviews completed',
    relevance: 75
  },
  {
    id: 5,
    type: 'comment',
    title: 'Review feedback on AI Chatbot proposal',
    description: 'The methodology section needs more detail on data collection...',
    metadata: 'Dr. Hoàng Văn E • May 12, 2026 • 5 likes',
    relevance: 70
  },
  {
    id: 6,
    type: 'meeting',
    title: 'Committee Meeting - AI Projects Review',
    description: 'Review session for AI and ML related research proposals...',
    metadata: 'May 20, 2026 at 14:00 • 3 reviewers assigned',
    relevance: 65
  }
];

export default function AdvancedSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    dateFrom: '',
    dateTo: '',
    status: 'all',
    department: 'all',
    minScore: '',
    maxScore: ''
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    // Simulate search delay
    setTimeout(() => {
      const filtered = mockResults.filter(result => {
        if (filters.type !== 'all' && result.type !== filters.type) return false;
        const matchesQuery = searchQuery === '' ||
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesQuery;
      });
      setResults(filtered);
      setIsSearching(false);
    }, 500);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'proposal': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'user': return <Users className="w-5 h-5 text-green-600" />;
      case 'document': return <FileText className="w-5 h-5 text-purple-600" />;
      case 'comment': return <MessageSquare className="w-5 h-5 text-orange-600" />;
      case 'meeting': return <Calendar className="w-5 h-5 text-teal-600" />;
      default: return <Search className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      proposal: 'bg-blue-100 text-blue-800',
      user: 'bg-green-100 text-green-800',
      document: 'bg-purple-100 text-purple-800',
      comment: 'bg-orange-100 text-orange-800',
      meeting: 'bg-teal-100 text-teal-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Advanced Search</h2>
        <p className="text-gray-500 mt-1">Search across proposals, users, documents, and more</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for proposals, users, documents, comments..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 border-2 rounded-lg font-medium transition ${
              showFilters
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </button>
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <Search className="w-5 h-5" />
            Search
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="proposal">Proposals</option>
                  <option value="user">Users</option>
                  <option value="document">Documents</option>
                  <option value="comment">Comments</option>
                  <option value="meeting">Meetings</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="all">All Departments</option>
                  <option value="se">Software Engineering</option>
                  <option value="ai">AI & Data Science</option>
                  <option value="cs">Computer Science</option>
                  <option value="is">Information Systems</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Score</label>
                <input
                  type="number"
                  value={filters.minScore}
                  onChange={(e) => setFilters({ ...filters, minScore: e.target.value })}
                  placeholder="0"
                  min="0"
                  max="10"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Score</label>
                <input
                  type="number"
                  value={filters.maxScore}
                  onChange={(e) => setFilters({ ...filters, maxScore: e.target.value })}
                  placeholder="10"
                  min="0"
                  max="10"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({
                    type: 'all',
                    dateFrom: '',
                    dateTo: '',
                    status: 'all',
                    department: 'all',
                    minScore: '',
                    maxScore: ''
                  })}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {isSearching ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Searching...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Found <span className="font-semibold text-gray-800">{results.length}</span> results
            </p>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
              <option>Sort by Relevance</option>
              <option>Sort by Date (Newest)</option>
              <option>Sort by Date (Oldest)</option>
              <option>Sort by Title (A-Z)</option>
            </select>
          </div>

          {results.map(result => (
            <div
              key={result.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  {getTypeIcon(result.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-800">{result.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(result.type)}`}>
                        {result.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="font-medium">{result.relevance}%</span>
                      <span className="text-xs">relevance</span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{result.description}</p>
                  <p className="text-sm text-gray-500">{result.metadata}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : searchQuery || Object.values(filters).some(v => v !== 'all' && v !== '') ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No results found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your search terms or filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Start searching</p>
          <p className="text-gray-500 text-sm mt-2">Enter keywords to search across all content</p>
        </div>
      )}
    </div>
  );
}
