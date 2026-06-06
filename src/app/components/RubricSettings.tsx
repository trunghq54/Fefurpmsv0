import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X, GripVertical } from 'lucide-react'
import { rubricService } from '../../services/rubricService'
import type { SaveRubricCriterionRequest } from '../../services/rubricService'
import type { RubricCriterionDto } from '../../types/review'

const ROUND_TYPES = [
  { value: 1, key: 'ProposalReview', label: 'Vòng Xét duyệt' },
  { value: 2, key: 'ProgressCheck', label: 'Vòng Kiểm tra tiến độ' },
  { value: 3, key: 'Acceptance', label: 'Vòng Nghiệm thu' },
] as const

const ROUND_VALUE: Record<string, number> = { ProposalReview: 1, ProgressCheck: 2, Acceptance: 3 }

const emptyForm = (roundType: number, orderIndex: number): SaveRubricCriterionRequest => ({
  roundType, orderIndex, name: '', maxScore: 10, isActive: true,
})

export default function RubricSettings() {
  const [criteria, setCriteria] = useState<RubricCriterionDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<RubricCriterionDto | null>(null)
  const [form, setForm] = useState<SaveRubricCriterionRequest>(emptyForm(1, 1))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    const res = await rubricService.getCriteria()
    if (res.success && res.data) setCriteria(res.data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openAdd = (roundType: number) => {
    const count = criteria.filter((c) => ROUND_VALUE[c.roundType] === roundType).length
    setEditing(null)
    setForm(emptyForm(roundType, count + 1))
    setError('')
    setShowModal(true)
  }
  const openEdit = (c: RubricCriterionDto) => {
    setEditing(c)
    setForm({ roundType: ROUND_VALUE[c.roundType], orderIndex: c.orderIndex, name: c.name, maxScore: c.maxScore, isActive: c.isActive })
    setError('')
    setShowModal(true)
  }

  const save = async () => {
    if (!form.name.trim()) { setError('Nhập tên tiêu chí'); return }
    if (form.maxScore <= 0) { setError('Điểm tối đa phải > 0'); return }
    setSaving(true); setError('')
    try {
      const res = editing ? await rubricService.update(editing.id, form) : await rubricService.create(form)
      if (res.success) { setShowModal(false); await load() }
      else setError(res.message || 'Lưu thất bại')
    } catch (e: any) {
      setError(e.response?.data?.message || 'Có lỗi xảy ra')
    } finally { setSaving(false) }
  }

  const remove = async (c: RubricCriterionDto) => {
    if (!window.confirm(`Xoá tiêu chí "${c.name}"?`)) return
    await rubricService.remove(c.id)
    await load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Tiêu chí chấm điểm</h2>
        <p className="text-gray-500 mt-1">Cấu hình bộ tiêu chí RIÊNG cho từng loại vòng. Người chấm sẽ thấy đúng các tiêu chí này.</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">Đang tải...</div>
      ) : (
        ROUND_TYPES.map((rt) => {
          const items = criteria.filter((c) => ROUND_VALUE[c.roundType] === rt.value).sort((a, b) => a.orderIndex - b.orderIndex)
          const total = items.reduce((s, c) => s + c.maxScore, 0)
          return (
            <div key={rt.value} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{rt.label}</h3>
                  <p className="text-sm text-gray-500">{items.length} tiêu chí · tổng {total} điểm</p>
                </div>
                <button onClick={() => openAdd(rt.value)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="w-4 h-4" /> Thêm tiêu chí
                </button>
              </div>
              {items.length === 0 ? (
                <div className="p-6 text-sm text-gray-400">Chưa có tiêu chí. Bấm "Thêm tiêu chí".</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {items.map((c) => (
                    <div key={c.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-gray-300" />
                        <span className="text-gray-400 text-sm w-5">{c.orderIndex}.</span>
                        <span className="font-medium text-gray-800">{c.name}</span>
                        {!c.isActive && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded">ẩn</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700">tối đa {c.maxScore}đ</span>
                        <button onClick={() => openEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Sửa"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => remove(c)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Xoá"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">{editing ? 'Sửa tiêu chí' : 'Thêm tiêu chí'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại vòng</label>
                <select value={form.roundType} onChange={(e) => setForm({ ...form, roundType: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                  {ROUND_TYPES.map((rt) => <option key={rt.value} value={rt.value}>{rt.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên tiêu chí *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Điểm tối đa *</label>
                  <input type="number" min={1} value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thứ tự</label>
                  <input type="number" min={1} value={form.orderIndex} onChange={(e) => setForm({ ...form, orderIndex: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-blue-600" />
                Đang dùng (bỏ tích để ẩn khỏi phiếu chấm)
              </label>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-100">Hủy</button>
              <button onClick={save} disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
