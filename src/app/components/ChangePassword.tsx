import { useState } from 'react'
import { KeyRound, LogOut } from 'lucide-react'
import { authService } from '../../services/authService'
import { useAuth } from '../../contexts/AuthContext'
import { Button, Input } from './ui-kit'

export default function ChangePassword() {
  const { user, markPasswordChanged, logout } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const forced = user?.mustChangePassword

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (next !== confirm) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }
    if (next.length < 8) {
      setError('Mật khẩu mới tối thiểu 8 ký tự')
      return
    }
    setSaving(true)
    try {
      await authService.changePassword(current, next, confirm)
      markPasswordChanged() // clears the flag + routes onward (select-role / dashboard)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đổi mật khẩu thất bại')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Đổi mật khẩu</h2>
        </div>
        <p className="text-gray-500 mb-6 text-sm">
          {forced ? 'Bạn cần đổi mật khẩu trước khi sử dụng hệ thống.' : 'Cập nhật mật khẩu của bạn.'}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
            <Input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
              className="px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
            <Input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
              className="px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="px-4 py-2.5"
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}
          <Button type="submit" disabled={saving} className="w-full py-2.5 font-semibold">
            {saving ? 'Đang lưu...' : 'Đổi mật khẩu'}
          </Button>
        </form>

        <button
          onClick={logout}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-red-600"
        >
          <LogOut className="w-4 h-4" /> Đăng xuất
        </button>
      </div>
    </div>
  )
}
