import { useState, useEffect } from 'react'
import { Sparkles, Save, CheckCircle, X, RefreshCw, FileText } from 'lucide-react'
import { aiService } from '../../services/aiService'

export default function AiSummaryPanel({ proposalId }: { proposalId: string }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [hasSummary, setHasSummary] = useState(false)
  const [edited, setEdited] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Load existing summary when panel opens for the first time
  useEffect(() => {
    if (!open || loaded) return
    aiService.getSummary(proposalId).then((res) => {
      if (res.success && res.data) {
        const d = res.data
        setText(d.editedText || d.summaryText)
        setHasSummary(true)
        setEdited(d.isEditedByHuman)
      }
      setLoaded(true)
    })
  }, [open, loaded, proposalId])

  const generate = async () => {
    setBusy(true); setMsg(''); setSaved(false)
    try {
      const res = await aiService.generateSummary(proposalId)
      if (res.success && res.data) {
        setText(res.data.summaryText)
        setHasSummary(true)
        setEdited(false)
      } else {
        setMsg(res.message || 'Lỗi')
      }
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
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition"
      >
        <Sparkles className="w-4 h-4" />
        Tóm tắt AI {hasSummary && <span className="text-xs text-purple-400">·đã có</span>}
      </button>

      {/* Slide-over overlay */}
      {open && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-30" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="absolute inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-gray-800">Tóm tắt AI</h3>
                {edited && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">đã chỉnh sửa</span>}
              </div>
              <button onClick={() => setOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Source info */}
              <div className="bg-purple-50 border border-purple-100 rounded-lg px-4 py-3 flex items-start gap-3">
                <FileText className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-purple-700">
                  AI sẽ tóm tắt từ <b>file thuyết minh PDF</b> (nếu đã tải lên) — hoặc từ các trường thông tin đề xuất nếu chưa có PDF.
                </p>
              </div>

              {/* Generate / Regenerate CTA */}
              <button
                onClick={generate}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-60"
              >
                <Sparkles className="w-4 h-4" />
                {busy ? 'Đang xử lý...' : hasSummary ? 'Tạo lại tóm tắt' : 'Tóm tắt tài liệu'}
              </button>

              {msg && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-lg">{msg}</div>
              )}

              {/* Summary editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung tóm tắt</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={12}
                  placeholder="Chưa có tóm tắt. Bấm 'Tóm tắt tài liệu' để tạo bằng AI, hoặc tự nhập."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Save */}
              <div className="flex items-center gap-3">
                <button
                  onClick={save}
                  disabled={busy || !text.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                >
                  <Save className="w-4 h-4" /> Lưu chỉnh sửa
                </button>
                {saved && (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" /> Đã lưu
                  </span>
                )}
                {hasSummary && (
                  <button
                    onClick={generate}
                    disabled={busy}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-60"
                    title="Tạo lại từ AI"
                  >
                    <RefreshCw className="w-4 h-4" /> Tạo lại
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
