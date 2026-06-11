import { useState, useEffect } from 'react'
import { BarChart3, UserCheck, MessageSquare } from 'lucide-react'
import { scoringService } from '../../services/scoringService'
import type { ReviewScoreDto } from '../../services/scoringService'
import { reviewerFeedbackService } from '../../services/reviewerFeedbackService'
import type { ReviewerFeedbackDto } from '../../services/reviewerFeedbackService'

export default function RoundResultsPanel({
  roundId, councilId, showFeedback = false,
}: { roundId: string; councilId?: string; showFeedback?: boolean }) {
  const [scores, setScores] = useState<ReviewScoreDto[]>([])
  const [loading, setLoading] = useState(true)
  const [feedbacks, setFeedbacks] = useState<ReviewerFeedbackDto[]>([])

  useEffect(() => {
    if (!councilId) { setLoading(false); return }
    setLoading(true)
    scoringService.getCouncilScores(councilId).then((res) => {
      if (res.success && res.data) setScores(res.data)
      setLoading(false)
    })
    if (showFeedback) {
      reviewerFeedbackService.getByCouncil(councilId).then((res) => {
        if (res.success && res.data) setFeedbacks(res.data)
      }).catch(() => {})
    }
  }, [councilId, roundId, showFeedback])

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

      {showFeedback && feedbacks.length > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <MessageSquare className="w-4 h-4" /> Phản hồi của phản biện ({feedbacks.length})
          </p>
          <div className="space-y-3">
            {feedbacks.map((f) => (
              <div key={f.id} className="bg-white border border-gray-200 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-800 mb-2">{f.reviewerName ?? 'Phản biện'}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                  {f.urgencyScore != null && (
                    <ScoreBadge label="Tính cấp thiết" score={f.urgencyScore} />
                  )}
                  {f.scientificContributionScore != null && (
                    <ScoreBadge label="Đóng góp KH" score={f.scientificContributionScore} />
                  )}
                  {f.practicalSignificanceScore != null && (
                    <ScoreBadge label="Ý nghĩa TT" score={f.practicalSignificanceScore} />
                  )}
                  {f.actualVsExpectedScore != null && (
                    <ScoreBadge label="Thực tế vs KV" score={f.actualVsExpectedScore} />
                  )}
                </div>
                {f.overallAssessment && (
                  <p className="text-gray-700 whitespace-pre-wrap border-t border-gray-100 pt-2">{f.overallAssessment}</p>
                )}
                {f.otherComments && (
                  <p className="text-gray-500 text-xs mt-1">{f.otherComments}</p>
                )}
                {f.submittedAt && (
                  <p className="text-gray-400 text-xs mt-1">{new Date(f.submittedAt).toLocaleString('vi-VN')}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ScoreBadge({ label, score }: { label: string; score: number }) {
  const color = score >= 4 ? 'bg-green-50 text-green-700' : score >= 3 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
  return (
    <div className={`text-center rounded px-2 py-1 ${color}`}>
      <p className="text-[10px] truncate">{label}</p>
      <p className="font-semibold">{score}/5</p>
    </div>
  )
}
