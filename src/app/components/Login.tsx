import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Users, BookOpen, FileCheck, Calendar } from 'lucide-react';

interface LoginProps {
  onLogin: (user: { role: string; name: string }) => void;
}

const mockUsers = [
  { username: 'admin', password: 'admin123', role: 'admin', name: 'Nguyễn Văn A', redirect: '/admin' },
  { username: 'staff', password: 'staff123', role: 'staff', name: 'Phạm Thị D', redirect: '/staff' },
  { username: 'faculty', password: 'faculty123', role: 'faculty', name: 'Trần Thị B', redirect: '/faculty' },
  { username: 'reviewer', password: 'reviewer123', role: 'reviewer', name: 'Lê Văn C', redirect: '/reviewer' },
];

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = mockUsers.find(u => u.username === username && u.password === password);

    if (user) {
      onLogin({ role: user.role, name: user.name });
      navigate(user.redirect);
    } else {
      setError('Sai tên đăng nhập hoặc mật khẩu');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8">
        {/* Left side - Branding */}
        <div className="hidden md:flex flex-col justify-center text-white bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-12 shadow-2xl">
          <h1 className="text-5xl font-bold mb-4">FURPMS</h1>
          <p className="text-xl mb-8 text-blue-100">FPT University Research Project Management System</p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6" />
              <span>Quản lý người dùng</span>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6" />
              <span>Nộp đề xuất nghiên cứu</span>
            </div>
            <div className="flex items-center gap-3">
              <FileCheck className="w-6 h-6" />
              <span>Phản biện & AI trợ giúp</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6" />
              <span>Quản lý họp trực tuyến</span>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Đăng nhập</h2>
          <p className="text-gray-500 mb-8">Vui lòng nhập thông tin để tiếp tục</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Nhập tên đăng nhập"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Nhập mật khẩu"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
            >
              Đăng nhập
            </button>
          </form>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-2">Tài khoản demo:</p>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Admin:</span> admin / admin123</p>
              <p><span className="font-medium">Cán bộ:</span> staff / staff123</p>
              <p><span className="font-medium">Giảng viên:</span> faculty / faculty123</p>
              <p><span className="font-medium">Phản biện:</span> reviewer / reviewer123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
