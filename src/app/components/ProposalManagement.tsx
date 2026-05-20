import { useState } from 'react';
import { Filter, Download, Eye, MessageSquare, Clock, DollarSign, TrendingUp } from 'lucide-react';

interface Proposal {
  id: number;
  title: string;
  pi: string;
  category: string;
  budget: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Revision Required';
  submittedDate: string;
  reviewers: number;
  score?: number;
  priority: 'High' | 'Medium' | 'Low';
}

const mockProposals: Proposal[] = [
  { id: 1, title: 'AI-Powered Chatbot for Education', pi: 'Dr. Nguyễn Văn A', category: 'AI & ML', budget: '50,000,000', status: 'Approved', submittedDate: '2026-04-10', reviewers: 3, score: 8.5, priority: 'High' },
  { id: 2, title: 'IoT Smart Campus System', pi: 'Dr. Trần Thị B', category: 'IoT', budget: '75,000,000', status: 'Under Review', submittedDate: '2026-05-01', reviewers: 2, priority: 'High' },
  { id: 3, title: 'Blockchain for Academic Credentials', pi: 'Dr. Lê Văn C', category: 'Blockchain', budget: '60,000,000', status: 'Revision Required', submittedDate: '2026-04-25', reviewers: 3, score: 6.8, priority: 'Medium' },
  { id: 4, title: 'Machine Learning for Student Performance', pi: 'Dr. Phạm Thị D', category: 'AI & ML', budget: '45,000,000', status: 'Rejected', submittedDate: '2026-04-15', reviewers: 3, score: 5.2, priority: 'Low' },
  { id: 5, title: 'Cloud-Based Learning Platform', pi: 'Dr. Hoàng Văn E', category: 'Cloud', budget: '80,000,000', status: 'Approved', submittedDate: '2026-04-05', reviewers: 3, score: 9.1, priority: 'High' },
  { id: 6, title: 'Cybersecurity Framework for University', pi: 'Dr. Vũ Thị F', category: 'Cybersecurity', budget: '90,000,000', status: 'Submitted', submittedDate: '2026-05-10', reviewers: 0, priority: 'High' },
];

export default function ProposalManagement() {
  const [proposals, setProposals] = useState<Proposal[]>(mockProposals);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredProposals = proposals.filter(p => {
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'Submitted': 'bg-blue-100 text-blue-800',
      'Under Review': 'bg-yellow-100 text-yellow-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Revision Required': 'bg-orange-100 text-orange-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'High': 'text-red-600',
      'Medium': 'text-yellow-600',
      'Low': 'text-green-600',
    };
    return colors[priority as keyof typeof colors];
  };

  const stats = [
    { label: 'Tổng đề xuất', value: proposals.length, icon: TrendingUp, color: 'bg-blue-500' },
    { label: 'Đang xét duyệt', value: proposals.filter(p => p.status === 'Under Review').length, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Đã phê duyệt', value: proposals.filter(p => p.status === 'Approved').length, icon: Eye, color: 'bg-green-500' },
    { label: 'Tổng ngân sách', value: `${(proposals.filter(p => p.status === 'Approved').reduce((sum, p) => sum + parseInt(p.budget.replace(/,/g, '')), 0) / 1000000).toFixed(0)}M`, icon: DollarSign, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Proposal Management</h2>
          <p className="text-gray-500 mt-1">Manage and review research proposals</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-xl`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Revision Required">Revision Required</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="AI & ML">AI & ML</option>
            <option value="IoT">IoT</option>
            <option value="Blockchain">Blockchain</option>
            <option value="Cloud">Cloud</option>
            <option value="Cybersecurity">Cybersecurity</option>
          </select>

          <div className="ml-auto text-sm text-gray-600">
            Hiển thị <span className="font-semibold">{filteredProposals.length}</span> / {proposals.length} đề xuất
          </div>
        </div>
      </div>

      {/* Proposals Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Đề xuất</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Danh mục</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ngân sách</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Điểm</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ưu tiên</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProposals.map(proposal => (
              <tr key={proposal.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-800">{proposal.title}</p>
                    <p className="text-sm text-gray-500">PI: {proposal.pi}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Nộp: {new Date(proposal.submittedDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    {proposal.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-700 font-medium">
                  {parseInt(proposal.budget).toLocaleString('vi-VN')} ₫
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(proposal.status)}`}>
                    {proposal.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {proposal.score ? (
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold">{proposal.score}</span>
                      </div>
                      <span className="text-xs text-gray-500">/ 10</span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Chưa chấm</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`font-semibold ${getPriorityColor(proposal.priority)}`}>
                    {proposal.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition relative">
                      <MessageSquare className="w-4 h-4" />
                      {proposal.reviewers > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {proposal.reviewers}
                        </span>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Workflow Diagram */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-4">Review Workflow</h3>
        <div className="flex items-center justify-between">
          {['Submitted', 'Under Review', 'Committee Meeting', 'Final Decision'].map((step, idx, arr) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                  idx === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {idx + 1}
                </div>
                <p className="text-sm font-medium text-gray-700 mt-2 text-center">{step}</p>
              </div>
              {idx < arr.length - 1 && (
                <div className="h-1 flex-1 bg-gray-200 mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
