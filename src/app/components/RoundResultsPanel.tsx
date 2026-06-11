import { useState, useEffect } from 'react'
import { BarChart3, UserCheck } from 'lucide-react'
import { scoringService } from '../../services/scoringService'
import type { ReviewScoreDto } from '../../services/scoringService'

const ROLE_LABEL: Record<string, string> = { Member: 'Thành viên', Chair: 'Chủ tịch', Opponent: 'Phản biện' }

export default function RoundResultsPanel({ roundId, councilId }: { roundId: string; councilId?: string }) {
  const [scores, setScores] = useState<ReviewScoreDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!councilId) { setLoading(false); return }
    setLoading(true)
    scoringService.getCouncilScores(councilId).then((res) => {
      if (res.success && res.data) setScores(res.data)
      setLoading(false)
    })
  }, [councilId, roundId])

  if (loading) return <p className="text-sm text-gray-400 mt-2">Đang tải kết quả...</p>
  if (!councilId) return <p className="text-sm text-gray-400 mt-2">Chưa có hội đồng cho vòng này.</p>
  if (scores.length === 0) return <p className="text-sm text-gray-400 mt-2">Chưa có điểm chấm.</p>

  const avgScore = scores.length > 0
    ? (scores.reduce((s, r) => s + r.totalScore, 0) / scores.length).toFixed(1)
    : null

  return (
    <div className="mt-3 bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <BarChart3 className="w-4 h-4" /> Kết quả chấm ({scores.length} phiếu)
        </span>
        {avgScore && (
          <span className="text-sm text-gray-600">
            TB: <b className="text-gray-900">{avgScore}/{scores[0]?.maxPossibleScore ?? '?'}</b>
          </span>
        )}
      </div>

      <div className="space-y-3">
        {scores.map((s) => (
          <div key={s.id} className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <UserCheck className="w-4 h-4 text-gray-400" /> {s.evaluatorName}
              </span>
              <span className="text-sm font-semibold text-blue-700">
                {s.totalScore}/{s.maxPossibleScore}
                {!s.isValidBallot && <span className="ml-1 text-xs text-red-500">(không hợp lệ)</span>}
              </span>
            </div>

            {s.scoreDetails.length > 0 && (
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                {s.scoreDetails.map((d) => (
                  <div key={d.id} className="text-center bg-gray-50 rounded px-2 py-1">
                    <p className="text-[11px] text-gray-500 truncate" title={d.criterionName}>{d.criterionName}</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {d.givenScore}<span className="text-gray-400 text-xs">/{d.maxScore}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}

            {s.generalComments && (
              <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap border-t border-gray-100 pt-2">
                {s.generalComments}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
