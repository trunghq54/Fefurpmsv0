import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  FileText, ThumbsUp, ThumbsDown, LogOut, ClipboardCheck, CheckCircle, ArrowLeft, Send,
} from 'lucide-react'
import { roundService } from '../../services/roundService'
import { scoringService } from '../../services/scoringService'
import { aiService } from '../../services/aiService'
import type { MyAssignmentDto } from '../../types/review'
import { RUBRIC_CRITERIA, VOTE_RESULT } from '../../types/review'

interface User { role: string; name: string }
interface ReviewerInterfaceProps { user: User }

const ROUND_LABEL: Record<string, string> = {
  ProposalReview: 'Xét duyệt', ProgressCheck: 'Kiểm tra tiến độ', Acceptance: 'Nghiệm thu',
}
const ROLE_LABEL: Record<string, string> = { Member: 'Thành viên', Chair: 'Chủ tịch', Opponent: 'Phản biện' }
const STATUS_COLOR: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800', Accepted: 'bg-green-100 text-green-800', Declined: 'bg-red-100 text-red-800',
}

export default function ReviewerInterface({ user }: ReviewerInterfaceProps) {
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState<MyAssignmentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<MyAssignmentDto | null>(null)

  const load = () => {
    setLoading(true)
    roundService.getMyAssignments().then((res) => {
      if (res.success && res.data) setAssignments(res.data)
      setLoading(false)
    })
  }
  useEffect(load, [])

  const respond = async (a: MyAssignmentDto, accept: boolean) => {
    const res = await roundService.respond(a.assignmentId, accept)
    if (res.success && res.data) {
      setAssignments((prev) => prev.map((x) => (x.assignmentId === a.assignmentId ? { ...x, status: res.data!.status } : x)))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">FURPMS</h1>
            <p className="text-sm text-gray-500">Reviewer Portal</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="border-l border-gray-300 pl-4">
              <p className="font-medium text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-500">Hội đồng phản biện</p>
            </div>
            <button onClick={() => { if (window.confirm('Đăng xuất?')) { navigate('/'); window.location.reload() } }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {active ? (
          <ScoringPanel assignment={active} onBack={() => { setActive(null); load() }} />
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Phân công của tôi</h2>
              <p className="text-gray-500 mt-1">Chấp nhận phân công và chấm điểm đề xuất</p>
            </div>

            {loading ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">Đang tải...</div>
            ) : assignments.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                Bạn chưa được phân công đề xuất nào.
              </div>
            ) : (
              <div className="grid gap-4">
                {assignments.map((a) => (
                  <div key={a.assignmentId} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-500" /> {a.proposalTitleVI}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">{ROUND_LABEL[a.roundType]}</span>
                          <span className="px-2 py-0.5 bg-gray-100 rounded">{ROLE_LABEL[a.role]}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLOR[a.status]}`}>{a.status}</span>
                          <span className="text-gray-400">· Đề xuất: {a.proposalStatus}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {a.status === 'Pending' && (
                          <>
                            <button onClick={() => respond(a, true)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                              <ThumbsUp className="w-4 h-4" /> Nhận
                            </button>
                            <button onClick={() => respond(a, false)} className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                              <ThumbsDown className="w-4 h-4" /> Từ chối
                            </button>
                          </>
                        )}
                        {a.status === 'Accepted' && (
                          <button onClick={() => setActive(a)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <ClipboardCheck className="w-4 h-4" /> Chấm điểm
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ScoringPanel({ assignment, onBack }: { assignment: MyAssignmentDto; onBack: () => void }) {
  const isAcceptance = assignment.roundType === 'Acceptance'
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{assignment.proposalTitleVI}</h2>
          <p className="text-gray-500 mt-1">{ROUND_LABEL[assignment.roundType]} · {ROLE_LABEL[assignment.role]}</p>
        </div>
      </div>
      {isAcceptance
        ? <VoteForm assignment={assignment} onDone={onBack} />
        : <RubricForm assignment={assignment} onDone={onBack} />}
    </div>
  )
}

function RubricForm({ assignment, onDone }: { assignment: MyAssignmentDto; onDone: () => void }) {
  const [scores, setScores] = useState<Record<string, number>>({ criterion1: 0, criterion2: 0, criterion3: 0, criterion4: 0, criterion5: 0 })
  const [comments, setComments] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [aiSug, setAiSug] = useState<Record<number, string>>({})
  const [aiBusy, setAiBusy] = useState<number | null>(null)

  const getAi = async (idx: number) => {
    setAiBusy(idx)
    try {
      const res = await aiService.aiFeedback(assignment.assignmentId, idx + 1)
      if (res.success && res.data) setAiSug((p) => ({ ...p, [idx]: res.data!.feedbackDraft }))
      else setAiSug((p) => ({ ...p, [idx]: res.message || 'Lỗi' }))
    } catch (e: any) {
      setAiSug((p) => ({ ...p, [idx]: e.response?.data?.message || 'Cần cấu hình Gemini API key.' }))
    } finally { setAiBusy(null) }
  }

  useEffect(() => {
    scoringService.getRubric(assignment.assignmentId).then((res) => {
      if (res.success && res.data) {
        const d = res.data
        setScores({ criterion1: d.criterion1, criterion2: d.criterion2, criterion3: d.criterion3, criterion4: d.criterion4, criterion5: d.criterion5 })
        setComments(d.comments || '')
      }
    })
  }, [assignment.assignmentId])

  const total = RUBRIC_CRITERIA.reduce((s, c) => s + (scores[c.key] || 0), 0)
  const maxTotal = RUBRIC_CRITERIA.reduce((s, c) => s + c.max, 0)

  const submit = async () => {
    setSaving(true); setError(''); setSaved(false)
    try {
      const res = await scoringService.submitRubric(assignment.assignmentId, {
        criterion1: scores.criterion1, criterion2: scores.criterion2, criterion3: scores.criterion3,
        criterion4: scores.criterion4, criterion5: scores.criterion5, comments: comments || undefined,
      })
      if (res.success) setSaved(true)
      else setError(res.message || 'Lỗi')
    } catch (e: any) {
      setError(e.response?.data?.message || 'Có lỗi xảy ra')
    } finally { setSaving(false) }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-5">
      <h3 className="text-lg font-semibold text-gray-800">Phiếu chấm điểm (thang 100)</h3>
      {RUBRIC_CRITERIA.map((c, idx) => (
        <div key={c.key}>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-gray-700">{c.name}</label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => getAi(idx)} disabled={aiBusy === idx}
                className="flex items-center gap-1 px-2 py-0.5 text-xs border border-purple-200 text-purple-700 rounded hover:bg-purple-50 disabled:opacity-60">
                ✨ {aiBusy === idx ? '...' : 'AI gợi ý'}
              </button>
              <span className="text-sm text-gray-500">{scores[c.key]} / {c.max}</span>
            </div>
          </div>
          <input type="range" min={0} max={c.max} value={scores[c.key]}
            onChange={(e) => setScores({ ...scores, [c.key]: Number(e.target.value) })}
            className="w-full accent-blue-600" />
          {aiSug[idx] && (
            <div className="mt-1 text-xs bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-gray-700">
              {aiSug[idx]}
              <button type="button" onClick={() => setComments((prev) => (prev ? prev + '\n' : '') + aiSug[idx])}
                className="ml-2 text-purple-600 hover:underline">Áp dụng</button>
            </div>
          )}
        </div>
      ))}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <span className="font-medium text-gray-700">Tổng điểm</span>
        <span className="text-2xl font-bold text-blue-600">{total} / {maxTotal}</span>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét</label>
        <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
        <p className="mt-1 text-xs text-gray-400">Dùng nút "✨ AI gợi ý" ở từng tiêu chí để nhận gợi ý nhận xét (cần Gemini API key).</p>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      <div className="flex items-center gap-3">
        <button onClick={submit} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60">
          <Send className="w-4 h-4" /> {saving ? 'Đang lưu...' : 'Nộp điểm'}
        </button>
        {saved && <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="w-4 h-4" /> Đã lưu</span>}
        <button onClick={onDone} className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Xong</button>
      </div>
    </div>
  )
}

function VoteForm({ assignment, onDone }: { assignment: MyAssignmentDto; onDone: () => void }) {
  const [vote, setVote] = useState<number>(VOTE_RESULT.Pass)
  const [writtenReview, setWrittenReview] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const isOpponent = assignment.role === 'Opponent'
  const [opp, setOpp] = useState<Record<string, number>>({ necessityScore: 3, contributionScore: 3, practicalScore: 3, resultScore: 3 })

  useEffect(() => {
    scoringService.getVote(assignment.assignmentId).then((res) => {
      if (res.success && res.data) {
        const d = res.data
        setVote(d.vote === 'Pass' ? 1 : d.vote === 'Fail' ? 2 : 3)
        setWrittenReview(d.writtenReview || '')
        setOpp({
          necessityScore: d.necessityScore ?? 3, contributionScore: d.contributionScore ?? 3,
          practicalScore: d.practicalScore ?? 3, resultScore: d.resultScore ?? 3,
        })
      }
    })
  }, [assignment.assignmentId])

  const submit = async () => {
    setSaving(true); setSaved(false)
    try {
      const res = await scoringService.submitVote(assignment.assignmentId, {
        vote, writtenReview: writtenReview || undefined,
        ...(isOpponent ? opp : {}),
      })
      if (res.success) setSaved(true)
    } finally { setSaving(false) }
  }

  const oppFields = [
    { key: 'necessityScore', name: 'Tính cấp thiết' },
    { key: 'contributionScore', name: 'Đóng góp' },
    { key: 'practicalScore', name: 'Tính thực tiễn' },
    { key: 'resultScore', name: 'Kết quả' },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-5">
      <h3 className="text-lg font-semibold text-gray-800">Phiếu nghiệm thu</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Kết luận</label>
        <div className="flex gap-3">
          {[{ v: VOTE_RESULT.Pass, l: 'Đạt' }, { v: VOTE_RESULT.Fail, l: 'Không đạt' }, { v: VOTE_RESULT.PassExcellent, l: 'Đạt xuất sắc' }].map((o) => (
            <button key={o.v} onClick={() => setVote(o.v)}
              className={`px-4 py-2 rounded-lg border font-medium ${vote === o.v ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
              {o.l}
            </button>
          ))}
        </div>
      </div>
      {isOpponent && (
        <div className="grid grid-cols-2 gap-4">
          {oppFields.map((f) => (
            <div key={f.key}>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">{f.name}</label>
                <span className="text-sm text-gray-500">{opp[f.key]} / 5</span>
              </div>
              <input type="range" min={1} max={5} value={opp[f.key]}
                onChange={(e) => setOpp({ ...opp, [f.key]: Number(e.target.value) })} className="w-full accent-blue-600" />
            </div>
          ))}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét phản biện</label>
        <textarea value={writtenReview} onChange={(e) => setWrittenReview(e.target.value)} rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="flex items-center gap-3">
        <button onClick={submit} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60">
          <Send className="w-4 h-4" /> {saving ? 'Đang lưu...' : 'Nộp phiếu'}
        </button>
        {saved && <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="w-4 h-4" /> Đã lưu</span>}
        <button onClick={onDone} className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Xong</button>
      </div>
    </div>
  )
}
