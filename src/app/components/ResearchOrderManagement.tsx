import { useState, useEffect } from 'react'
import { Plus, X, ClipboardList, Link2 } from 'lucide-react'
import { researchOrderService } from '../../services/researchOrderService'
import { organizationalUnitService } from '../../services/organizationalUnitService'
import { cycleService } from '../../services/cycleService'
import type { ResearchOrderDto } from '../../services/researchOrderService'
import type { OrgUnitDto } from '../../services/organizationalUnitService'
import type { CycleDto } from '../../types/cycle'

const STATUS_LABEL: Record<string, string> = { OPEN: 'Mở', MATCHED: 'Đã ghép', CLOSED: 'Đóng' }
const STATUS_COLOR: Record<string, string> = {
  OPEN: 'bg-green-100 text-green-800',
  MATCHED: 'bg-blue-100 text-blue-800',
  CLOSED: 'bg-gray-100 text-gray-800',
}

export default function ResearchOrderManagement() {
  const [orders, setOrders] = useState<ResearchOrderDto[]>([])
  const [units, setUnits] = useState<OrgUnitDto[]>([])
  const [cycles, setCycles] = useState<CycleDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ cycleId: 0, orderingUnitId: 0, researchArea: '', problemDescription: '', expectedProducts: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const load = () => {
    setLoading(true)
    Promise.all([
      researchOrderService.getAll(filterStatus !== 'all' ? { status: filterStatus } : undefined),
      organizationalUnitService.getAll(),
      cycleService.getAll(),
    ]).then(([ordRes, unitRes, cycRes]) => {
      if (ordRes.success && ordRes.data) setOrders(ordRes.data)
      if (unitRes.success && unitRes.data) setUnits(unitRes.data)
      if (cycRes.success && cycRes.data) setCycles(cycRes.data)
      setLoading(false)
    })
  }
  useEffect(load, [filterStatus])

  const openModal = () => {
    setForm({
      cycleId: cycles[0] ? Number(cycles[0].id) : 0,
      orderingUnitId: units[0]?.id ?? 0,
      researchArea: '',
      problemDescription: '',
      expectedProducts: '',
    })
    setError(''); setShowModal(true)
  }

  const create = async () => {
    if (!form.researchArea.trim() || !form.problemDescription.trim()) { setError('Nhập lĩnh vực và mô tả vấn đề'); return }
    if (!form.cycleId || !form.orderingUnitId) { setError('Chọn đợt nghiên cứu và đơn vị'); return }
    setSaving(true); setError('')
    try {
      const res = await researchOrderService.create({
        cycleId: form.cycleId,
        orderingUnitId: form.orderingUnitId,
        researchArea: form.researchArea,
        problemDescription: form.problemDescription,
        expectedProducts: form.expectedProducts || undefined,
      })
      if (res.success) { setShowModal(false); load() }
      else setError(res.message || 'Lưu thất bại')
    } catch (e: any) {
      setError(e.response?.data?.message || 'Có lỗi xảy ra')
    } finally { setSaving(false) }
  }

  const filteredOrders = filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Đặt hàng nghiên cứu</h2>
          <p className="text-gray-500 mt-1">Đơn vị yêu cầu nghiên cứu để giải quyết vấn đề thực tế</p>
        </div>
        <button onClick={openModal} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Tạo đặt hàng
        </button>
      </div>

      <div className="flex gap-2">
        {['all', 'OPEN', 'MATCHED', 'CLOSED'].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            {s === 'all' ? 'Tất cả' : (STATUS_LABEL[s] ?? s)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Đang tải...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" /> Chưa có đặt hàng nào.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredOrders.map((o) => (
              <div key={o.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{o.researchArea}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_COLOR[o.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{o.problemDescription}</p>
                    {o.expectedProducts && (
                      <p className="text-xs text-gray-400">Sản phẩm kỳ vọng: {o.expectedProducts}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span>Đơn vị: <b className="text-gray-600">{o.orderingUnitName}</b></span>
                      <span>· {new Date(o.createdAt).toLocaleDateString('vi-VN')}</span>
                      {o.matchedProposalId && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Link2 className="w-3 h-3" /> Đã ghép đề xuất
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Tạo đặt hàng nghiên cứu</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đợt nghiên cứu *</label>
                  <select value={form.cycleId} onChange={(e) => setForm({ ...form, cycleId: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                    {cycles.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị đặt hàng *</label>
                  <select value={form.orderingUnitId} onChange={(e) => setForm({ ...form, orderingUnitId: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                    {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lĩnh vực nghiên cứu *</label>
                <input value={form.researchArea} onChange={(e) => setForm({ ...form, researchArea: e.target.value })}
                  placeholder="VD: AI trong giáo dục, Năng lượng tái tạo..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả vấn đề *</label>
                <textarea rows={3} value={form.problemDescription} onChange={(e) => setForm({ ...form, problemDescription: e.target.value })}
                  placeholder="Mô tả chi tiết vấn đề cần nghiên cứu giải quyết..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm kỳ vọng</label>
                <input value={form.expectedProducts} onChange={(e) => setForm({ ...form, expectedProducts: e.target.value })}
                  placeholder="Hệ thống phần mềm, bài báo ISI, quy trình..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100">Hủy</button>
              <button onClick={create} disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Đang tạo...' : 'Tạo đặt hàng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
