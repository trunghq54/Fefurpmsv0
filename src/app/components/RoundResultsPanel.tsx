import { useState, useEffect } from 'react'
import { BarChart3, UserCheck } from 'lucide-react'
import { scoringService } from '../../services/scoringService'
import { RUBRIC_CRITERIA } from '../../types/review'
import type { RoundResultsDto } from '../../types/review'

const ROLE_LABEL: Record<string, string> = { Member: 'Thành viên', Chair: 'Chủ tịch', Opponent: 'Phản biện' }
const VOTE_LABEL: Record<string, string> = { Pass: 'Đạt', Fail: 'Không đạt', PassExcellent: 'Đạt xuất sắc' }
const VOTE_COLOR: Record<string, string> = {
  Pass: 'bg-green-100 text-green-800', PassExcellent: 'bg-emerald-100 text-emerald-800', Fail: 'bg-red-100 text-red-800',
}

export default function RoundResultsPanel({ roundId }: { roundId: string }) {
  const [data, setData] = useState<RoundResultsDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    scoringService.getResults(roundId).then((res) => {
      if (res.success && res.data) setData(res.data)
      setLoading(false)
    })
  }, [roundId])

  if (loading) return <p className="text-sm text-gray-400 mt-2">Đang tải kết quả...</p>
  if (!data) return <p className="text-sm text-gray-400 mt-2">Chưa có kết quả.</p>

  const scored = data.rows.filter((r) => r.rubric || r.vote)

  return (
    <div className="mt-3 bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <BarChart3 className="w-4 h-4" /> Kết quả chấm ({scored.length}/{data.rows.length} đã chấm)
        </span>
        {data.averageTotal != null && (
          <span className="text-sm text-gray-600">TB tổng điểm: <b className="text-gray-900">{data.averageTotal}/100</b></span>
        )}
      </div>

      {data.rows.length === 0 ? (
        <p className="text-sm text-gray-400">Vòng này chưa phân công ai.</p>
      ) : (
        <div className="space-y-3">
          {data.rows.map((r) => (
            <div key={r.assignmentId} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  <UserCheck className="w-4 h-4 text-gray-400" /> {r.reviewerName}
                  <span className="text-gray-400 font-normal">· {ROLE_LABEL[r.role] || r.role}</span>
                </span>
                {r.rubric ? (
                  <span className="text-sm font-semibold text-blue-700">{r.rubric.totalScore}/100</span>
                ) : r.vote ? (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${VOTE_COLOR[r.vote.vote] || 'bg-gray-100 text-gray-700'}`}>
                    {VOTE_LABEL[r.vote.vote] || r.vote.vote}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 italic">chưa chấm</span>
                )}
              </div>

              {/* Rubric breakdown */}
              {r.rubric && (
                <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2">
                  {RUBRIC_CRITERIA.map((c) => (
                    <div key={c.key} className="text-center bg-gray-50 rounded px-2 py-1">
                      <p className="text-[11px] text-gray-500 truncate" title={c.name}>{c.name}</p>
                      <p className="text-sm font-semibold text-gray-800">
                        {(r.rubric as any)[c.key]}<span className="text-gray-400 text-xs">/{c.max}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Opponent scores (acceptance) */}
              {r.vote && (r.vote.necessityScore != null || r.vote.resultScore != null) && (
                <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-gray-50 rounded px-2 py-1"><p className="text-gray-500">Cấp thiết</p><p className="font-semibold">{r.vote.necessityScore ?? '—'}/5</p></div>
                  <div className="bg-gray-50 rounded px-2 py-1"><p className="text-gray-500">Đóng góp</p><p className="font-semibold">{r.vote.contributionScore ?? '—'}/5</p></div>
                  <div className="bg-gray-50 rounded px-2 py-1"><p className="text-gray-500">Thực tiễn</p><p className="font-semibold">{r.vote.practicalScore ?? '—'}/5</p></div>
                  <div className="bg-gray-50 rounded px-2 py-1"><p className="text-gray-500">Kết quả</p><p className="font-semibold">{r.vote.resultScore ?? '—'}/5</p></div>
                </div>
              )}

              {/* Comments / written review */}
              {(r.rubric?.comments || r.vote?.writtenReview) && (
                <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap border-t border-gray-100 pt-2">
                  {r.rubric?.comments || r.vote?.writtenReview}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
