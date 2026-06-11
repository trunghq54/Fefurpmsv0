import { useState, useEffect } from 'react'
import { Plus, Edit, X, Building2 } from 'lucide-react'
import { organizationalUnitService } from '../../services/organizationalUnitService'
import type { OrgUnitDto, OrgUnitRequest } from '../../services/organizationalUnitService'

const UNIT_TYPES = ['UNIVERSITY', 'FACULTY', 'DEPARTMENT', 'CENTER', 'INSTITUTE', 'OTHER']

const emptyForm: OrgUnitRequest = { code: '', name: '', unitType: 'FACULTY', sortOrder: 0 }

export default function OrgUnitManagement() {
  const [units, setUnits] = useState<OrgUnitDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<OrgUnitDto | null>(null)
  const [form, setForm] = useState<OrgUnitRequest>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    organizationalUnitService.getAll().then((res) => {
      if (res.success && res.data) setUnits(res.data)
      setLoading(false)
    })
  }
  useEffect(load, [])

  const openAdd = () => { setEditing(null); setForm(emptyForm); setError(''); setShowModal(true) }
  const openEdit = (u: OrgUnitDto) => {
    setEditing(u)
    setForm({ code: u.code, name: u.name, unitType: u.unitType, parentId: u.parentId, headUserId: u.headUserId, sortOrder: u.sortOrder })
    setError(''); setShowModal(true)
  }

  const save = async () => {
    if (!form.code.trim() || !form.name.trim()) { setError('Nhập mã và tên đơn vị'); return }
    setSaving(true); setError('')
    try {
      const res = editing
        ? await organizationalUnitService.update(editing.id, form)
        : await organizationalUnitService.create(form)
      if (res.success) { setShowModal(false); load() }
      else setError(res.message || 'Lưu thất bại')
    } catch (e: any) {
      setError(e.response?.data?.message || 'Có lỗi xảy ra')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Đơn vị tổ chức</h2>
          <p className="text-gray-500 mt-1">Quản lý khoa, bộ môn, trung tâm nghiên cứu</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Thêm đơn vị
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Đang tải...</div>
        ) : units.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" /> Chưa có đơn vị nào.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mã</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tên đơn vị</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Loại</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thứ tự</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {units.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-mono text-gray-600">{u.code}</td>
                  <td className="px-6 py-3 font-medium text-gray-800">{u.name}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{u.unitType}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">{u.sortOrder ?? '—'}</td>
                  <td className="px-6 py-3">
                    <button onClick={() => openEdit(u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">{editing ? 'Sửa đơn vị' : 'Thêm đơn vị'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã đơn vị *</label>
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="VD: FITHOU, DEPT_CS"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại đơn vị *</label>
                  <select value={form.unitType} onChange={(e) => setForm({ ...form, unitType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                    {UNIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên đơn vị *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Tên đầy đủ của đơn vị"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự hiển thị</label>
                <input type="number" min={0} value={form.sortOrder ?? 0}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100">Hủy</button>
              <button onClick={save} disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60">
                {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
