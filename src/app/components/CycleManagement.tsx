import { useState, useEffect } from 'react'
import { Plus, Edit, X, Power, Layers, CalendarRange, Wallet } from 'lucide-react'
import { cycleService } from '../../services/cycleService'
import type { CycleDto } from '../../types/cycle'
import TrackWorkspace from './TrackWorkspace'

interface CycleForm {
  name: string
  academicYear: string
  submissionStartDate: string
  submissionEndDateApplied: string
  submissionEndDateBasic: string
  fundingCapApplied: number
  fundingCapBasic: number
  description: string
}

const defaultForm: CycleForm = {
  name: '',
  academicYear: '',
  submissionStartDate: '',
  submissionEndDateApplied: '',
  submissionEndDateBasic: '',
  fundingCapApplied: 150_000_000,
  fundingCapBasic: 100_000_000,
  description: '',
}

const toDateInput = (iso: string) => (iso ? iso.slice(0, 10) : '')
const toIso = (d: string) => (d ? `${d}T00:00:00Z` : '')
const formatVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫'

export default function CycleManagement() {
  const [cycles, setCycles] = useState<CycleDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCycle, setEditingCycle] = useState<CycleDto | null>(null)
  const [formData, setFormData] = useState<CycleForm>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [workspaceCycle, setWorkspaceCycle] = useState<CycleDto | null>(null)

  useEffect(() => {
    cycleService.getAll().then((res) => {
      if (res.success && res.data) setCycles(res.data)
      setLoading(false)
    })
  }, [])

  const handleOpenModal = (cycle?: CycleDto) => {
    if (cycle) {
      setEditingCycle(cycle)
      setFormData({
        name: cycle.name,
        academicYear: cycle.academicYear,
        submissionStartDate: toDateInput(cycle.submissionStartDate),
        submissionEndDateApplied: toDateInput(cycle.submissionEndDateApplied),
        submissionEndDateBasic: toDateInput(cycle.submissionEndDateBasic),
        fundingCapApplied: cycle.fundingCapApplied,
        fundingCapBasic: cycle.fundingCapBasic,
        description: cycle.description || '',
      })
    } else {
      setEditingCycle(null)
      setFormData(defaultForm)
    }
    setFormError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.academicYear.trim()) {
      setFormError('Tên đợt và năm học là bắt buộc')
      return
    }
    if (!formData.submissionStartDate || !formData.submissionEndDateApplied || !formData.submissionEndDateBasic) {
      setFormError('Vui lòng nhập đầy đủ các mốc thời gian')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const payload = {
        name: formData.name,
        academicYear: formData.academicYear,
        submissionStartDate: toIso(formData.submissionStartDate),
        submissionEndDateApplied: toIso(formData.submissionEndDateApplied),
        submissionEndDateBasic: toIso(formData.submissionEndDateBasic),
        fundingCapApplied: Number(formData.fundingCapApplied),
        fundingCapBasic: Number(formData.fundingCapBasic),
        description: formData.description || undefined,
      }
      if (editingCycle) {
        const res = await cycleService.update(editingCycle.id, payload)
        if (res.success && res.data) {
          setCycles((prev) => prev.map((c) => (c.id === editingCycle.id ? res.data! : c)))
          setShowModal(false)
        } else {
          setFormError(res.message || 'Cập nhật thất bại')
        }
      } else {
        const res = await cycleService.create(payload)
        if (res.success && res.data) {
          setCycles((prev) => [res.data!, ...prev])
          setShowModal(false)
        } else {
          setFormError(res.message || 'Tạo đợt thất bại')
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
      const res = await cycleService.toggleStatus(id)
      if (res.success && res.data) {
        setCycles((prev) => prev.map((c) => (c.id === id ? res.data! : c)))
      }
    } catch (err) {
      console.error('Toggle status failed:', err)
    }
  }

  // Track workspace (6.4)
  if (workspaceCycle) {
    return <TrackWorkspace cycle={workspaceCycle} onBack={() => setWorkspaceCycle(null)} />
  }

  const openCount = cycles.filter((c) => c.status === 'Open').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Đợt nộp (Cycles)</h2>
          <p className="text-gray-500 mt-1">Cấu hình đợt NCKH, mốc thời gian và hạn mức kinh phí</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Tạo đợt mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Tổng số đợt</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{cycles.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Đang mở</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{openCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Tổng số track</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {cycles.reduce((sum, c) => sum + c.trackCount, 0)}
          </p>
        </div>
      </div>

      {/* Cycle list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Đang tải dữ liệu...</div>
        ) : cycles.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <CalendarRange className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            Chưa có đợt nộp nào. Bấm "Tạo đợt mới" để bắt đầu.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Đợt nộp</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thời gian nộp</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hạn mức KP</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cycles.map((cycle) => (
                  <tr key={cycle.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                          <CalendarRange className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{cycle.name}</p>
                          <p className="text-sm text-gray-500">Năm học {cycle.academicYear}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <p>Mở: {new Date(cycle.submissionStartDate).toLocaleDateString('vi-VN')}</p>
                      <p>Quý I: {new Date(cycle.submissionEndDateApplied).toLocaleDateString('vi-VN')}</p>
                      <p>Quý II: {new Date(cycle.submissionEndDateBasic).toLocaleDateString('vi-VN')}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <p className="flex items-center gap-1">
                        <Wallet className="w-4 h-4 text-gray-400" /> Applied: {formatVnd(cycle.fundingCapApplied)}
                      </p>
                      <p className="flex items-center gap-1">
                        <Wallet className="w-4 h-4 text-gray-400" /> Basic: {formatVnd(cycle.fundingCapBasic)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          cycle.status === 'Open'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {cycle.status === 'Open' ? 'Đang mở' : 'Đã đóng'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setWorkspaceCycle(cycle)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                          title="Quản lý track"
                        >
                          <Layers className="w-4 h-4" />
                          Tracks ({cycle.trackCount})
                        </button>
                        <button
                          onClick={() => handleOpenModal(cycle)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggle(cycle.id)}
                          className={`p-2 rounded-lg transition ${
                            cycle.status === 'Open'
                              ? 'text-orange-600 hover:bg-orange-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={cycle.status === 'Open' ? 'Đóng đợt' : 'Mở đợt'}
                        >
                          <Power className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-800">
                {editingCycle ? 'Chỉnh sửa đợt nộp' : 'Tạo đợt nộp mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên đợt *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="vd: NCKH Cấp Trường 2026"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Năm học *</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="vd: 2025-2026"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngày mở nộp *</label>
                  <input
                    type="date"
                    value={formData.submissionStartDate}
                    onChange={(e) => setFormData({ ...formData, submissionStartDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hạn Quý I (Applied) *</label>
                  <input
                    type="date"
                    value={formData.submissionEndDateApplied}
                    onChange={(e) => setFormData({ ...formData, submissionEndDateApplied: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hạn Quý II (Basic) *</label>
                  <input
                    type="date"
                    value={formData.submissionEndDateBasic}
                    onChange={(e) => setFormData({ ...formData, submissionEndDateBasic: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hạn mức KP Applied (₫)</label>
                  <input
                    type="number"
                    value={formData.fundingCapApplied}
                    onChange={(e) => setFormData({ ...formData, fundingCapApplied: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hạn mức KP Basic (₫)</label>
                  <input
                    type="number"
                    value={formData.fundingCapBasic}
                    onChange={(e) => setFormData({ ...formData, fundingCapBasic: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 sticky bottom-0">
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
                {saving ? 'Đang lưu...' : editingCycle ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
