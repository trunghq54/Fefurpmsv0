import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Edit, Trash2, RotateCcw, Power, Tag } from 'lucide-react'
import { cycleService } from '../../services/cycleService'
import type { ResearchTypeOption } from '../../types/cycle'
import { Button, Input, Modal } from './ui-kit'

const formatVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫'

interface TypeForm {
  name: string
  maxBudgetCap: number
  requireOrderingUnit: boolean
}

const defaultForm: TypeForm = { name: '', maxBudgetCap: 100_000_000, requireOrderingUnit: false }

export default function ResearchTypeManagement({ onBack }: { onBack: () => void }) {
  const [types, setTypes] = useState<ResearchTypeOption[]>([])
  const [showTrash, setShowTrash] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<ResearchTypeOption | null>(null)
  const [form, setForm] = useState<TypeForm>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const load = () => {
    setLoading(true)
    cycleService.getResearchTypes(true).then((r) => {
      if (r.success && r.data) setTypes(r.data)
      setLoading(false)
    })
  }
  useEffect(load, [])

  const shown = types.filter((t) => (showTrash ? !t.isActive : t.isActive))
  const trashCount = types.filter((t) => !t.isActive).length

  const openAdd = () => {
    setEditing(null)
    setForm(defaultForm)
    setErr('')
    setShowModal(true)
  }
  const openEdit = (t: ResearchTypeOption) => {
    setEditing(t)
    setForm({ name: t.name, maxBudgetCap: t.maxBudgetCap, requireOrderingUnit: !!t.requireOrderingUnit })
    setErr('')
    setShowModal(true)
  }

  const save = async () => {
    if (!form.name.trim()) {
      setErr('Tên loại đề tài là bắt buộc')
      return
    }
    setSaving(true)
    setErr('')
    try {
      const r = editing
        ? await cycleService.updateResearchType(editing.id, form)
        : await cycleService.createResearchType(form)
      if (r.success) {
        setShowModal(false)
        load()
      } else setErr(r.message || 'Lưu thất bại')
    } catch (e: unknown) {
      const ex = e as { response?: { data?: { message?: string } } }
      setErr(ex.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const deactivate = async (t: ResearchTypeOption) => {
    await cycleService.deactivateResearchType(t.id)
    load()
  }
  const reactivate = async (t: ResearchTypeOption) => {
    await cycleService.reactivateResearchType(t.id)
    load()
  }
  const remove = async (t: ResearchTypeOption) => {
    if (!window.confirm(`Xóa VĨNH VIỄN loại "${t.name}"? Không khôi phục được.`)) return
    try {
      const r = await cycleService.deleteResearchType(t.id)
      if (!r.success) window.alert(r.message || 'Không xóa được.')
      load()
    } catch (e: unknown) {
      const ex = e as { response?: { data?: { message?: string } } }
      window.alert(ex.response?.data?.message || 'Không xóa được (đang được sử dụng).')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition" title="Quay lại">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Quản lý Loại đề tài</h2>
            <p className="text-gray-500 mt-1">Thêm / sửa / vô hiệu hóa loại đề tài cho các đợt NCKH</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showTrash ? 'primary' : 'outline'}
            onClick={() => setShowTrash((v) => !v)}
            title="Xem các loại đã vô hiệu hóa"
          >
            <Trash2 className="w-4 h-4" /> Thùng rác ({trashCount})
          </Button>
          {!showTrash && (
            <Button onClick={openAdd}>
              <Plus className="w-5 h-5" /> Thêm loại
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Đang tải dữ liệu...</div>
        ) : shown.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            {showTrash ? 'Thùng rác trống.' : 'Chưa có loại đề tài nào. Bấm "Thêm loại".'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tên loại</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mã</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hạn mức KP</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Đặt hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {shown.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800">{t.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{t.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatVnd(t.maxBudgetCap)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.requireOrderingUnit ? 'Có' : 'Không'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {showTrash ? (
                          <>
                            <button
                              onClick={() => reactivate(t)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Khôi phục"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => remove(t)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Xóa vĩnh viễn"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => openEdit(t)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Chỉnh sửa"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deactivate(t)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                              title="Vô hiệu hóa (vào thùng rác)"
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          </>
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

      {showModal && (
        <Modal
          title={editing ? 'Chỉnh sửa loại đề tài' : 'Thêm loại đề tài'}
          onClose={() => setShowModal(false)}
          className="max-w-lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Hủy
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </>
          }
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên loại *</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="vd: Nghiên cứu ứng dụng"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hạn mức kinh phí (₫)</label>
            <Input
              type="number"
              value={form.maxBudgetCap}
              onChange={(e) => setForm({ ...form, maxBudgetCap: Number(e.target.value) })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.requireOrderingUnit}
              onChange={(e) => setForm({ ...form, requireOrderingUnit: e.target.checked })}
            />
            Yêu cầu đơn vị đặt hàng (luồng đặt hàng)
          </label>
          {err && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{err}</div>}
        </Modal>
      )}
    </div>
  )
}
