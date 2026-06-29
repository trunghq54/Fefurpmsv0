import { useState, useEffect } from 'react'
import { Plus, Edit, X, Power, Layers, CalendarRange, Wallet, Tag } from 'lucide-react'
import { cycleService } from '../../services/cycleService'
import type { CycleDto, ResearchTypeOption } from '../../types/cycle'
import { useTranslation } from 'react-i18next'
import TrackWorkspace from './TrackWorkspace'
import ResearchTypeManagement from './ResearchTypeManagement'
import { Button, Input, Textarea } from './ui-kit'

interface CycleForm {
  name: string
  academicYear: string
  researchTypeId: number
  submissionStartDate: string
  submissionDeadline: string
  description: string
}

const defaultForm: CycleForm = {
  name: '',
  academicYear: '',
  researchTypeId: 0,
  submissionStartDate: '',
  submissionDeadline: '',
  description: '',
}

const toDateInput = (iso: string) => (iso ? iso.slice(0, 10) : '')
const formatVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫'

export default function CycleManagement() {
  const { t } = useTranslation()
  const [cycles, setCycles] = useState<CycleDto[]>([])
  const [researchTypes, setResearchTypes] = useState<ResearchTypeOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCycle, setEditingCycle] = useState<CycleDto | null>(null)
  const [formData, setFormData] = useState<CycleForm>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [workspaceCycle, setWorkspaceCycle] = useState<CycleDto | null>(null)
  const [showTypeManager, setShowTypeManager] = useState(false)

  useEffect(() => {
    Promise.all([cycleService.getAll(), cycleService.getResearchTypes()]).then(([cycleRes, typeRes]) => {
      if (cycleRes.success && cycleRes.data) setCycles(cycleRes.data)
      if (typeRes.success && typeRes.data) setResearchTypes(typeRes.data)
      setLoading(false)
    })
  }, [])

  const selectedType = researchTypes.find((t) => t.id === formData.researchTypeId) ?? null

  const handleOpenModal = (cycle?: CycleDto) => {
    if (cycle) {
      setEditingCycle(cycle)
      setFormData({
        name: cycle.name,
        academicYear: cycle.academicYear,
        researchTypeId: cycle.researchTypeId,
        submissionStartDate: toDateInput(cycle.submissionStartDate),
        submissionDeadline: toDateInput(cycle.submissionDeadline),
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
    if (!formData.researchTypeId) {
      setFormError('Vui lòng chọn loại đề tài')
      return
    }
    if (!formData.submissionStartDate || !formData.submissionDeadline) {
      setFormError('Vui lòng nhập đầy đủ các mốc thời gian')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const payload = {
        name: formData.name,
        academicYear: formData.academicYear,
        researchTypeId: formData.researchTypeId,
        submissionStartDate: formData.submissionStartDate,
        submissionDeadline: formData.submissionDeadline,
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
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      setFormError(e.response?.data?.message || e.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (cycle: CycleDto) => {
    try {
      const res = cycle.status === 'Open' ? await cycleService.close(cycle.id) : await cycleService.open(cycle.id)
      if (res.success && res.data) {
        setCycles((prev) => prev.map((c) => (c.id === cycle.id ? res.data! : c)))
      }
    } catch (err) {
      console.error('Toggle status failed:', err)
    }
  }

  if (workspaceCycle) {
    return <TrackWorkspace cycle={workspaceCycle} onBack={() => setWorkspaceCycle(null)} />
  }

  if (showTypeManager) {
    return <ResearchTypeManagement onBack={() => setShowTypeManager(false)} />
  }

  const openCount = cycles.filter((c) => c.status === 'Open').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Đợt nộp (Cycles)</h2>
          <p className="text-gray-500 mt-1">Cấu hình đợt NCKH — mỗi đợt thuộc một loại đề tài</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowTypeManager(true)}>
            <Tag className="w-4 h-4" /> Quản lý loại đề tài
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-5 h-5" /> Tạo đợt mới
          </Button>
        </div>
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
          <p className="text-sm text-gray-500">{t('track.count')}</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{cycles.reduce((sum, c) => sum + c.trackCount, 0)}</p>
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Loại đề tài</th>
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
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {cycle.researchTypeName || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <p>Mở: {new Date(cycle.submissionStartDate).toLocaleDateString('vi-VN')}</p>
                      <p>Hạn nộp: {new Date(cycle.submissionDeadline).toLocaleDateString('vi-VN')}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <p className="flex items-center gap-1">
                        <Wallet className="w-4 h-4 text-gray-400" /> {formatVnd(cycle.fundingCap)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          cycle.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {cycle.status === 'Open' ? 'Đang mở' : 'Đã đóng'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setWorkspaceCycle(cycle)}
                          title={t('track.manage')}
                          className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        >
                          <Layers className="w-4 h-4" /> {t('common.tracks')} ({cycle.trackCount})
                        </Button>
                        <button
                          onClick={() => handleOpenModal(cycle)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggle(cycle)}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
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
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="vd: NCKH Cấp Trường 2026"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Năm học *</label>
                  <Input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="vd: 2026"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại đề tài *</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.researchTypeId}
                    onChange={(e) => setFormData({ ...formData, researchTypeId: Number(e.target.value) })}
                  >
                    <option value={0}>-- Chọn loại --</option>
                    {researchTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedType && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hạn mức kinh phí tối đa (theo loại)
                    </label>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
                      <Wallet className="w-4 h-4 text-gray-400" />
                      {formatVnd(selectedType.maxBudgetCap)}
                      <span className="text-gray-400 ml-1">(chỉ xem — xác định theo loại đề tài)</span>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngày mở nộp *</label>
                  <Input
                    type="date"
                    value={formData.submissionStartDate}
                    onChange={(e) => setFormData({ ...formData, submissionStartDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hạn nộp đề cương *</label>
                  <Input
                    type="date"
                    value={formData.submissionDeadline}
                    onChange={(e) => setFormData({ ...formData, submissionDeadline: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
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
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Đang lưu...' : editingCycle ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
