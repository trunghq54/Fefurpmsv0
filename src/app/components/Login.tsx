import { useState } from 'react'
import { Users, BookOpen, FileCheck, Calendar } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button, Input } from './ui-kit'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Đăng nhập thất bại'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

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
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-3 focus:border-transparent" placeholder="Nhập email" required disabled={loading} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="px-4 py-3 focus:border-transparent" placeholder="Nhập mật khẩu" required disabled={loading} />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full py-3 font-semibold shadow-lg hover:shadow-xl">
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
