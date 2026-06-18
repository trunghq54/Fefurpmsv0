import { useState, useEffect } from 'react'
import { Plus, Edit, Tag, ToggleLeft, ToggleRight } from 'lucide-react'
import { productCategoryService } from '../../services/productCategoryService'
import type { ProductCategoryDto, ProductCategoryRequest } from '../../services/productCategoryService'
import { Button, Input, Modal } from './ui-kit'

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
        <Button onClick={openAdd}><Plus className="w-4 h-4" /> Thêm danh mục</Button>
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
        <Modal
          title={editing ? 'Sửa danh mục' : 'Thêm danh mục'}
          onClose={() => setShowModal(false)}
          footer={<>
            <Button variant="outline" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm'}</Button>
          </>}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã danh mục *</label>
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="VD: JOURNAL, PATENT, SOFTWARE" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục *</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Bài báo ISI/Scopus, Bằng sáng chế" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.isActive ?? true}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-blue-600" />
            Đang sử dụng
          </label>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
        </Modal>
      )}
    </div>
  )
}
