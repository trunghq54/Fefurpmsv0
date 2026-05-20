import { useState } from 'react';
import { Calendar, CheckCircle, Circle, Clock, AlertTriangle, Flag, TrendingUp } from 'lucide-react';

interface Milestone {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'Completed' | 'In Progress' | 'Pending' | 'Overdue';
  progress: number;
  assignee: string;
  dependencies?: number[];
}

const mockMilestones: Milestone[] = [
  {
    id: 1,
    title: 'Literature Review',
    description: 'Comprehensive review of existing AI chatbot research',
    startDate: '2026-01-01',
    endDate: '2026-02-28',
    status: 'Completed',
    progress: 100,
    assignee: 'Dr. Nguyễn Văn A'
  },
  {
    id: 2,
    title: 'System Design & Architecture',
    description: 'Design system architecture and technical specifications',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    status: 'Completed',
    progress: 100,
    assignee: 'Dr. Nguyễn Văn A',
    dependencies: [1]
  },
  {
    id: 3,
    title: 'Development Phase 1: Core Features',
    description: 'Implement NLP engine and basic conversation flow',
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    status: 'In Progress',
    progress: 65,
    assignee: 'Development Team',
    dependencies: [2]
  },
  {
    id: 4,
    title: 'Development Phase 2: Integration',
    description: 'Integrate with LMS and university systems',
    startDate: '2026-07-01',
    endDate: '2026-08-31',
    status: 'Pending',
    progress: 0,
    assignee: 'Development Team',
    dependencies: [3]
  },
  {
    id: 5,
    title: 'Testing & Quality Assurance',
    description: 'Comprehensive testing with student focus groups',
    startDate: '2026-09-01',
    endDate: '2026-10-31',
    status: 'Pending',
    progress: 0,
    assignee: 'QA Team',
    dependencies: [4]
  },
  {
    id: 6,
    title: 'Deployment & Training',
    description: 'Production deployment and user training sessions',
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    status: 'Pending',
    progress: 0,
    assignee: 'DevOps Team',
    dependencies: [5]
  },
  {
    id: 7,
    title: 'Final Report & Documentation',
    description: 'Complete research report and technical documentation',
    startDate: '2026-12-01',
    endDate: '2026-12-31',
    status: 'Pending',
    progress: 0,
    assignee: 'Dr. Nguyễn Văn A',
    dependencies: [6]
  }
];

export default function TimelineTracker() {
  const [milestones, setMilestones] = useState<Milestone[]>(mockMilestones);
  const [viewMode, setViewMode] = useState<'timeline' | 'gantt'>('timeline');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'In Progress':
        return <Clock className="w-6 h-6 text-blue-600" />;
      case 'Overdue':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProjectProgress = () => {
    const totalWeight = milestones.length;
    const weightedProgress = milestones.reduce((sum, m) => sum + m.progress, 0);
    return Math.round(weightedProgress / totalWeight);
  };

  const getTimelinePosition = (date: string) => {
    const projectStart = new Date('2026-01-01');
    const projectEnd = new Date('2026-12-31');
    const currentDate = new Date(date);

    const totalDuration = projectEnd.getTime() - projectStart.getTime();
    const elapsed = currentDate.getTime() - projectStart.getTime();

    return (elapsed / totalDuration) * 100;
  };

  const overallProgress = calculateProjectProgress();
  const completedMilestones = milestones.filter(m => m.status === 'Completed').length;
  const inProgressMilestones = milestones.filter(m => m.status === 'In Progress').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Project Timeline & Milestones</h2>
          <p className="text-gray-500 mt-1">Track research project progress and deadlines</p>
        </div>
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-4 py-2 rounded ${viewMode === 'timeline' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
          >
            Timeline
          </button>
          <button
            onClick={() => setViewMode('gantt')}
            className={`px-4 py-2 rounded ${viewMode === 'gantt' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
          >
            Gantt Chart
          </button>
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Overall Progress</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{overallProgress}%</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-500" />
          </div>
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{completedMilestones}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">In Progress</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{inProgressMilestones}</p>
            </div>
            <Clock className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Milestones</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{milestones.length}</p>
            </div>
            <Flag className="w-12 h-12 text-purple-500" />
          </div>
        </div>
      </div>

      {viewMode === 'timeline' ? (
        /* Timeline View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="relative">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="relative pb-12 last:pb-0">
                {index < milestones.length - 1 && (
                  <div className="absolute left-[13px] top-6 bottom-0 w-0.5 bg-gray-300" />
                )}

                <div className="flex items-start gap-4">
                  <div className="relative z-10 bg-white">
                    {getStatusIcon(milestone.status)}
                  </div>

                  <div className="flex-1 bg-gray-50 rounded-xl p-6 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">{milestone.title}</h3>
                        <p className="text-sm text-gray-600">{milestone.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(milestone.status)}`}>
                        {milestone.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Start Date</p>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="w-4 h-4" />
                          {new Date(milestone.startDate).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">End Date</p>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="w-4 h-4" />
                          {new Date(milestone.endDate).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Assignee</p>
                        <p className="text-sm text-gray-700 font-medium">{milestone.assignee}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-semibold text-gray-800">{milestone.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            milestone.status === 'Completed' ? 'bg-green-600' :
                            milestone.status === 'In Progress' ? 'bg-blue-600' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${milestone.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Gantt Chart View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Timeline Header */}
            <div className="flex items-center mb-6">
              <div className="w-80 font-semibold text-gray-700">Milestone</div>
              <div className="flex-1 flex justify-between px-4 text-sm text-gray-600">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>
            </div>

            {/* Gantt Bars */}
            <div className="space-y-4">
              {milestones.map(milestone => {
                const startPos = getTimelinePosition(milestone.startDate);
                const endPos = getTimelinePosition(milestone.endDate);
                const width = endPos - startPos;

                return (
                  <div key={milestone.id} className="flex items-center">
                    <div className="w-80">
                      <p className="font-medium text-gray-800 text-sm">{milestone.title}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(milestone.status)}`}>
                        {milestone.status}
                      </span>
                    </div>
                    <div className="flex-1 relative h-10 bg-gray-100 rounded">
                      <div
                        className={`absolute h-full rounded flex items-center px-2 text-white text-xs font-medium ${
                          milestone.status === 'Completed' ? 'bg-green-600' :
                          milestone.status === 'In Progress' ? 'bg-blue-600' :
                          'bg-gray-400'
                        }`}
                        style={{
                          left: `${startPos}%`,
                          width: `${width}%`
                        }}
                      >
                        {milestone.progress}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current Date Indicator */}
            <div className="relative mt-6 h-4">
              <div
                className="absolute top-0 w-0.5 bg-red-500 h-full"
                style={{ left: `${getTimelinePosition(new Date().toISOString())}%` }}
              >
                <div className="absolute -top-1 -left-2 w-4 h-4 bg-red-500 rounded-full" />
                <div className="absolute top-4 -left-8 text-xs text-red-600 font-medium whitespace-nowrap">
                  Today
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
