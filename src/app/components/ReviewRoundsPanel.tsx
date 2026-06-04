import { useState, useEffect } from 'react'
import { Plus, Trash2, UserCheck, AlertTriangle, Gavel } from 'lucide-react'
import { roundService } from '../../services/roundService'
import { scoringService } from '../../services/scoringService'
import { userService } from '../../services/userService'
import RoundMeetings from './RoundMeetings'
import type { ReviewRoundDto } from '../../types/review'
import { ROUND_TYPE, ASSIGNMENT_ROLE } from '../../types/review'
import type { UserDto } from '../../types/user'

const ROUND_LABEL: Record<string, string> = {
  ProposalReview: 'Xét duyệt', ProgressCheck: 'Kiểm tra tiến độ', Acceptance: 'Nghiệm thu',
}
const ROLE_LABEL: Record<string, string> = { Member: 'Thành viên', Chair: 'Chủ tịch', Opponent: 'Phản biện' }
const STATUS_COLOR: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800', Accepted: 'bg-green-100 text-green-800', Declined: 'bg-red-100 text-red-800',
}

export default function ReviewRoundsPanel({ proposalId }: { proposalId: string }) {
  const [rounds, setRounds] = useState<ReviewRoundDto[]>([])
  const [reviewers, setReviewers] = useState<UserDto[]>([])
  const [loading, setLoading] = useState(true)
  const [newRoundType, setNewRoundType] = useState<number>(ROUND_TYPE.ProposalReview)
  const [creating, setCreating] = useState(false)

  // per-round assign form state
  const [assignSel, setAssignSel] = useState<Record<string, { reviewerId: string; role: number }>>({})
  const [assignError, setAssignError] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  const loadRounds = () => {
    roundService.getRounds(proposalId).then((res) => {
      if (res.success && res.data) setRounds(res.data)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadRounds()
    userService.getAll().then((res) => {
      if (res.success && res.data) setReviewers(res.data.filter((u) => u.accountType === 'ReviewCommittee'))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalId])

  const handleCreateRound = async () => {
    setCreating(true)
    try {
      const nextNum = rounds.filter((r) => r.roundType === Object.keys(ROUND_TYPE).find((k) => (ROUND_TYPE as any)[k] === newRoundType)).length + 1
      const res = await roundService.createRound(proposalId, { roundType: newRoundType, roundNumber: nextNum })
      if (res.success && res.data) setRounds((prev) => [...prev, res.data!])
    } finally {
      setCreating(false)
    }
  }

  const handleAssign = async (roundId: string) => {
    const sel = assignSel[roundId]
    if (!sel?.reviewerId) {
      setAssignError({ ...assignError, [roundId]: 'Chọn người phản biện' })
      return
    }
    setBusy(true)
    setAssignError({ ...assignError, [roundId]: '' })
    try {
      const res = await roundService.assign(roundId, { reviewerId: sel.reviewerId, role: sel.role || ASSIGNMENT_ROLE.Member })
      if (res.success && res.data) {
        setRounds((prev) => prev.map((r) => (r.id === roundId ? { ...r, assignments: [...r.assignments, res.data!] } : r)))
        setAssignSel({ ...assignSel, [roundId]: { reviewerId: '', role: ASSIGNMENT_ROLE.Member } })
      } else {
        setAssignError({ ...assignError, [roundId]: res.message || 'Lỗi phân công' })
      }
    } catch (e: any) {
      setAssignError({ ...assignError, [roundId]: e.response?.data?.message || 'Lỗi phân công' })
    } finally {
      setBusy(false)
    }
  }

  const handleRemove = async (roundId: string, assignmentId: string) => {
    await roundService.removeAssignment(roundId, assignmentId)
    setRounds((prev) => prev.map((r) => (r.id === roundId ? { ...r, assignments: r.assignments.filter((a) => a.id !== assignmentId) } : r)))
  }

  const handleFinalize = async (roundId: string, outcome: string) => {
    if (!window.confirm(`Chốt kết quả vòng này là "${outcome}"?`)) return
    setBusy(true)
    try {
      const res = await scoringService.finalize(roundId, { outcome })
      if (res.success && res.data) {
        setRounds((prev) => prev.map((r) => (r.id === roundId ? { ...r, status: res.data!.status, outcome: res.data!.outcome } : r)))
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h5 className="flex items-center gap-2 font-semibold text-gray-800"><Gavel className="w-4 h-4" /> Vòng phản biện ({rounds.length})</h5>
        <div className="flex items-center gap-2">
          <select value={newRoundType} onChange={(e) => setNewRoundType(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option value={ROUND_TYPE.ProposalReview}>Xét duyệt</option>
            <option value={ROUND_TYPE.ProgressCheck}>Kiểm tra tiến độ</option>
            <option value={ROUND_TYPE.Acceptance}>Nghiệm thu</option>
          </select>
          <button onClick={handleCreateRound} disabled={creating}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
            <Plus className="w-4 h-4" /> Tạo vòng
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Đang tải...</p>
      ) : rounds.length === 0 ? (
        <p className="text-sm text-gray-400">Chưa có vòng phản biện nào.</p>
      ) : (
        <div className="space-y-4">
          {rounds.map((round) => (
            <div key={round.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-800">
                  {ROUND_LABEL[round.roundType]} · Vòng {round.roundNumber}
                </span>
                <div className="flex items-center gap-2">
                  {round.status === 'Completed' && round.outcome && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${round.outcome === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {round.outcome}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">{round.status}</span>
                </div>
              </div>

              {/* assignments */}
              <div className="space-y-2 mb-3">
                {round.assignments.length === 0 && <p className="text-sm text-gray-400">Chưa phân công ai.</p>}
                {round.assignments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 text-sm">
                      <UserCheck className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-800">{a.reviewerName}</span>
                      <span className="text-gray-400">· {ROLE_LABEL[a.role]}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLOR[a.status]}`}>{a.status}</span>
                    </div>
                    <button onClick={() => handleRemove(round.id, a.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Bỏ phân công">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* assign form */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={assignSel[round.id]?.reviewerId || ''}
                  onChange={(e) => setAssignSel({ ...assignSel, [round.id]: { reviewerId: e.target.value, role: assignSel[round.id]?.role || ASSIGNMENT_ROLE.Member } })}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">— Chọn người phản biện —</option>
                  {reviewers.map((r) => <option key={r.id} value={r.id}>{r.fullName}</option>)}
                </select>
                <select
                  value={assignSel[round.id]?.role || ASSIGNMENT_ROLE.Member}
                  onChange={(e) => setAssignSel({ ...assignSel, [round.id]: { reviewerId: assignSel[round.id]?.reviewerId || '', role: Number(e.target.value) } })}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  <option value={ASSIGNMENT_ROLE.Member}>Thành viên</option>
                  <option value={ASSIGNMENT_ROLE.Chair}>Chủ tịch</option>
                  <option value={ASSIGNMENT_ROLE.Opponent}>Phản biện</option>
                </select>
                <button onClick={() => handleAssign(round.id)} disabled={busy}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60">
                  <Plus className="w-4 h-4" /> Phân công
                </button>
              </div>
              {assignError[round.id] && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {assignError[round.id]}
                </div>
              )}

              {round.status !== 'Completed' && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <span className="text-sm text-gray-500">Chốt kết quả:</span>
                  <button onClick={() => handleFinalize(round.id, 'Pass')} disabled={busy}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60">Pass</button>
                  <button onClick={() => handleFinalize(round.id, 'Fail')} disabled={busy}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60">Fail</button>
                </div>
              )}

              <RoundMeetings roundId={round.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
