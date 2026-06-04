import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  LayoutDashboard, Users, FileText, UserCheck, Calendar, BarChart3,
  LogOut, Bell, Search, ChevronRight, MessageSquare, Activity, FileDown,
  CalendarRange, FileEdit
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import UserManagement from './UserManagement';
import CycleManagement from './CycleManagement';
import ChangeRequestQueue from './ChangeRequestQueue';
import NotificationBell from './NotificationBell';
import { analyticsService } from '../../services/analyticsService';
import type { AnalyticsOverview, TrackStats, FunnelStage } from '../../types/analytics';
import ProposalManagement from './ProposalManagement';
import Notifications from './Notifications';
import BudgetTracker from './BudgetTracker';
import MeetingScheduler from './MeetingScheduler';
import DocumentRepository from './DocumentRepository';
import DiscussionThread from './DiscussionThread';
import TimelineTracker from './TimelineTracker';
import ActivityLog from './ActivityLog';
import AdvancedSearch from './AdvancedSearch';
import ReportsExport from './ReportsExport';

interface User {
  role: string;
  name: string;
}

interface AdminDashboardProps {
  user: User;
}

const submissionData = [
  { month: 'T1', submissions: 45 },
  { month: 'T2', submissions: 52 },
  { month: 'T3', submissions: 68 },
  { month: 'T4', submissions: 71 },
  { month: 'T5', submissions: 89 },
  { month: 'T6', submissions: 95 },
];

const budgetData = [
  { name: 'AI & ML', value: 35, color: '#3b82f6' },
  { name: 'IoT', value: 25, color: '#10b981' },
  { name: 'Blockchain', value: 18, color: '#f59e0b' },
  { name: 'Cloud Computing', value: 22, color: '#8b5cf6' },
];

const recentActivities = [
  { id: 1, project: 'AI-Powered Chatbot for Education', pi: 'Dr. Nguyễn Văn A', date: '14/05/2026', status: 'Approved', statusColor: 'bg-green-100 text-green-800' },
  { id: 2, project: 'IoT Smart Campus System', pi: 'Dr. Trần Thị B', date: '13/05/2026', status: 'Pending', statusColor: 'bg-yellow-100 text-yellow-800' },
  { id: 3, project: 'Blockchain for Academic Credentials', pi: 'Dr. Lê Văn C', date: '12/05/2026', status: 'Under Review', statusColor: 'bg-blue-100 text-blue-800' },
  { id: 4, project: 'Machine Learning for Student Performance', pi: 'Dr. Phạm Thị D', date: '11/05/2026', status: 'Rejected', statusColor: 'bg-red-100 text-red-800' },
  { id: 5, project: 'Cloud-Based Learning Platform', pi: 'Dr. Hoàng Văn E', date: '10/05/2026', status: 'Approved', statusColor: 'bg-green-100 text-green-800' },
];

const stats = [
  { label: 'Tổng đề xuất', value: '245', icon: FileText, color: 'bg-blue-500' },
  { label: 'Người dùng', value: '89', icon: Users, color: 'bg-green-500' },
  { label: 'Phản biện', value: '34', icon: UserCheck, color: 'bg-purple-500' },
  { label: 'Họp sắp tới', value: '12', icon: Calendar, color: 'bg-orange-500' },
];

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [byTrack, setByTrack] = useState<TrackStats[]>([]);
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);

  useEffect(() => {
    analyticsService.getOverview().then((r) => { if (r.success && r.data) setOverview(r.data); });
    analyticsService.getByTrack().then((r) => { if (r.success && r.data) setByTrack(r.data); });
    analyticsService.getFunnel().then((r) => { if (r.success && r.data) setFunnel(r.data); });
  }, []);

  const liveStats = [
    { label: 'Tổng đề xuất', value: String(overview?.totalProposals ?? '—'), icon: FileText, color: 'bg-blue-500' },
    { label: 'Giảng viên (PI)', value: String(overview?.totalPIs ?? '—'), icon: Users, color: 'bg-green-500' },
    { label: 'Phản biện', value: String(overview?.totalReviewers ?? '—'), icon: UserCheck, color: 'bg-purple-500' },
    { label: 'Đã duyệt', value: String(overview?.totalByStatus?.['Approved'] ?? 0), icon: Calendar, color: 'bg-orange-500' },
  ];
  const trackChart = byTrack.map((t) => ({ name: t.trackName, total: t.total, passed: t.passed }));
  const funnelColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
  const funnelChart = funnel.map((f, i) => ({ name: f.stage, value: f.count, color: funnelColors[i % funnelColors.length] }));

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'search', label: 'Advanced Search', icon: Search },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'cycles', label: 'Cycles & Tracks', icon: CalendarRange },
    { id: 'proposals', label: 'Proposals', icon: FileText },
    { id: 'change-requests', label: 'Change Requests', icon: FileEdit },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'meetings', label: 'Meetings', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileDown },
    { id: 'activity', label: 'Activity Log', icon: Activity },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600">FURPMS</h1>
          <p className="text-sm text-gray-500 mt-1">Admin Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === item.id
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user.name[0]}
            </div>
            <div>
              <p className="font-medium text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
                navigate('/');
                window.location.reload();
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
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
              <p className="text-gray-500 mt-1">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <NotificationBell />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {activeMenu === 'search' && <AdvancedSearch />}
          {activeMenu === 'users' && <UserManagement />}
          {activeMenu === 'cycles' && <CycleManagement />}
          {activeMenu === 'proposals' && <ProposalManagement />}
          {activeMenu === 'change-requests' && <ChangeRequestQueue />}
          {activeMenu === 'documents' && <DocumentRepository />}
          {activeMenu === 'discussions' && <DiscussionThread />}
          {activeMenu === 'timeline' && <TimelineTracker />}
          {activeMenu === 'analytics' && <BudgetTracker />}
          {activeMenu === 'meetings' && <MeetingScheduler user={user} showNavigation={false} />}
          {activeMenu === 'reports' && <ReportsExport />}
          {activeMenu === 'activity' && <ActivityLog />}

          {activeMenu === 'dashboard' && (
          <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {liveStats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-4 rounded-xl`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Bar Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Đề xuất theo Track</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trackChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" name="Tổng" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="passed" name="Đã duyệt" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Phễu xét duyệt (Funnel)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={funnelChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {funnelChart.map((entry) => (
                      <Cell key={`funnel-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activities Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Recent Activities</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal Investigator</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentActivities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-800">{activity.project}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{activity.pi}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{activity.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${activity.statusColor}`}>
                          {activity.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                          View <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </>
          )}
        </div>
      </div>

      {showNotifications && <Notifications onClose={() => setShowNotifications(false)} />}
    </div>
  );
}
