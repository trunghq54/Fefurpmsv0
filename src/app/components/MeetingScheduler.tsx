import { useState } from 'react';
import { Calendar, Clock, Users, Video, X, Plus, Check } from 'lucide-react';

interface User {
  role: string;
  name: string;
}

interface MeetingSchedulerProps {
  user: User;
  showNavigation?: boolean;
}

interface Meeting {
  id: number;
  projectName: string;
  piName: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  meetLink?: string;
}

const mockMeetings: Meeting[] = [
  {
    id: 1,
    projectName: 'AI-Powered Chatbot for Education',
    piName: 'Dr. Nguyễn Văn A',
    date: '2026-05-20',
    time: '14:00',
    status: 'Scheduled',
    meetLink: 'meet.google.com/abc-defg-hij',
  },
  {
    id: 2,
    projectName: 'IoT Smart Campus System',
    piName: 'Dr. Trần Thị B',
    date: '2026-05-22',
    time: '10:00',
    status: 'Scheduled',
    meetLink: 'meet.google.com/xyz-1234-abc',
  },
  {
    id: 3,
    projectName: 'Blockchain for Academic Credentials',
    piName: 'Dr. Lê Văn C',
    date: '2026-05-15',
    time: '15:30',
    status: 'Completed',
  },
  {
    id: 4,
    projectName: 'Machine Learning for Student Performance',
    piName: 'Dr. Phạm Thị D',
    date: '2026-05-18',
    time: '09:00',
    status: 'Cancelled',
  },
];

const availableReviewers = [
  'Dr. Hoàng Văn E',
  'Dr. Vũ Thị F',
  'Dr. Đặng Văn G',
  'Dr. Bùi Thị H',
  'Prof. Ngô Văn I',
];

export default function MeetingScheduler({ user, showNavigation = true }: MeetingSchedulerProps) {
  const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings);
  const [showModal, setShowModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    projectName: '',
    piName: '',
    date: '',
    time: '',
    reviewers: [] as string[],
    autoGenerateMeet: true,
  });

  const handleCreateMeeting = () => {
    const meeting: Meeting = {
      id: meetings.length + 1,
      projectName: newMeeting.projectName,
      piName: newMeeting.piName,
      date: newMeeting.date,
      time: newMeeting.time,
      status: 'Scheduled',
      meetLink: newMeeting.autoGenerateMeet ? `meet.google.com/${Math.random().toString(36).substr(2, 9)}` : undefined,
    };

    setMeetings([...meetings, meeting]);
    setShowModal(false);
    setNewMeeting({
      projectName: '',
      piName: '',
      date: '',
      time: '',
      reviewers: [],
      autoGenerateMeet: true,
    });
  };

  const toggleReviewer = (reviewer: string) => {
    if (newMeeting.reviewers.includes(reviewer)) {
      setNewMeeting({
        ...newMeeting,
        reviewers: newMeeting.reviewers.filter(r => r !== reviewer),
      });
    } else {
      setNewMeeting({
        ...newMeeting,
        reviewers: [...newMeeting.reviewers, reviewer],
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={showNavigation ? "min-h-screen bg-gray-50" : "space-y-6"}>
      {/* Header */}
      {showNavigation && (
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">FURPMS</h1>
              <p className="text-sm text-gray-500">Meeting Management</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
      )}

      <div className={showNavigation ? "max-w-7xl mx-auto px-6 py-8" : ""}>
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Committee Meetings</h2>
            <p className="text-gray-500 mt-1">Schedule and manage review committee meetings</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Create Meeting
          </button>
        </div>

        {/* Meetings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Project Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  PI Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {meetings.map((meeting) => (
                <tr key={meeting.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{meeting.projectName}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{meeting.piName}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(meeting.date).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      {meeting.time}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(meeting.status)}`}>
                      {meeting.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {meeting.meetLink ? (
                      <a
                        href={`https://${meeting.meetLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Video className="w-4 h-4" />
                        Join Meeting
                      </a>
                    ) : (
                      <span className="text-gray-400">No link</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Meeting Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Create New Meeting</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                <input
                  type="text"
                  value={newMeeting.projectName}
                  onChange={(e) => setNewMeeting({ ...newMeeting, projectName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Principal Investigator</label>
                <input
                  type="text"
                  value={newMeeting.piName}
                  onChange={(e) => setNewMeeting({ ...newMeeting, piName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Enter PI name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Reviewers</label>
                <div className="space-y-2">
                  {availableReviewers.map((reviewer) => (
                    <label
                      key={reviewer}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={newMeeting.reviewers.includes(reviewer)}
                          onChange={() => toggleReviewer(reviewer)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        {newMeeting.reviewers.includes(reviewer) && (
                          <Check className="w-4 h-4 text-white absolute top-0.5 left-0.5 pointer-events-none" />
                        )}
                      </div>
                      <span className="text-gray-700">{reviewer}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-800">Auto-generate Google Meet link</p>
                    <p className="text-sm text-gray-600">Create a meeting link automatically</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newMeeting.autoGenerateMeet}
                    onChange={(e) => setNewMeeting({ ...newMeeting, autoGenerateMeet: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMeeting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Create Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
