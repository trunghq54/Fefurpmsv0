import { useState, useEffect } from 'react'
import { Check, X, FileEdit, Inbox } from 'lucide-react'
import { changeRequestService } from '../../services/changeRequestService'
import type { ChangeRequestDto } from '../../types/changeRequest'
import { CHANGE_TYPE_LABEL } from '../../types/changeRequest'

export default function ChangeRequestQueue() {
  const [items, setItems] = useState<ChangeRequestDto[]>([])
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    changeRequestService.getPending().then((res) => {
      if (res.success && res.data) setItems(res.data)
      setLoading(false)
    })
  }
  useEffect(load, [])

  const review = async (id: string, approved: boolean) => {
    setBusy(id)
    try {
      const res = await changeRequestService.review(id, { approved, adminNote: notes[id] || undefined })
      if (res.success) setItems((prev) => prev.filter((x) => x.id !== id))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Yêu cầu thay đổi</h2>
        <p className="text-gray-500 mt-1">Duyệt các yêu cầu gia hạn / thay đổi / tạm dừng từ chủ nhiệm</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">Đang tải...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          <Inbox className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          Không có yêu cầu nào đang chờ duyệt.
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((cr) => (
            <div key={cr.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileEdit className="w-5 h-5 text-blue-500" />
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-sm">{CHANGE_TYPE_LABEL[cr.type] || cr.type}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800">{cr.proposalTitleVI}</h3>
                  <p className="text-sm text-gray-600 mt-1">{cr.description}</p>
                  {cr.newValue && <p className="text-sm text-gray-500 mt-1">Giá trị mới: <b>{cr.newValue}</b></p>}
                  <p className="text-xs text-gray-400 mt-1">Yêu cầu: {new Date(cr.requestedAt).toLocaleString('vi-VN')}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input value={notes[cr.id] || ''} onChange={(e) => setNotes({ ...notes, [cr.id]: e.target.value })}
                  placeholder="Ghi chú của admin (tùy chọn)"
                  className="flex-1 min-w-[220px] px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                <button onClick={() => review(cr.id, true)} disabled={busy === cr.id}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60">
                  <Check className="w-4 h-4" /> Duyệt
                </button>
                <button onClick={() => review(cr.id, false)} disabled={busy === cr.id}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60">
                  <X className="w-4 h-4" /> Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
