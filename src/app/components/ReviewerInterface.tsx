import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  FileText,
  ThumbsUp,
  ThumbsDown,
  LogOut,
  ClipboardCheck,
  CheckCircle,
  ArrowLeft,
  Send,
  BookOpen,
  MessageSquare,
} from 'lucide-react'
import { reviewerFeedbackService } from '../../services/reviewerFeedbackService'
import { roundService } from '../../services/roundService'
import { scoringService } from '../../services/scoringService'
import type { SubmitScoreRequest, RubricTemplateDto } from '../../services/scoringService'
import { aiService } from '../../services/aiService'
import { proposalService } from '../../services/proposalService'
import RoleSwitcher from './RoleSwitcher'
import { Button, Textarea } from './ui-kit'
import type { MyAssignmentDto } from '../../types/review'
import { VOTE_RESULT, ROUND_TYPE_LABEL } from '../../types/review'
import ProposalDetailView from './ProposalDetailView'
import type { ProposalDto } from '../../types/proposal'

interface User {
  role: string
  name: string
}
interface ReviewerInterfaceProps {
  user: User
  onLogout: () => void
}

const ROLE_LABEL: Record<string, string> = { Member: 'Thành viên', Chair: 'Chủ tịch', Opponent: 'Phản biện' }
const STATUS_COLOR: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Accepted: 'bg-green-100 text-green-800',
  Declined: 'bg-red-100 text-red-800',
}

