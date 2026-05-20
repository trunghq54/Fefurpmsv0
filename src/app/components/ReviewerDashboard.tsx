import { Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const assignedProposals = [
  { id: 1, title: 'AI-Powered Chatbot for Education', pi: 'Dr. Nguyễn Văn A', deadline: '2026-05-20', status: 'Pending', priority: 'High' },
  { id: 2, title: 'IoT Smart Campus System', pi: 'Dr. Trần Thị B', deadline: '2026-05-22', status: 'Pending', priority: 'High' },
  { id: 3, title: 'Blockchain for Academic Credentials', pi: 'Dr. Lê Văn C', deadline: '2026-05-25', status: 'In Progress', priority: 'Medium' },
  { id: 4, title: 'Machine Learning for Student Performance', pi: 'Dr. Phạm Thị D', deadline: '2026-05-18', status: 'Completed', priority: 'Low' },
];

const recentReviews = [
  { title: 'Cloud-Based Learning Platform', score: 9.1, status: 'Approved', date: '2026-05-10' },
  { title: 'Cybersecurity Framework', score: 7.5, status: 'Revision Required', date: '2026-05-08' },
  { title: 'Data Analytics Dashboard', score: 8.3, status: 'Approved', date: '2026-05-05' },
];

export default function ReviewerDashboard() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Reviewer Dashboard</h2>
        <p className="text-gray-500 mt-1">Manage your assigned reviews</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Assigned Reviews</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {assignedProposals.filter(p => p.status !== 'Completed').length}
              </p>
            </div>
            <FileText className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {assignedProposals.filter(p => p.status === 'Pending').length}
              </p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">In Progress</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {assignedProposals.filter(p => p.status === 'In Progress').length}
              </p>
            </div>
            <AlertCircle className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {assignedProposals.filter(p => p.status === 'Completed').length}
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>
      </div>

      {/* Assigned Proposals */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Assigned Proposals</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {assignedProposals.map(proposal => (
            <div key={proposal.id} className="p-6 hover:bg-gray-50 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 text-lg">{proposal.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">PI: {proposal.pi}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      Deadline: {new Date(proposal.deadline).toLocaleDateString('vi-VN')}
                    </div>
                    <span className={`font-semibold ${getPriorityColor(proposal.priority)}`}>
                      {proposal.priority} Priority
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full font-medium ${getStatusColor(proposal.status)}`}>
                    {proposal.status}
                  </span>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                    Review Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Recent Reviews</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentReviews.map((review, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold">{review.score}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{review.title}</p>
                    <p className="text-sm text-gray-500">Reviewed on {new Date(review.date).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  review.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {review.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
