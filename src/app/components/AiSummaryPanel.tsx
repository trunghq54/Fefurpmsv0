import { useState, useEffect } from 'react'
import { Sparkles, Save, CheckCircle } from 'lucide-react'
import { aiService } from '../../services/aiService'

export default function AiSummaryPanel({ proposalId }: { proposalId: string }) {
  const [text, setText] = useState('')
  const [hasSummary, setHasSummary] = useState(false)
  const [edited, setEdited] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    aiService.getSummary(proposalId).then((res) => {
      if (res.success && res.data) {
        const d = res.data
        setText(d.editedText || d.summaryText)
        setHasSummary(true)
        setEdited(d.isEditedByHuman)
      }
    })
  }, [proposalId])

  const generate = async () => {
    setBusy(true); setMsg(''); setSaved(false)
    try {
      const res = await aiService.generateSummary(proposalId)
      if (res.success && res.data) { setText(res.data.summaryText); setHasSummary(true); setEdited(false) }
      else setMsg(res.message || 'Lỗi')
    } catch (e: any) {
      setMsg(e.response?.data?.message || 'Cần cấu hình Gemini API key để tạo tóm tắt AI.')
    } finally { setBusy(false) }
  }

  const save = async () => {
    setBusy(true); setSaved(false)
    try {
      const res = await aiService.updateSummary(proposalId, text)
      if (res.success) { setSaved(true); setHasSummary(true); setEdited(true) }
    } finally { setBusy(false) }
  }

  return (
    <div className="border-t border-gray-200 pt-5">
      <div className="flex items-center justify-between mb-2">
        <h5 className="flex items-center gap-2 font-semibold text-gray-800">
          <Sparkles className="w-4 h-4 text-purple-500" /> Tóm tắt AI {edited && <span className="text-xs text-gray-400">(đã chỉnh sửa)</span>}
        </h5>
        <button onClick={generate} disabled={busy}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60">
          <Sparkles className="w-4 h-4" /> {busy ? 'Đang xử lý...' : hasSummary ? 'Tạo lại' : 'Tạo tóm tắt AI'}
        </button>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5}
        placeholder="Chưa có tóm tắt. Bấm 'Tạo tóm tắt AI' (cần Gemini API key) hoặc tự nhập."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" />
      {msg && <div className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">{msg}</div>}
      <div className="mt-2 flex items-center gap-3">
        <button onClick={save} disabled={busy || !text.trim()}
          className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60">
          <Save className="w-4 h-4" /> Lưu chỉnh sửa
        </button>
        {saved && <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="w-4 h-4" /> Đã lưu</span>}
      </div>
    </div>
  )
}