export default function ReviewerInterface({ user, onLogout }: ReviewerInterfaceProps) {
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
      setAssignments((prev) =>
        prev.map((x) => (x.assignmentId === a.assignmentId ? { ...x, status: accept ? 'Accepted' : 'Declined' } : x)),
      )
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/guide')}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <BookOpen className="w-4 h-4" /> Hướng dẫn
            </Button>
            <RoleSwitcher />
            <div className="border-l border-gray-300 pl-4">
              <p className="font-medium text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-500">Hội đồng phản biện</p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Đăng xuất?')) onLogout()
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {active ? (
          <ScoringPanel
            assignment={active}
            onBack={() => {
              setActive(null)
              load()
            }}
          />
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Phân công của tôi</h2>
              <p className="text-gray-500 mt-1">Chấp nhận phân công và chấm điểm đề xuất</p>
            </div>

            {loading ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                Đang tải...
              </div>
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
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                            {ROUND_TYPE_LABEL[a.roundType] ?? a.roundType}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 rounded">{ROLE_LABEL[a.role] ?? a.role}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLOR[a.status] ?? 'bg-gray-100 text-gray-700'}`}
                          >
                            {a.status}
                          </span>
                          <span className="text-gray-400">· Đề xuất: {a.proposalStatus}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {a.status === 'Pending' && (
                          <>
                            <Button variant="success" size="sm" onClick={() => respond(a, true)}>
                              <ThumbsUp className="w-4 h-4" /> Nhận
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => respond(a, false)}>
                              <ThumbsDown className="w-4 h-4" /> Từ chối
                            </Button>
                          </>
                        )}
                        {a.status === 'Accepted' && (
                          <Button size="sm" onClick={() => setActive(a)}>
                            <ClipboardCheck className="w-4 h-4" /> Chấm điểm
                          </Button>
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
  const isAcceptance = assignment.roundType === 'ACCEPTANCE'
  const [proposal, setProposal] = useState<ProposalDto | null>(null)
  const [proposalLoading, setProposalLoading] = useState(true)

  useEffect(() => {
    if (!assignment.proposalId) {
      setProposalLoading(false)
      return
    }
    proposalService.getById(assignment.proposalId).then((res) => {
      if (res.success && res.data) setProposal(res.data)
      setProposalLoading(false)
    })
  }, [assignment.proposalId])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{assignment.proposalTitleVI}</h2>
          <p className="text-gray-500 mt-1">
            {ROUND_TYPE_LABEL[assignment.roundType] ?? assignment.roundType} ·{' '}
            {ROLE_LABEL[assignment.role] ?? assignment.role}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-700 mb-4 border-b border-gray-100 pb-2">Thông tin đề xuất</h3>
        {proposalLoading ? (
          <p className="text-sm text-gray-400">Đang tải thông tin đề xuất...</p>
        ) : proposal ? (
          <ProposalDetailView proposal={proposal} assignmentId={assignment.assignmentId} />
        ) : (
          <p className="text-sm text-red-500">Không thể tải thông tin đề xuất.</p>
        )}
      </div>

      {isAcceptance ? (
        <VoteForm assignment={assignment} onDone={onBack} />
      ) : (
        <RubricForm assignment={assignment} onDone={onBack} />
      )}

      <FeedbackPanel councilId={assignment.councilId} />
    </div>
  )
}

function RubricForm({ assignment, onDone }: { assignment: MyAssignmentDto; onDone: () => void }) {
  const councilId = assignment.councilId
  const [template, setTemplate] = useState<RubricTemplateDto | null>(null)
  const [scores, setScores] = useState<Record<number, number>>({})
  const [comments, setComments] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [aiSug, setAiSug] = useState<Record<number, string>>({})
  const [aiBusy, setAiBusy] = useState<number | null>(null)

  const getAi = async (idx: number, criterionName: string, maxScore: number) => {
    setAiBusy(idx)
    try {
      const res = await aiService.aiFeedback(assignment.assignmentId, criterionName, maxScore)
      if (res.success && res.data) setAiSug((p) => ({ ...p, [idx]: res.data!.feedbackDraft }))
      else setAiSug((p) => ({ ...p, [idx]: res.message || 'Lỗi' }))
    } catch (e: any) {
      setAiSug((p) => ({ ...p, [idx]: e.response?.data?.message || 'Cần cấu hình Gemini API key.' }))
    } finally {
      setAiBusy(null)
    }
  }

  useEffect(() => {
    Promise.all([scoringService.getRubricTemplates(), scoringService.getRubric(councilId)]).then(
      ([tmplRes, scoreRes]) => {
        const tmpl = tmplRes.data?.[0] ?? null
        setTemplate(tmpl)
        if (tmpl) {
          const init: Record<number, number> = {}
          tmpl.criteria.forEach((c) => {
            init[c.id] = 0
          })
          if (scoreRes.data) {
            scoreRes.data.scoreDetails.forEach((d) => {
              init[d.criterionId] = d.givenScore
            })
            setComments(scoreRes.data.generalComments || '')
          }
          setScores(init)
        }
        setLoading(false)
      },
    )
  }, [councilId])

  const criteria = template?.criteria ?? []
  const total = criteria.reduce((s, c) => s + (scores[c.id] || 0), 0)
  const maxTotal = template?.maxTotalScore ?? 0

  const submit = async () => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      if (!template) throw new Error('No rubric template loaded')
      const body: SubmitScoreRequest = {
        templateId: template.id,
        generalComments: comments || undefined,
        scoreDetails: criteria.map((c) => ({ criterionId: c.id, givenScore: scores[c.id] || 0 })),
      }
      const res = await scoringService.submitRubric(councilId, body)
      if (res.success) setSaved(true)
      else setError(res.message || 'Lỗi')
    } catch (e: any) {
      setError(e.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-gray-400">
        Đang tải tiêu chí chấm...
      </div>
    )
  if (!template || criteria.length === 0)
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-gray-500">
        Chưa cấu hình tiêu chí chấm cho loại vòng này. Vui lòng nhờ Admin thêm ở mục "Tiêu chí chấm".
        <button onClick={onDone} className="ml-3 text-blue-600 hover:underline">
          Quay lại
        </button>
      </div>
    )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-5">
      <h3 className="text-lg font-semibold text-gray-800">Phiếu chấm điểm (tổng {maxTotal} điểm)</h3>
      {criteria.map((c, idx) => (
        <div key={c.id}>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-gray-700">
              {idx + 1}. {c.criterionName}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => getAi(idx, c.criterionName, c.maxScore)}
                disabled={aiBusy === idx}
                title="AI gợi ý nhận xét cho tiêu chí này"
                className="flex items-center gap-1 px-2 py-0.5 text-xs border border-purple-200 text-purple-700 rounded hover:bg-purple-50 disabled:opacity-60"
              >
                ✨ {aiBusy === idx ? '...' : 'AI gợi ý'}
              </button>
              <span className="text-sm font-semibold text-gray-700 w-16 text-right">
                {scores[c.id] || 0} / {c.maxScore}
              </span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={c.maxScore}
            value={scores[c.id] || 0}
            onChange={(e) => setScores({ ...scores, [c.id]: Number(e.target.value) })}
            className="w-full accent-blue-600"
          />
          {aiSug[idx] && (
            <div className="mt-1 text-xs bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 text-gray-700">
              {aiSug[idx]}
              <button
                type="button"
                onClick={() => setComments((prev) => (prev ? prev + '\n' : '') + aiSug[idx])}
                className="ml-2 text-purple-600 hover:underline"
              >
                Áp dụng
              </button>
            </div>
          )}
        </div>
      ))}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <span className="font-medium text-gray-700">Tổng điểm</span>
        <span className="text-2xl font-bold text-blue-600">
          {total} / {maxTotal}
        </span>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét chung</label>
        <Textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={4} className="px-4 resize-y" />
        <p className="mt-1 text-xs text-gray-400">Dùng nút "✨ AI gợi ý" ở từng tiêu chí để nhận gợi ý nhận xét.</p>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}
      <div className="flex items-center gap-3">
        <Button size="lg" onClick={submit} disabled={saving}>
          <Send className="w-4 h-4" /> {saving ? 'Đang lưu...' : 'Nộp điểm'}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" /> Đã lưu
          </span>
        )}
        <Button variant="outline" size="lg" onClick={onDone}>
          Xong
        </Button>
      </div>
    </div>
  )
}

