import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FileText, Sparkles, ThumbsUp, ThumbsDown, Edit, ChevronLeft, ChevronRight, LogOut, List, Home } from 'lucide-react';
import ReviewerDashboard from './ReviewerDashboard';

interface User {
  role: string;
  name: string;
}

interface ReviewerInterfaceProps {
  user: User;
}

const mockProposal = {
  title: 'AI-Powered Chatbot for Education',
  pi: 'Dr. Nguyễn Văn A',
  category: 'AI & Machine Learning',
  budget: '50,000,000 VND',
  duration: '12 months',
  submittedDate: '10/05/2026',
};

const rubricCriteria = [
  { id: 1, name: 'Innovation & Originality', score: 0, maxScore: 10 },
  { id: 2, name: 'Methodology & Approach', score: 0, maxScore: 10 },
  { id: 3, name: 'Feasibility & Timeline', score: 0, maxScore: 10 },
  { id: 4, name: 'Budget Justification', score: 0, maxScore: 10 },
  { id: 5, name: 'Expected Impact', score: 0, maxScore: 10 },
];

export default function ReviewerInterface({ user }: ReviewerInterfaceProps) {
  const [summary, setSummary] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);
  const navigate = useNavigate();
  const [showSummary, setShowSummary] = useState(false);
  const [scores, setScores] = useState(rubricCriteria);
  const [aiComments, setAiComments] = useState('');
  const [showAiComments, setShowAiComments] = useState(false);

  const handleSummarize = () => {
    setShowSummary(true);
    setSummary(
      'This research proposal presents an AI-powered chatbot system designed to enhance educational experiences at FPT University. The project aims to leverage natural language processing and machine learning to create an intelligent assistant that can answer student queries, provide personalized learning recommendations, and support faculty in administrative tasks. Key strengths include the innovative use of GPT-4 integration and the comprehensive evaluation plan. The budget allocation appears reasonable with 60% dedicated to development and 40% to testing and deployment.'
    );
  };

  const handleGenerateAiComments = () => {
    setShowAiComments(true);
    setAiComments(
      '• Strong theoretical foundation with clear references to current AI research\n• Methodology is well-structured but could benefit from more detailed risk mitigation strategies\n• Budget allocation is appropriate, though consider increasing allocation for user testing\n• Timeline seems ambitious for a 12-month project - recommend extending to 15 months\n• Consider adding more specific metrics for measuring educational impact\n• Excellent integration plan with existing university systems'
    );
  };

  const handleScoreChange = (id: number, value: number) => {
    setScores(scores.map(s => s.id === id ? { ...s, score: value } : s));
  };

  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const maxTotalScore = scores.reduce((sum, s) => sum + s.maxScore, 0);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">FURPMS</h1>
              <p className="text-sm text-gray-500">Reviewer Portal</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowDashboard(!showDashboard)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {showDashboard ? <FileText className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                {showDashboard ? 'Review Mode' : 'Dashboard'}
              </button>
              <div className="text-right border-r border-gray-300 pr-4">
                <p className="font-medium text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-500">Review Committee Member</p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
                    navigate('/');
                    window.location.reload();
                  }
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      {showDashboard ? (
        <div className="flex-1 overflow-auto p-6">
          <ReviewerDashboard />
        </div>
      ) : (
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - PDF Viewer */}
        <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Proposal Document</h2>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded transition">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">Page 1 / 15</span>
              <button className="p-2 hover:bg-gray-100 rounded transition">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-8 bg-gray-50">
            <div className="bg-white p-8 shadow-sm rounded-lg max-w-3xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{mockProposal.title}</h1>
                <p className="text-gray-600">Principal Investigator: {mockProposal.pi}</p>
              </div>

              <div className="space-y-4 text-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 mt-6">Abstract</h2>
                <p>
                  This research proposes the development of an AI-powered chatbot system specifically designed
                  for educational contexts at FPT University. The system will leverage state-of-the-art natural
                  language processing techniques to provide intelligent, context-aware responses to student
                  queries across various academic domains.
                </p>

                <h2 className="text-lg font-semibold text-gray-900 mt-6">Research Objectives</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Design and implement a GPT-4 based conversational AI system</li>
                  <li>Integrate the chatbot with existing university learning management systems</li>
                  <li>Evaluate the system's effectiveness in improving student engagement and learning outcomes</li>
                  <li>Develop a sustainable deployment model for campus-wide adoption</li>
                </ul>

                <h2 className="text-lg font-semibold text-gray-900 mt-6">Methodology</h2>
                <p>
                  The research will follow an iterative development approach combining design thinking,
                  agile software development, and rigorous empirical evaluation. We will conduct user studies
                  with students and faculty to gather requirements and feedback throughout the development process.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - AI Assistant Panel */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-xl font-semibold">AI Review Assistant</h2>
            </div>
            <p className="text-sm text-purple-100">Powered by Gemini API</p>
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-6">
            {/* AI Summary Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Project Summary</h3>
              <button
                onClick={handleSummarize}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition mb-4"
              >
                <Sparkles className="w-5 h-5" />
                Summarize Project
              </button>

              {showSummary && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{summary}</p>
                </div>
              )}
            </div>

            {/* Grading Rubric */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Evaluation Rubric</h3>
              <div className="space-y-4">
                {scores.map((criterion) => (
                  <div key={criterion.id}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">{criterion.name}</label>
                      <span className="text-sm font-semibold text-blue-600">
                        {criterion.score} / {criterion.maxScore}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={criterion.maxScore}
                      value={criterion.score}
                      onChange={(e) => handleScoreChange(criterion.id, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                ))}

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">Total Score</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {totalScore} / {maxTotalScore}
                    </span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-300"
                      style={{ width: `${(totalScore / maxTotalScore) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Suggested Comments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">AI Suggested Comments</h3>
              <button
                onClick={handleGenerateAiComments}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition mb-4"
              >
                <Sparkles className="w-5 h-5" />
                Generate AI Comments
              </button>

              {showAiComments && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{aiComments}</pre>
                  </div>
                  <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                    <Edit className="w-4 h-4" />
                    Edit Comments
                  </button>
                </div>
              )}
            </div>

            {/* Final Decision */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Recommendation</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
                  <ThumbsUp className="w-5 h-5" />
                  Approve
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition">
                  <ThumbsDown className="w-5 h-5" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
