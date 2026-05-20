import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Home, List, LogOut } from 'lucide-react';

interface User {
  role: string;
  name: string;
}

interface ProposalSubmissionProps {
  user: User;
}

export default function ProposalSubmission({ user }: ProposalSubmissionProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    duration: '',
    file: null as File | null,
  });

  const steps = [
    { number: 1, title: 'Metadata', description: 'Basic Information' },
    { number: 2, title: 'Document Upload', description: 'Upload Proposal Files' },
    { number: 3, title: 'Review & Submit', description: 'Final Review' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    alert('Đề xuất đã được gửi thành công!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">FURPMS</h1>
              <p className="text-sm text-gray-500">Faculty Portal</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSubmissions(!showSubmissions)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {showSubmissions ? <Home className="w-4 h-4" /> : <List className="w-4 h-4" />}
                {showSubmissions ? 'New Submission' : 'My Submissions'}
              </button>
              <div className="border-l border-gray-300 pl-4">
                <p className="font-medium text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-500">Principal Investigator</p>
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

      {/* Alert Banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Submission Deadline</p>
              <p className="text-sm text-yellow-700">Please submit your research proposal before May 31, 2026 at 11:59 PM</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {showSubmissions ? (
          <MySubmissions />
        ) : (
        <>
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold mb-2 transition ${
                      currentStep >= step.number
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <p className="font-medium text-gray-800 text-center">{step.title}</p>
                  <p className="text-sm text-gray-500 text-center">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-4 transition ${
                      currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Project Metadata</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="Enter your research project title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  <option value="">Select a category</option>
                  <option value="ai-ml">AI & Machine Learning</option>
                  <option value="iot">Internet of Things</option>
                  <option value="blockchain">Blockchain</option>
                  <option value="cloud">Cloud Computing</option>
                  <option value="cybersecurity">Cybersecurity</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget (VND) *</label>
                  <input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="e.g., 50,000,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (months) *</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="e.g., 12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                  placeholder="Provide a detailed description of your research project, objectives, and expected outcomes..."
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Upload Proposal Documents</h2>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drag and drop your files here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                  <p className="text-xs text-gray-400">Supported formats: PDF, DOC, DOCX (Max 10MB)</p>
                </label>
              </div>

              {formData.file && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{formData.file.name}</p>
                    <p className="text-sm text-gray-500">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-3">Document Requirements:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Complete research proposal (minimum 10 pages)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Budget breakdown and justification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Timeline and milestones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>References and citations</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Review & Submit</h2>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Project Title</p>
                  <p className="font-medium text-gray-800">{formData.title || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Category</p>
                  <p className="font-medium text-gray-800">{formData.category || 'Not selected'}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Budget</p>
                    <p className="font-medium text-gray-800">{formData.budget || 'Not provided'} VND</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Duration</p>
                    <p className="font-medium text-gray-800">{formData.duration || 'Not provided'} months</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Description</p>
                  <p className="text-gray-800">{formData.description || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Uploaded File</p>
                  <p className="font-medium text-gray-800">{formData.file?.name || 'No file uploaded'}</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Ready to Submit</p>
                    <p className="text-sm text-green-700">Please review all information carefully before submitting. You can edit your proposal until the deadline.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                <CheckCircle className="w-4 h-4" />
                Submit Proposal
              </button>
            )}
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

function MySubmissions() {
  const submissions = [
    { id: 1, title: 'AI-Powered Chatbot for Education', status: 'Approved', date: '2026-04-10', score: 8.5, budget: '50,000,000' },
    { id: 2, title: 'Smart Learning Analytics Platform', status: 'Under Review', date: '2026-05-01', budget: '65,000,000' },
    { id: 3, title: 'Virtual Reality for Engineering Education', status: 'Revision Required', date: '2026-04-25', score: 6.8, budget: '75,000,000' },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      'Approved': 'bg-green-100 text-green-800',
      'Under Review': 'bg-yellow-100 text-yellow-800',
      'Revision Required': 'bg-orange-100 text-orange-800',
      'Rejected': 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">My Submissions</h2>
        <p className="text-gray-500 mt-1">Track your research proposals</p>
      </div>

      <div className="grid gap-4">
        {submissions.map(sub => (
          <div key={sub.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{sub.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>Submitted: {new Date(sub.date).toLocaleDateString('vi-VN')}</span>
                  <span>•</span>
                  <span>Budget: {parseInt(sub.budget).toLocaleString('vi-VN')} VND</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {sub.score && (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">{sub.score}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Score</p>
                  </div>
                )}
                <span className={`px-4 py-2 rounded-full font-medium ${getStatusColor(sub.status)}`}>
                  {sub.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