function VoteForm({ assignment, onDone }: { assignment: MyAssignmentDto; onDone: () => void }) {
  const councilId = assignment.councilId
  const [vote, setVote] = useState<number>(VOTE_RESULT.Pass)
  const [writtenReview, setWrittenReview] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [template, setTemplate] = useState<RubricTemplateDto | null>(null)

  useEffect(() => {
    Promise.all([scoringService.getRubricTemplates(), scoringService.getVote(councilId)]).then(([tmplRes, voteRes]) => {
      setTemplate(tmplRes.data?.[0] ?? null)
      if (voteRes.data) {
        setWrittenReview(voteRes.data.otherRecommendations || voteRes.data.generalComments || '')
      }
    })
  }, [councilId])

  const submit = async () => {
    setSaving(true)
    setSaved(false)
    try {
      if (!template) return
      const voteLabel = vote === VOTE_RESULT.Pass ? 'Đạt' : vote === VOTE_RESULT.Fail ? 'Không đạt' : 'Đạt xuất sắc'
      const body: SubmitScoreRequest = {
        templateId: template.id,
        generalComments: `Kết luận: ${voteLabel}`,
        otherRecommendations: writtenReview || undefined,
        scoreDetails: [],
      }
      const res = await scoringService.submitVote(councilId, body)
      if (res.success) setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-5">
      <h3 className="text-lg font-semibold text-gray-800">Phiếu nghiệm thu</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Kết luận</label>
        <div className="flex gap-3">
          {[
            { v: VOTE_RESULT.Pass, l: 'Đạt' },
            { v: VOTE_RESULT.Fail, l: 'Không đạt' },
            { v: VOTE_RESULT.PassExcellent, l: 'Đạt xuất sắc' },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => setVote(o.v)}
              className={`px-4 py-2 rounded-lg border font-medium ${
                vote === o.v
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nhận xét phản biện</label>
        <Textarea
          value={writtenReview}
          onChange={(e) => setWrittenReview(e.target.value)}
          rows={4}
          className="px-4 resize-y"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button size="lg" onClick={submit} disabled={saving || !template}>
          <Send className="w-4 h-4" /> {saving ? 'Đang lưu...' : 'Nộp phiếu'}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" /> Đã lưu
          </span>
        )}
        <Button variant="outline" size="lg" onClick={onDone}>
          Xong
        </Button>
      </div>
    </div>
  )
}

function FeedbackPanel({ councilId }: { councilId: string }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    urgencyScore: 3,
    scientificContributionScore: 3,
    practicalSignificanceScore: 3,
    actualVsExpectedScore: 3,
    otherComments: '',
    overallAssessment: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await reviewerFeedbackService.submit(councilId, form)
      if (res.success) {
        setSaved(true)
        setOpen(false)
      } else setError(res.message || 'Lỗi')
    } catch (e: any) {
      setError(e.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  if (saved)
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        <CheckCircle className="w-4 h-4" /> Đã gửi phản hồi về đề xuất.
      </div>
    )

  const ScoreSlider = ({ label, field }: { label: string; field: keyof typeof form }) => (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="font-semibold text-blue-600">{form[field] as number}/5</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        value={form[field] as number}
        onChange={(e) => setForm({ ...form, [field]: Number(e.target.value) })}
        className="w-full accent-blue-600"
      />
    </div>
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50"
      >
        <span className="flex items-center gap-2 font-semibold text-gray-700">
          <MessageSquare className="w-5 h-5 text-indigo-500" /> Phản hồi về đề xuất (tùy chọn)
        </span>
        <span className="text-gray-400 text-sm">{open ? '▲ Thu gọn' : '▼ Mở rộng'}</span>
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-4 border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-500">Đánh giá định tính về đề xuất (thang điểm 1–5). Không bắt buộc.</p>
          <ScoreSlider label="Tính cấp bách / nhu cầu thực tiễn" field="urgencyScore" />
          <ScoreSlider label="Đóng góp khoa học" field="scientificContributionScore" />
          <ScoreSlider label="Ý nghĩa thực tiễn" field="practicalSignificanceScore" />
          <ScoreSlider label="Kết quả thực tế so với kỳ vọng" field="actualVsExpectedScore" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhận xét khác</label>
            <Textarea
              rows={2}
              value={form.otherComments}
              onChange={(e) => setForm({ ...form, otherComments: e.target.value })}
              className="resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kết luận tổng thể</label>
            <Textarea
              rows={2}
              value={form.overallAssessment}
              onChange={(e) => setForm({ ...form, overallAssessment: e.target.value })}
              className="resize-none"
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}
          <Button onClick={submit} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700">
            <Send className="w-4 h-4" /> {saving ? 'Đang gửi...' : 'Gửi phản hồi'}
          </Button>
        </div>
      )}
    </div>
  )
}
