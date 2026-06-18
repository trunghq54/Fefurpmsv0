import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Mail, Phone, ToggleLeft, ToggleRight } from 'lucide-react'
import { userService } from '../../services/userService'
import { Button, Input, Select, Modal } from './ui-kit'
import type { UserDto } from '../../types/user'
import { ROLE_VALUE, ROLE_LABEL } from '../../types/user'

const ALL_ROLES = ['Admin', 'Staff', 'Faculty', 'ReviewCommittee'] as const

const departments = [
  'Software Engineering',
  'AI & Data Science',
  'Computer Science',
  'Information Systems',
  'Cybersecurity',
]

interface FormState {
  fullName: string
  email: string
  phoneNumber: string
  department: string
  roles: number[]
  temporaryPassword: string
}

const defaultForm: FormState = {
  fullName: '',
  email: '',
  phoneNumber: '',
  department: '',
  roles: [ROLE_VALUE.Faculty],
  temporaryPassword: '',
}

const roleBadge = (role: string) => {
  const colors: Record<string, string> = {
    Admin: 'bg-purple-100 text-purple-800',
    Faculty: 'bg-blue-100 text-blue-800',
    ReviewCommittee: 'bg-green-100 text-green-800',
    Staff: 'bg-yellow-100 text-yellow-800',
  }
  return colors[role] || 'bg-gray-100 text-gray-800'
}

const rolesOf = (u: UserDto): string[] => (u.roles?.length ? u.roles : [u.accountType])

export default function UserManagement() {
  const [users, setUsers] = useState<UserDto[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserDto | null>(null)
  const [formData, setFormData] = useState<FormState>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const loadUsers = async () => {
    const res = await userService.getAll()
    if (res.success && res.data) setUsers(res.data)
    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || rolesOf(u).includes(filterType)
    return matchesSearch && matchesType
  })

  const handleOpenModal = (user?: UserDto) => {
    if (user) {
      setEditingUser(user)
      const roleValues = rolesOf(user)
        .map((r) => ROLE_VALUE[r as keyof typeof ROLE_VALUE])
        .filter(Boolean)
      setFormData({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        department: user.department || '',
        roles: roleValues.length ? roleValues : [ROLE_VALUE.Faculty],
        temporaryPassword: '',
      })
    } else {
      setEditingUser(null)
      setFormData(defaultForm)
    }
    setFormError('')
    setShowModal(true)
  }

  const toggleRole = (value: number) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(value) ? prev.roles.filter((v) => v !== value) : [...prev.roles, value],
    }))
  }

  const handleSave = async () => {
    if (formData.roles.length === 0) {
      setFormError('Chọn ít nhất 1 vai trò')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      if (editingUser) {
        const res = await userService.update(editingUser.id, {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber || undefined,
          department: formData.department || undefined,
          roles: formData.roles,
        })
        if (res.success && res.data) {
          await loadUsers()
          setShowModal(false)
        } else {
          setFormError(res.message || 'Cập nhật thất bại')
        }
      } else {
        const res = await userService.create({
          email: formData.email,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber || undefined,
          department: formData.department || undefined,
          roles: formData.roles,
          temporaryPassword: formData.temporaryPassword,
        })
        if (res.success && res.data) {
          // reset bộ lọc để user mới chắc chắn hiện, rồi refetch từ server (đúng roles/accountType)
          setSearchTerm('')
          setFilterType('all')
          await loadUsers()
          setShowModal(false)
        } else {
          setFormError(res.message || 'Tạo người dùng thất bại')
        }
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id: string) => {
    try {
      const res = await userService.toggleActive(id)
      if (res.success && res.data) {
        setUsers((prev) => prev.map((u) => (u.id === id ? res.data! : u)))
      }
    } catch (err: any) {
      console.error('Toggle active failed:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <p className="text-gray-500 mt-1">Quản lý người dùng & vai trò (1 tài khoản có thể nhiều vai trò)</p>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo tên hoặc email..." className="pl-10" />
            </div>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">Tất cả vai trò</option>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABEL[r]} ({r})</option>
            ))}
          </select>

          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-5 h-5" /> Thêm người dùng
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Tổng người dùng</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Giảng viên</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {users.filter((u) => rolesOf(u).includes('Faculty')).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Phản biện</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {users.filter((u) => rolesOf(u).includes('ReviewCommittee')).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Đang hoạt động</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {users.filter((u) => u.isActive).length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Đang tải dữ liệu...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Người dùng</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Liên hệ</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vai trò</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Khoa</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.fullName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user.fullName}</p>
                          <p className="text-sm text-gray-500">
                            Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                        {user.phoneNumber && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {user.phoneNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {rolesOf(user).map((r) => (
                          <span key={r} className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge(r)}`}>
                            {ROLE_LABEL[r] || r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.department || '—'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggle(user.id)}
                          className={`p-2 rounded-lg transition ${
                            user.isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={user.isActive ? 'Khóa tài khoản' : 'Mở tài khoản'}
                        >
                          {user.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
          onClose={() => setShowModal(false)}
          className="max-w-2xl"
          footer={<>
            <Button variant="outline" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : editingUser ? 'Cập nhật' : 'Thêm mới'}</Button>
          </>}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên *</label>
            <Input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!!editingUser} className="disabled:text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <Input type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò * (chọn nhiều được)</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_ROLES.map((r) => {
                const value = ROLE_VALUE[r]
                const checked = formData.roles.includes(value)
                return (
                  <label
                    key={r}
                    className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${checked ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggleRole(value)} className="accent-blue-600" />
                    <span className="text-sm text-gray-800">{ROLE_LABEL[r]} <span className="text-gray-400">({r})</span></span>
                  </label>
                )
              })}
            </div>
            <p className="text-xs text-gray-400 mt-1">Vai trò đầu tiên được dùng làm trang mặc định khi đăng nhập.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Khoa</label>
            <Select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
              <option value="">Chọn khoa</option>
              {departments.map((dept) => (<option key={dept} value={dept}>{dept}</option>))}
            </Select>
          </div>

          {!editingUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu tạm thời *</label>
              <Input type="password" value={formData.temporaryPassword} onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
                placeholder="Người dùng phải đổi mật khẩu khi đăng nhập lần đầu" />
            </div>
          )}

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{formError}</div>
          )}
        </Modal>
      )}
    </div>
  )
}
