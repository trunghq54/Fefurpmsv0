import { useSearchParams } from 'react-router';
import {
  LayoutDashboard, Users, Calendar, DollarSign, FileText, TrendingUp, AlertTriangle,
  LogOut, CheckCircle, Clock, BarChart3, UserPlus, Video, Bell
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BudgetTracker from './BudgetTracker';
import ActivityLog from './ActivityLog';
import ProposalManagement from './ProposalManagement';
import MeetingsOverview from './MeetingsOverview';
import RoleSwitcher from './RoleSwitcher';

interface User {
  role: string;
  name: string;
}

interface StaffDashboardProps {
  user: User;
  onLogout: () => void;
}

const reviewStatusData = [
  { status: 'Completed', count: 142, color: '#10b981' },
  { status: 'In Progress', count: 68, color: '#f59e0b' },
  { status: 'Pending', count: 35, color: '#3b82f6' },
];

const submissionTrendData = [
  { month: 'T1', count: 45 },
  { month: 'T2', count: 52 },
  { month: 'T3', count: 68 },
  { month: 'T4', count: 71 },
  { month: 'T5', count: 89 },
  { month: 'T6', count: 95 },
];

const budgetAlerts = [
  { id: 1, project: 'AI-Powered Chatbot for Education', pi: 'Dr. Nguyễn Văn A', utilization: 92, status: 'over', color: 'text-red-600' },
  { id: 2, project: 'IoT Smart Campus System', pi: 'Dr. Trần Thị B', utilization: 85, status: 'warning', color: 'text-yellow-600' },
  { id: 3, project: 'Blockchain for Academic Credentials', pi: 'Dr. Lê Văn C', utilization: 78, status: 'ok', color: 'text-green-600' },
];

const upcomingMeetings = [
  { id: 1, title: 'AI Chatbot Review Committee', date: '18/05/2026', time: '14:00', attendees: 5 },
  { id: 2, title: 'IoT Project Defense', date: '20/05/2026', time: '09:30', attendees: 4 },
  { id: 3, title: 'Blockchain Final Review', date: '22/05/2026', time: '15:00', attendees: 6 },
];

const aiModerationQueue = [
  { id: 1, proposal: 'Machine Learning for Student Performance', reviewer: 'Dr. Lê Văn C', type: 'AI Summary', status: 'Pending Review' },
  { id: 2, proposal: 'Cloud-Based Learning Platform', reviewer: 'Dr. Trần Thị B', type: 'AI Comments', status: 'Approved' },
  { id: 3, proposal: 'Cybersecurity Framework', reviewer: 'Dr. Phạm Văn D', type: 'AI Summary', status: 'Needs Revision' },
];

export default function StaffDashboard({ user, onLogout }: StaffDashboardProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeMenu = searchParams.get('tab') || 'dashboard';
  const setActiveMenu = (id: string) => setSearchParams({ tab: id });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meetings', label: 'Meeting Management', icon: Calendar },
    { id: 'reviewers', label: 'Đề xuất & Phân công', icon: UserPlus },
    { id: 'budget', label: 'Budget Monitoring', icon: DollarSign },
    { id: 'ai-moderation', label: 'AI Moderation', icon: FileText },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'activity', label: 'Activity Log', icon: Bell },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'meetings':
        return <MeetingsOverview />;
      case 'budget':
        return <BudgetTracker />;
      case 'activity':
        return <ActivityLog />;
      case 'reviewers':
        // Luồng phân công thật: list đề xuất → View → tạo round + chọn reviewer (ReviewRoundsPanel).
        // BE đã cho phép Staff tạo round/assign nên dùng lại y hệt Admin.
        return <ProposalManagement />;
      case 'ai-moderation':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">AI Moderation Queue</h2>
              <p className="text-gray-500 mt-1">Review and approve AI-generated summaries and comments</p>
            </div>

            {/* AI Moderation Queue */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Pending AI Content Review</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proposal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {aiModerationQueue.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{item.proposal}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{item.reviewer}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                            {item.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 ${
                            item.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            item.status === 'Needs Revision' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          } text-xs font-medium rounded-full`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
                          <button className="text-green-600 hover:text-green-800 text-sm font-medium">Approve</button>
                          <button className="text-red-600 hover:text-red-800 text-sm font-medium">Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
              <p className="text-gray-500 mt-1">System-wide statistics and insights</p>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Submission Trend */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Submission Trend (6 Months)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={submissionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Review Status */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Review Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reviewStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                    >
                      {reviewStatusData.map((entry, index) => (
                        <Cell key={`status-${entry.status}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-xl shadow-lg">
              <h2 className="text-3xl font-bold mb-2">Xin chào, {user.name}</h2>
              <p className="text-blue-100">Quản lý hệ thống nghiên cứu - Staff Dashboard</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-gray-500 text-sm">Total Proposals</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">245</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-gray-500 text-sm">Reviews Completed</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">142</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="text-xs text-gray-500">68 in progress</span>
                </div>
                <p className="text-gray-500 text-sm">Pending Reviews</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">35</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-xs text-gray-500">Next: 18/05</span>
                </div>
                <p className="text-gray-500 text-sm">Upcoming Meetings</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">12</p>
              </div>
            </div>

            {/* Budget Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Budget Alerts</h3>
                  <p className="text-sm text-gray-500 mt-1">Projects requiring attention</p>
                </div>
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="divide-y divide-gray-200">
                {budgetAlerts.map((alert) => (
                  <div key={alert.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{alert.project}</h4>
                        <p className="text-sm text-gray-500 mt-1">PI: {alert.pi}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${alert.color}`}>{alert.utilization}%</p>
                        <p className="text-xs text-gray-500 mt-1">Budget Utilization</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            alert.status === 'over' ? 'bg-red-600' :
                            alert.status === 'warning' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${alert.utilization}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Meetings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Upcoming Meetings</h3>
                  <p className="text-sm text-gray-500 mt-1">Scheduled review committee meetings</p>
                </div>
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <div className="divide-y divide-gray-200">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="p-6 hover:bg-gray-50 transition flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{meeting.title}</h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {meeting.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {meeting.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {meeting.attendees} attendees
                        </span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                      Manage
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600">FURPMS</h1>
          <p className="text-sm text-gray-500 mt-1">Staff Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeMenu === item.id
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="mb-4"><RoleSwitcher /></div>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-500 mt-1">Staff</p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
                onLogout();
              }
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
