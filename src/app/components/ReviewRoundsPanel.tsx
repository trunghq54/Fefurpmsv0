import { useState, useEffect } from 'react'
import { Plus, Trash2, UserCheck, AlertTriangle, Gavel, BarChart3 } from 'lucide-react'
import { roundService } from '../../services/roundService'
import { scoringService } from '../../services/scoringService'
import { userService } from '../../services/userService'
import RoundMeetings from './RoundMeetings'
import RoundResultsPanel from './RoundResultsPanel'
import type { ReviewRoundDto } from '../../types/review'
import { ROUND_TYPE_LABEL, ROUND_STATUS_LABEL, ASSIGNMENT_ROLE } from '../../types/review'
import type { UserDto } from '../../types/user'

const ROLE_LABEL: Record<string, string> = { Member: 'Thành viên', Chair: 'Chủ tịch', Opponent: 'Phản biện' }
const MEMBER_STATUS_COLOR: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Accepted: 'bg-green-100 text-green-800',
  Declined: 'bg-red-100 text-red-800',
}

export default function ReviewRoundsPanel({ proposalId }: { proposalId: string }) {
  const [rounds, setRounds] = useState<ReviewRoundDto[]>([])
  const [reviewers, setReviewers] = useState<UserDto[]>([])
  const [loading, setLoading] = useState(true)
  const [newRoundType, setNewRoundType] = useState('REVIEW')
  const [creating, setCreating] = useState(false)

  // per-round assign form state
  const [assignSel, setAssignSel] = useState<Record<string, { reviewerId: string; role: string }>>({})
  const [assignError, setAssignError] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [showResults, setShowResults] = useState<Record<string, boolean>>({})

  const loadRounds = () => {
    roundService.getRounds(proposalId).then((res) => {
      if (res.success && res.data) setRounds(res.data)
      setLoading(false)
    })
  }

  useEffect(() => {
    loadRounds()
    userService.getAll().then((res) => {
      if (res.success && res.data) {
        setReviewers(res.data.filter(
          (u) => u.roles?.includes('ReviewCommittee') || u.accountType === 'ReviewCommittee',
        ))
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalId])

  const handleCreateRound = async () => {
    setCreating(true)
    try {
      const res = await roundService.createRound(proposalId, { roundType: newRoundType })
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
      const res = await roundService.assign(roundId, {
        reviewerId: sel.reviewerId,
        role: sel.role || ASSIGNMENT_ROLE.Member,
      })
      if (res.success && res.data) {
        setRounds((prev) =>
          prev.map((r) => (r.id === roundId ? { ...r, assignments: [...r.assignments, res.data!] } : r)),
        )
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

  const handleRemove = async (roundId: string, memberId: string) => {
    await roundService.removeAssignment(roundId, memberId)
    setRounds((prev) =>
      prev.map((r) => (r.id === roundId ? { ...r, assignments: r.assignments.filter((a) => a.id !== memberId) } : r)),
    )
  }

  const handleFinalize = async (roundId: string, outcome: string) => {
    const label = outcome === 'Pass' ? 'Đạt (APPROVED)' : 'Không đạt (REJECTED)'
    if (!window.confirm(`Chốt kết quả vòng này là "${label}"?`)) return
    setBusy(true)
    try {
      const res = await scoringService.finalize(roundId, { outcome })
      if (res.success && res.data) {
        setRounds((prev) =>
          prev.map((r) =>
            r.id === roundId
              ? { ...r, status: (res.data as any).status ?? r.status, result: (res.data as any).outcome ?? outcome }
              : r,
          ),
        )
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Lỗi chốt kết quả')
    } finally {
      setBusy(false)
    }
  }

  const isCompleted = (r: ReviewRoundDto) => r.status === 'PASSED' || r.status === 'FAILED'

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h5 className="flex items-center gap-2 font-semibold text-gray-800">
          <Gavel className="w-4 h-4" /> Vòng phản biện ({rounds.length})
        </h5>
        <div className="flex items-center gap-2">
          <select
            value={newRoundType}
            onChange={(e) => setNewRoundType(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="SCREENING">Sàng lọc</option>
            <option value="REVIEW">Xét duyệt</option>
            <option value="ACCEPTANCE">Nghiệm thu</option>
          </select>
          <button
            onClick={handleCreateRound}
            disabled={creating}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
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
                  {ROUND_TYPE_LABEL[round.roundType] ?? round.roundType} · Vòng {round.roundNumber}
                  {round.dimension && (
                    <span className="ml-2 text-xs text-gray-500">({round.dimension})</span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowResults((s) => ({ ...s, [round.id]: !s[round.id] }))}
                    className="flex items-center gap-1 px-2 py-0.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <BarChart3 className="w-3.5 h-3.5" /> {showResults[round.id] ? 'Ẩn kết quả' : 'Xem kết quả'}
                  </button>
                  {isCompleted(round) && round.result && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        round.result === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {round.result === 'APPROVED' ? 'Đạt' : round.result === 'REJECTED' ? 'Từ chối' : 'Cần sửa'}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                    {ROUND_STATUS_LABEL[round.status] ?? round.status}
                  </span>
                </div>
              </div>

              {/* member list */}
              <div className="space-y-2 mb-3">
                {round.assignments.length === 0 && (
                  <p className="text-sm text-gray-400">Chưa phân công ai.</p>
                )}
                {round.assignments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 text-sm">
                      <UserCheck className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-800">{a.reviewerName}</span>
                      <span className="text-gray-400">· {ROLE_LABEL[a.role] ?? a.role}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${MEMBER_STATUS_COLOR[a.status] ?? 'bg-gray-100 text-gray-700'}`}>
                        {a.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemove(round.id, a.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Bỏ phân công"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* assign form */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={assignSel[round.id]?.reviewerId || ''}
                  onChange={(e) =>
                    setAssignSel({
                      ...assignSel,
                      [round.id]: { reviewerId: e.target.value, role: assignSel[round.id]?.role || ASSIGNMENT_ROLE.Member },
                    })
                  }
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">— Chọn người phản biện —</option>
                  {reviewers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fullName}
                    </option>
                  ))}
                </select>
                <select
                  value={assignSel[round.id]?.role || ASSIGNMENT_ROLE.Member}
                  onChange={(e) =>
                    setAssignSel({
                      ...assignSel,
                      [round.id]: { reviewerId: assignSel[round.id]?.reviewerId || '', role: e.target.value },
                    })
                  }
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Member">Thành viên</option>
                  <option value="Chair">Chủ tịch</option>
                  <option value="Opponent">Phản biện</option>
                </select>
                <button
                  onClick={() => handleAssign(round.id)}
                  disabled={busy}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60"
                >
                  <Plus className="w-4 h-4" /> Phân công
                </button>
              </div>
              {assignError[round.id] && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {assignError[round.id]}
                </div>
              )}

              {showResults[round.id] && <RoundResultsPanel roundId={round.id} councilId={round.councilId} />}

              {!isCompleted(round) ? (
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-500">Kết thúc vòng & công bố:</span>
                  <button
                    onClick={() => handleFinalize(round.id, 'Pass')}
                    disabled={busy}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
                  >
                    Đạt (APPROVED)
                  </button>
                  <button
                    onClick={() => handleFinalize(round.id, 'Fail')}
                    disabled={busy}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
                  >
                    Từ chối (REJECTED)
                  </button>
                  <span className="text-xs text-gray-400">— công bố ngay, cập nhật trạng thái đề tài.</span>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
                  Vòng đã kết thúc — kết quả:{' '}
                  <b className={round.result === 'APPROVED' ? 'text-green-700' : 'text-red-700'}>
                    {round.result === 'APPROVED' ? 'Đạt' : round.result === 'REJECTED' ? 'Từ chối' : round.result}
                  </b>
                  .
                </div>
              )}

              <RoundMeetings roundId={round.id} councilId={round.councilId} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
