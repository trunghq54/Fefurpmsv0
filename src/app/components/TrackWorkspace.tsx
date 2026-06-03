import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Edit, X, Trash2, UserCheck, Layers } from 'lucide-react'
import { cycleService } from '../../services/cycleService'
import { userService } from '../../services/userService'
import type { CycleDto, TrackDto } from '../../types/cycle'
import type { UserDto } from '../../types/user'

interface TrackWorkspaceProps {
  cycle: CycleDto
  onBack: () => void
}

interface TrackForm {
  name: string
  description: string
  ownerId: string
}

const defaultForm: TrackForm = { name: '', description: '', ownerId: '' }

export default function TrackWorkspace({ cycle, onBack }: TrackWorkspaceProps) {
  const [tracks, setTracks] = useState<TrackDto[]>([])
  const [users, setUsers] = useState<UserDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTrack, setEditingTrack] = useState<TrackDto | null>(null)
  const [formData, setFormData] = useState<TrackForm>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    cycleService.getTracks(cycle.id).then((res) => {
      if (res.success && res.data) setTracks(res.data)
      setLoading(false)
    })
    userService.getAll().then((res) => {
      if (res.success && res.data) setUsers(res.data)
    })
  }, [cycle.id])

  const handleOpenModal = (track?: TrackDto) => {
    if (track) {
      setEditingTrack(track)
      setFormData({
        name: track.name,
        description: track.description || '',
        ownerId: track.ownerId || '',
      })
    } else {
      setEditingTrack(null)
      setFormData(defaultForm)
    }
    setFormError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setFormError('Tên track là bắt buộc')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        ownerId: formData.ownerId || undefined,
      }
      if (editingTrack) {
        const res = await cycleService.updateTrack(cycle.id, editingTrack.id, payload)
        if (res.success && res.data) {
          setTracks((prev) => prev.map((t) => (t.id === editingTrack.id ? res.data! : t)))
          setShowModal(false)
        } else {
          setFormError(res.message || 'Cập nhật thất bại')
        }
      } else {
        const res = await cycleService.createTrack(cycle.id, payload)
        if (res.success && res.data) {
          setTracks((prev) => [...prev, res.data!])
          setShowModal(false)
        } else {
          setFormError(res.message || 'Tạo track thất bại')
        }
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleAssignOwner = async (trackId: string, ownerId: string) => {
    try {
      const res = await cycleService.assignOwner(cycle.id, trackId, ownerId || null)
      if (res.success && res.data) {
        setTracks((prev) => prev.map((t) => (t.id === trackId ? res.data! : t)))
      }
    } catch (err) {
      console.error('Assign owner failed:', err)
    }
  }

  const handleDeactivate = async (track: TrackDto) => {
    if (!window.confirm(`Vô hiệu hóa track "${track.name}"?`)) return
    try {
      await cycleService.deactivateTrack(cycle.id, track.id)
      setTracks((prev) => prev.map((t) => (t.id === track.id ? { ...t, isActive: false } : t)))
    } catch (err) {
      console.error('Deactivate failed:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            title="Quay lại danh sách đợt"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{cycle.name}</h2>
            <p className="text-gray-500 mt-1">
              Năm học {cycle.academicYear} · Quản lý các Track (lĩnh vực)
            </p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Thêm track
        </button>
      </div>

      {/* Tracks */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Đang tải dữ liệu...</div>
        ) : tracks.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            Chưa có track nào trong đợt này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Track</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Người phụ trách</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tracks.map((track) => (
                  <tr key={track.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{track.name}</p>
                          {track.description && (
                            <p className="text-sm text-gray-500">{track.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-gray-400" />
                        <select
                          value={track.ownerId || ''}
                          onChange={(e) => handleAssignOwner(track.id, e.target.value)}
                          disabled={!track.isActive}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                        >
                          <option value="">— Chưa gán —</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.fullName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          track.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {track.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(track)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {track.isActive && (
                          <button
                            onClick={() => handleDeactivate(track)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Vô hiệu hóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {editingTrack ? 'Chỉnh sửa track' : 'Thêm track mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên track *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="vd: Công nghệ thông tin"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Người phụ trách</label>
                <select
                  value={formData.ownerId}
                  onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">— Chưa gán —</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? 'Đang lưu...' : editingTrack ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
