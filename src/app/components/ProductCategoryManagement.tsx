import { useState, useEffect } from 'react'
import { Plus, Edit, X, Tag, ToggleLeft, ToggleRight } from 'lucide-react'
import { productCategoryService } from '../../services/productCategoryService'
import type { ProductCategoryDto, ProductCategoryRequest } from '../../services/productCategoryService'

const emptyForm: ProductCategoryRequest = { code: '', name: '', isActive: true }

export default function ProductCategoryManagement() {
  const [categories, setCategories] = useState<ProductCategoryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<ProductCategoryDto | null>(null)
  const [form, setForm] = useState<ProductCategoryRequest>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    productCategoryService.getAll().then((res) => {
      if (res.success && res.data) setCategories(res.data)
      setLoading(false)
    })
  }
  useEffect(load, [])

  const openAdd = () => { setEditing(null); setForm(emptyForm); setError(''); setShowModal(true) }
  const openEdit = (c: ProductCategoryDto) => {
    setEditing(c)
    setForm({ code: c.code, name: c.name, isActive: c.isActive })
    setError(''); setShowModal(true)
  }

  const save = async () => {
    if (!form.code.trim() || !form.name.trim()) { setError('Nhập mã và tên danh mục'); return }
    setSaving(true); setError('')
    try {
      const res = editing
        ? await productCategoryService.update(editing.id, form)
        : await productCategoryService.create(form)
      if (res.success) { setShowModal(false); load() }
      else setError(res.message || 'Lưu thất bại')
    } catch (e: any) {
      setError(e.response?.data?.message || 'Có lỗi xảy ra')
    } finally { setSaving(false) }
  }

  const toggleActive = async (c: ProductCategoryDto) => {
    await productCategoryService.update(c.id, { code: c.code, name: c.name, isActive: !c.isActive })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Danh mục sản phẩm</h2>
          <p className="text-gray-500 mt-1">Các loại sản phẩm/deliverable trong đề xuất nghiên cứu</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Thêm danh mục
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Đang tải...</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" /> Chưa có danh mục nào.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mã</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tên danh mục</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-mono text-gray-600">{c.code}</td>
                  <td className="px-6 py-3 font-medium text-gray-800">{c.name}</td>
                  <td className="px-6 py-3">
                    <button onClick={() => toggleActive(c)} className="flex items-center gap-1 text-sm">
                      {c.isActive
                        ? <><ToggleRight className="w-5 h-5 text-green-500" /><span className="text-green-700">Đang dùng</span></>
                        : <><ToggleLeft className="w-5 h-5 text-gray-400" /><span className="text-gray-500">Ẩn</span></>}
                    </button>
                  </td>
                  <td className="px-6 py-3">
                    <button onClick={() => openEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">{editing ? 'Sửa danh mục' : 'Thêm danh mục'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã danh mục *</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="VD: JOURNAL, PATENT, SOFTWARE"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="VD: Bài báo ISI/Scopus, Bằng sáng chế"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.isActive ?? true}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-blue-600" />
                Đang sử dụng
              </label>
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
