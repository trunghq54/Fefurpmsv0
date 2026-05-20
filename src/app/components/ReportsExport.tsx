import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileBarChart, Calendar, Filter, CheckCircle } from 'lucide-react';

interface Report {
  id: number;
  name: string;
  description: string;
  type: 'pdf' | 'excel' | 'csv';
  category: string;
  icon: any;
}

const availableReports: Report[] = [
  {
    id: 1,
    name: 'Proposal Status Report',
    description: 'Comprehensive overview of all proposals with status, scores, and timelines',
    type: 'excel',
    category: 'Proposals',
    icon: FileSpreadsheet
  },
  {
    id: 2,
    name: 'Budget Allocation Summary',
    description: 'Detailed breakdown of budget allocation across all approved projects',
    type: 'pdf',
    category: 'Finance',
    icon: FileBarChart
  },
  {
    id: 3,
    name: 'Reviewer Performance Report',
    description: 'Analytics on reviewer activity, response times, and scoring patterns',
    type: 'excel',
    category: 'Reviews',
    icon: FileSpreadsheet
  },
  {
    id: 4,
    name: 'User Activity Log',
    description: 'Complete audit trail of all user actions and system activities',
    type: 'csv',
    category: 'Audit',
    icon: FileText
  },
  {
    id: 5,
    name: 'Meeting Minutes & Decisions',
    description: 'Summary of committee meetings, attendees, and decisions made',
    type: 'pdf',
    category: 'Meetings',
    icon: FileText
  },
  {
    id: 6,
    name: 'Research Output Metrics',
    description: 'Publications, citations, and impact metrics from funded projects',
    type: 'excel',
    category: 'Research',
    icon: FileBarChart
  },
  {
    id: 7,
    name: 'Department Performance Dashboard',
    description: 'Department-wise breakdown of proposals, approvals, and funding',
    type: 'pdf',
    category: 'Analytics',
    icon: FileBarChart
  },
  {
    id: 8,
    name: 'Timeline & Milestone Report',
    description: 'Project timelines, milestone completion rates, and delays',
    type: 'excel',
    category: 'Projects',
    icon: Calendar
  }
];

export default function ReportsExport() {
  const [selectedReports, setSelectedReports] = useState<number[]>([]);
  const [filters, setFilters] = useState({
    category: 'all',
    dateFrom: '',
    dateTo: '',
    format: 'all'
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleReportSelection = (reportId: number) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter(id => id !== reportId));
    } else {
      setSelectedReports([...selectedReports, reportId]);
    }
  };

  const handleGenerateReports = () => {
    setIsGenerating(true);
    setTimeout(() => {
      alert(`Successfully generated ${selectedReports.length} report(s)!`);
      setIsGenerating(false);
      setSelectedReports([]);
    }, 2000);
  };

  const filteredReports = availableReports.filter(report => {
    if (filters.category !== 'all' && report.category !== filters.category) return false;
    if (filters.format !== 'all' && report.type !== filters.format) return false;
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'excel': return '📊';
      case 'csv': return '📋';
      default: return '📁';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'bg-red-100 text-red-800';
      case 'excel': return 'bg-green-100 text-green-800';
      case 'csv': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = Array.from(new Set(availableReports.map(r => r.category)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reports & Export</h2>
          <p className="text-gray-500 mt-1">Generate and download comprehensive reports</p>
        </div>
        {selectedReports.length > 0 && (
          <button
            onClick={handleGenerateReports}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Generate {selectedReports.length} Report(s)
              </>
            )}
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Available Reports</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{availableReports.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Selected</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{selectedReports.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Categories</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{categories.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Last Generated</p>
          <p className="text-lg font-bold text-gray-800 mt-2">Today, 10:30 AM</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <select
              value={filters.format}
              onChange={(e) => setFilters({ ...filters, format: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Formats</option>
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
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
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReports.map(report => {
          const isSelected = selectedReports.includes(report.id);
          const Icon = report.icon;

          return (
            <div
              key={report.id}
              onClick={() => toggleReportSelection(report.id)}
              className={`relative bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              )}

              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Icon className={`w-8 h-8 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{report.name}</h3>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                    {getTypeIcon(report.type)} {report.type.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                    {report.category}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert(`Downloading ${report.name}...`);
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Report Builder */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-sm border border-blue-200 p-8">
        <div className="flex items-start gap-6">
          <div className="p-4 bg-blue-600 rounded-xl">
            <FileBarChart className="w-12 h-12 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Need a Custom Report?</h3>
            <p className="text-gray-700 mb-4">
              Build your own custom report with specific fields, filters, and visualizations tailored to your needs.
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
              Open Report Builder
            </button>
          </div>
        </div>
      </div>

      {/* Recent Exports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Recent Exports</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {[
            { name: 'Proposal_Status_Report_2026-05.xlsx', date: 'May 14, 2026 10:30 AM', size: '2.4 MB' },
            { name: 'Budget_Summary_Q2_2026.pdf', date: 'May 13, 2026 3:15 PM', size: '1.8 MB' },
            { name: 'User_Activity_May.csv', date: 'May 12, 2026 9:00 AM', size: '850 KB' }
          ].map((file, idx) => (
            <div key={idx} className="p-4 hover:bg-gray-50 transition flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-500">{file.date} • {file.size}</p>
                </div>
              </div>
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                <Download className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
