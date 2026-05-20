import { useState } from 'react';
import { File, Folder, Upload, Download, Trash2, Eye, Search, Filter, Clock, FileText, Image, Archive } from 'lucide-react';

interface Document {
  id: number;
  name: string;
  type: 'pdf' | 'doc' | 'xlsx' | 'image' | 'zip';
  size: number;
  category: string;
  uploadedBy: string;
  uploadDate: string;
  version: number;
  status: 'Draft' | 'Final' | 'Reviewed';
  proposalId?: number;
}

const mockDocuments: Document[] = [
  { id: 1, name: 'Research_Proposal_v3.pdf', type: 'pdf', size: 2456789, category: 'Proposal', uploadedBy: 'Dr. Nguyễn Văn A', uploadDate: '2026-05-10', version: 3, status: 'Final', proposalId: 1 },
  { id: 2, name: 'Budget_Breakdown.xlsx', type: 'xlsx', size: 456123, category: 'Budget', uploadedBy: 'Dr. Nguyễn Văn A', uploadDate: '2026-05-10', version: 2, status: 'Final', proposalId: 1 },
  { id: 3, name: 'Literature_Review.doc', type: 'doc', size: 1234567, category: 'Research', uploadedBy: 'Dr. Trần Thị B', uploadDate: '2026-05-08', version: 1, status: 'Draft', proposalId: 2 },
  { id: 4, name: 'System_Architecture.png', type: 'image', size: 789456, category: 'Design', uploadedBy: 'Dr. Lê Văn C', uploadDate: '2026-05-05', version: 1, status: 'Reviewed', proposalId: 3 },
  { id: 5, name: 'Project_Data.zip', type: 'zip', size: 5678901, category: 'Dataset', uploadedBy: 'Dr. Phạm Thị D', uploadDate: '2026-05-03', version: 1, status: 'Final', proposalId: 4 },
  { id: 6, name: 'Review_Comments_v2.pdf', type: 'pdf', size: 345678, category: 'Review', uploadedBy: 'Dr. Hoàng Văn E', uploadDate: '2026-05-02', version: 2, status: 'Final', proposalId: 1 },
];

const categories = ['All', 'Proposal', 'Budget', 'Research', 'Design', 'Dataset', 'Review'];

export default function DocumentRepository() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
      case 'doc': return <FileText className="w-8 h-8 text-blue-500" />;
      case 'xlsx': return <FileText className="w-8 h-8 text-green-500" />;
      case 'image': return <Image className="w-8 h-8 text-purple-500" />;
      case 'zip': return <Archive className="w-8 h-8 text-yellow-500" />;
      default: return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Final': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      case 'Reviewed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Document Repository</h2>
          <p className="text-gray-500 mt-1">Manage research documents and files</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
          <Upload className="w-5 h-5" />
          Upload Document
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Documents</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{documents.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Size</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {formatFileSize(documents.reduce((sum, d) => sum + d.size, 0))}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Categories</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{categories.length - 1}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Recent Uploads</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {documents.filter(d => {
              const daysDiff = Math.floor((Date.now() - new Date(d.uploadDate).getTime()) / (1000 * 60 * 60 * 24));
              return daysDiff <= 7;
            }).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* Documents Display */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Document</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Size</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Uploaded By</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Version</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDocs.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(doc.type)}
                      <div>
                        <p className="font-medium text-gray-800">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.type.toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{formatFileSize(doc.size)}</td>
                  <td className="px-6 py-4 text-gray-600">{doc.uploadedBy}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Clock className="w-4 h-4" />
                      {new Date(doc.uploadDate).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium">
                      v{doc.version}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocs.map(doc => (
            <div key={doc.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                  {getFileIcon(doc.type)}
                </div>
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{doc.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium mb-3 ${getStatusColor(doc.status)}`}>
                  {doc.status}
                </span>
                <p className="text-sm text-gray-600 mb-1">{formatFileSize(doc.size)}</p>
                <p className="text-xs text-gray-500 mb-4">v{doc.version}</p>
                <div className="flex items-center gap-2 w-full">
                  <button className="flex-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    <Eye className="w-4 h-4 mx-auto" />
                  </button>
                  <button className="flex-1 p-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                    <Download className="w-4 h-4 mx-auto" />
                  </button>
                  <button className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Storage Usage */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-4">Storage Usage by Category</h3>
        <div className="space-y-3">
          {categories.filter(c => c !== 'All').map(category => {
            const categoryDocs = documents.filter(d => d.category === category);
            const totalSize = categoryDocs.reduce((sum, d) => sum + d.size, 0);
            const allDocsSize = documents.reduce((sum, d) => sum + d.size, 0);
            const percentage = (totalSize / allDocsSize) * 100;

            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{category}</span>
                  <span className="text-sm text-gray-600">{formatFileSize(totalSize)} ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
