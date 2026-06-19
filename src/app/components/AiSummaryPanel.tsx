import { useState, useEffect } from 'react'
import { Sparkles, Save, CheckCircle, X, RefreshCw, FileText, AlertTriangle } from 'lucide-react'
import { aiService } from '../../services/aiService'
import { Button, Textarea } from './ui-kit'

interface Props {
  proposalId: string
  assignmentId?: string
}

function SourceBanner({ source, sourceFileName }: { source?: string; sourceFileName?: string }) {
  if (source === 'pdf') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-start gap-3">
        <FileText className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-green-700">
          Đã tóm tắt từ <b>file thuyết minh PDF</b>: {sourceFileName}
        </p>
      </div>
    )
  }
  if (source === 'unreadableFile') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-700">
          Tài liệu tải lên (<b>{sourceFileName}</b>) là hình ảnh hoặc định dạng AI không đọc được. Bản tóm tắt dưới đây{' '}
          <b>chỉ dựa trên thông tin đề xuất đã nhập</b>, KHÔNG đọc nội dung file.
        </p>
      </div>
    )
  }
  return (
    <div className="bg-purple-50 border border-purple-100 rounded-lg px-4 py-3 flex items-start gap-3">
      <FileText className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
      <p className="text-sm text-purple-700">Chưa có file PDF — AI tóm tắt từ các trường thông tin đề xuất đã nhập.</p>
    </div>
  )
}

export default function AiSummaryPanel({ proposalId, assignmentId }: Props) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [source, setSource] = useState<string | undefined>()
  const [sourceFileName, setSourceFileName] = useState<string | undefined>()
  const [hasSummary, setHasSummary] = useState(false)
  const [edited, setEdited] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Per-criterion rubric assessment (reviewer only)
  const [assessment, setAssessment] = useState('')
  const [assessmentBusy, setAssessmentBusy] = useState(false)
  const [assessmentMsg, setAssessmentMsg] = useState('')

  // Close on Esc
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  // Load existing summary when panel opens for the first time
  useEffect(() => {
    if (!open || loaded) return
    aiService.getSummary(proposalId).then((res) => {
      if (res.success && res.data) {
        const d = res.data
        setText(d.editedText || d.summaryText)
        setHasSummary(true)
        setEdited(d.isEditedByHuman)
        setSource(d.source)
        setSourceFileName(d.sourceFileName)
      }
      setLoaded(true)
    })
  }, [open, loaded, proposalId])

  const generate = async () => {
    setBusy(true)
    setMsg('')
    setSaved(false)
    try {
      const res = await aiService.generateSummary(proposalId)
      if (res.success && res.data) {
        setText(res.data.summaryText)
        setHasSummary(true)
        setEdited(false)
        setSource(res.data.source)
        setSourceFileName(res.data.sourceFileName)
      } else {
        setMsg(res.message || 'Lỗi')
      }
    } catch (e: any) {
      setMsg(e.response?.data?.message || 'Cần cấu hình Gemini API key để tạo tóm tắt AI.')
    } finally {
      setBusy(false)
    }
  }

  const save = async () => {
    setBusy(true)
    setSaved(false)
    try {
      const res = await aiService.updateSummary(proposalId, text)
      if (res.success) {
        setSaved(true)
        setHasSummary(true)
        setEdited(true)
      }
    } finally {
      setBusy(false)
    }
  }

  const generateAssessment = async () => {
    if (!assignmentId) return
    setAssessmentBusy(true)
    setAssessmentMsg('')
    try {
      const res = await aiService.aiRubricAssessment(assignmentId)
      if (res.success && res.data) {
        setAssessment(res.data.assessment)
      } else {
        setAssessmentMsg(res.message || 'Lỗi')
      }
    } catch (e: any) {
      setAssessmentMsg(e.response?.data?.message || 'Cần cấu hình Gemini API key.')
    } finally {
      setAssessmentBusy(false)
    }
  }

  return (
    <>
      {/* Trigger */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="border-purple-200 text-purple-700 hover:bg-purple-50"
      >
        <Sparkles className="w-4 h-4" />
        Tóm tắt AI {hasSummary && <span className="text-xs text-purple-400">·đã có</span>}
      </Button>

      {/* Non-blocking right-side panel — no backdrop, page stays interactive */}
      {open && (
        <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-white border-l border-gray-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-800">Tóm tắt AI</h3>
              {edited && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">đã chỉnh sửa</span>
              )}
            </div>
            <button onClick={() => setOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Source banner — dynamic based on actual source */}
            <SourceBanner source={source} sourceFileName={sourceFileName} />

            {/* Generate / Regenerate CTA */}
            <Button onClick={generate} disabled={busy} className="w-full py-3 bg-purple-600 hover:bg-purple-700">
              <Sparkles className="w-4 h-4" />
              {busy ? 'Đang xử lý...' : hasSummary ? 'Tạo lại tóm tắt' : 'Tóm tắt tài liệu'}
            </Button>

            {msg && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-lg">
                {msg}
              </div>
            )}

            {/* Summary editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung tóm tắt</label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                placeholder="Chưa có tóm tắt. Bấm 'Tóm tắt tài liệu' để tạo bằng AI, hoặc tự nhập."
                className="px-4 py-3 focus:ring-purple-500 resize-none"
              />
            </div>

            {/* Save */}
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={save} disabled={busy || !text.trim()}>
                <Save className="w-4 h-4" /> Lưu chỉnh sửa
              </Button>
              {saved && (
                <span className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" /> Đã lưu
                </span>
              )}
              {hasSummary && (
                <Button
                  variant="ghost"
                  onClick={generate}
                  disabled={busy}
                  className="text-purple-600 hover:bg-purple-50"
                  title="Tạo lại từ AI"
                >
                  <RefreshCw className="w-4 h-4" /> Tạo lại
                </Button>
              )}
            </div>

            {/* Per-criterion rubric assessment — only shown when opened from reviewer scoring screen */}
            {assignmentId && (
              <div className="border-t border-gray-200 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700">AI đánh giá theo tiêu chí</h4>
                  {assessment && (
                    <button
                      onClick={generateAssessment}
                      disabled={assessmentBusy}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-60"
                    >
                      <RefreshCw className="w-3 h-3" /> Đánh giá lại
                    </button>
                  )}
                </div>

                {!assessment && (
                  <Button
                    variant="outline"
                    onClick={generateAssessment}
                    disabled={assessmentBusy}
                    className="w-full py-2.5 border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    {assessmentBusy ? 'Đang đánh giá...' : 'Đánh giá theo tiêu chí'}
                  </Button>
                )}

                {assessmentBusy && !assessment && (
                  <p className="text-sm text-gray-400 text-center">Đang phân tích từng tiêu chí...</p>
                )}

                {assessmentMsg && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-lg">
                    {assessmentMsg}
                  </div>
                )}

                {assessment && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{assessment}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
