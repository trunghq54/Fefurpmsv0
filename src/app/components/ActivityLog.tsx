import { useState } from 'react';
import { Activity, User, FileText, MessageSquare, Calendar, Settings, Filter, Download } from 'lucide-react';

interface LogEntry {
  id: number;
  user: string;
  action: string;
  entity: string;
  entityId: number;
  timestamp: string;
  details: string;
  type: 'create' | 'update' | 'delete' | 'comment' | 'review' | 'meeting';
}

const mockLogs: LogEntry[] = [
  {
    id: 1,
    user: 'Dr. Nguyễn Văn A',
    action: 'submitted',
    entity: 'Proposal',
    entityId: 101,
    timestamp: '2026-05-14T10:30:00',
    details: 'Submitted new proposal "AI-Powered Chatbot for Education"',
    type: 'create'
  },
  {
    id: 2,
    user: 'Dr. Hoàng Văn E',
    action: 'reviewed',
    entity: 'Proposal',
    entityId: 101,
    timestamp: '2026-05-14T09:15:00',
    details: 'Completed review with score 8.5/10',
    type: 'review'
  },
  {
    id: 3,
    user: 'Admin Staff',
    action: 'scheduled',
    entity: 'Meeting',
    entityId: 15,
    timestamp: '2026-05-14T08:45:00',
    details: 'Scheduled committee meeting for May 20, 2026',
    type: 'meeting'
  },
  {
    id: 4,
    user: 'Dr. Vũ Thị F',
    action: 'commented on',
    entity: 'Proposal',
    entityId: 101,
    timestamp: '2026-05-13T16:20:00',
    details: 'Added feedback: "Consider increasing testing budget"',
    type: 'comment'
  },
  {
    id: 5,
    user: 'Admin Staff',
    action: 'updated',
    entity: 'User',
    entityId: 45,
    timestamp: '2026-05-13T14:30:00',
    details: 'Updated user role from Faculty to Reviewer',
    type: 'update'
  },
  {
    id: 6,
    user: 'Dr. Trần Thị B',
    action: 'uploaded',
    entity: 'Document',
    entityId: 234,
    timestamp: '2026-05-13T11:15:00',
    details: 'Uploaded document "Research_Proposal_v3.pdf"',
    type: 'create'
  },
  {
    id: 7,
    user: 'System',
    action: 'approved',
    entity: 'Proposal',
    entityId: 98,
    timestamp: '2026-05-12T15:45:00',
    details: 'Proposal "Cloud-Based Learning Platform" approved',
    type: 'update'
  },
  {
    id: 8,
    user: 'Dr. Lê Văn C',
    action: 'deleted',
    entity: 'Document',
    entityId: 220,
    timestamp: '2026-05-12T10:20:00',
    details: 'Deleted old version of budget spreadsheet',
    type: 'delete'
  },
  {
    id: 9,
    user: 'Admin Staff',
    action: 'created',
    entity: 'User',
    entityId: 67,
    timestamp: '2026-05-11T09:30:00',
    details: 'Created new user account for Dr. Đặng Văn G',
    type: 'create'
  },
  {
    id: 10,
    user: 'Dr. Phạm Thị D',
    action: 'updated',
    entity: 'Proposal',
    entityId: 102,
    timestamp: '2026-05-10T13:00:00',
    details: 'Updated proposal status to "Revision Required"',
    type: 'update'
  }
];

export default function ActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesUser = filterUser === 'all' || log.user === filterUser;
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.entity.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesUser && matchesSearch;
  });

  const uniqueUsers = Array.from(new Set(logs.map(l => l.user)));

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'create':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'update':
        return <Settings className="w-5 h-5 text-blue-600" />;
      case 'delete':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-purple-600" />;
      case 'review':
        return <FileText className="w-5 h-5 text-orange-600" />;
      case 'meeting':
        return <Calendar className="w-5 h-5 text-teal-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'create':
        return 'bg-green-50 border-green-200';
      case 'update':
        return 'bg-blue-50 border-blue-200';
      case 'delete':
        return 'bg-red-50 border-red-200';
      case 'comment':
        return 'bg-purple-50 border-purple-200';
      case 'review':
        return 'bg-orange-50 border-orange-200';
      case 'meeting':
        return 'bg-teal-50 border-teal-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const activityStats = {
    total: logs.length,
    today: logs.filter(l => {
      const logDate = new Date(l.timestamp);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    }).length,
    thisWeek: logs.filter(l => {
      const logDate = new Date(l.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logDate >= weekAgo;
    }).length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Activity Log & Audit Trail</h2>
          <p className="text-gray-500 mt-1">Track all system activities and changes</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
          <Download className="w-5 h-5" />
          Export Log
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Activities</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{activityStats.total}</p>
            </div>
            <Activity className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Today</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{activityStats.today}</p>
            </div>
            <Activity className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">This Week</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{activityStats.thisWeek}</p>
            </div>
            <Activity className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search activities..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Types</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="comment">Comment</option>
              <option value="review">Review</option>
              <option value="meeting">Meeting</option>
            </select>
          </div>

          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Users</option>
            {uniqueUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          {filteredLogs.map((log, index) => (
            <div key={log.id} className="relative pb-4 last:pb-0">
              {index < filteredLogs.length - 1 && (
                <div className="absolute left-[22px] top-12 bottom-0 w-0.5 bg-gray-200" />
              )}

              <div className="flex items-start gap-4">
                <div className={`relative z-10 p-2 rounded-lg border ${getActionColor(log.type)}`}>
                  {getActionIcon(log.type)}
                </div>

                <div className="flex-1 bg-gray-50 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-800">{log.user}</span>
                      </div>
                      <span className="text-gray-600">{log.action}</span>
                      <span className="font-medium text-blue-600">{log.entity} #{log.entityId}</span>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{log.details}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No activities found</p>
          </div>
        )}
      </div>

      {/* Activity Summary by Type */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Activity Summary by Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {['create', 'update', 'delete', 'comment', 'review', 'meeting'].map(type => {
            const count = logs.filter(l => l.type === type).length;
            return (
              <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-center mb-2">
                  {getActionIcon(type)}
                </div>
                <p className="text-2xl font-bold text-gray-800">{count}</p>
                <p className="text-sm text-gray-600 capitalize mt-1">{type}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
