import { useState, useEffect } from 'react'
import { Calendar, Clock, Video, ExternalLink, Info } from 'lucide-react'
import { meetingService } from '../../services/meetingService'
import type { MeetingDto } from '../../types/meeting'

const ROUND_LABEL: Record<string, string> = {
  SCREENING: 'Sàng lọc',
  REVIEW: 'Xét duyệt',
  ACCEPTANCE: 'Nghiệm thu',
  ProposalReview: 'Xét duyệt',
  ProgressCheck: 'Kiểm tra tiến độ',
  Acceptance: 'Nghiệm thu',
}

export default function MeetingsOverview() {
  const [meetings, setMeetings] = useState<MeetingDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    meetingService.getAll().then((res) => {
      if (res.success && res.data) setMeetings(res.data)
      setLoading(false)
    })
  }, [])

  const now = Date.now()
  const upcoming = meetings.filter((m) => new Date(m.scheduledAt).getTime() >= now).length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Lịch họp</h2>
        <p className="text-gray-500 mt-1">Toàn bộ cuộc họp hội đồng (dữ liệu thật)</p>
      </div>

      {/* Hint: meetings được tạo theo từng vòng phản biện */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-800">
          Để đặt lịch họp mới: vào <strong>Đề xuất &amp; Phân công</strong> → mở một đề xuất → mục{' '}
          <strong>Vòng phản biện</strong> → <strong>Đặt lịch</strong>. Cuộc họp gắn với từng vòng và sẽ hiện ở đây.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Tổng cuộc họp</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{meetings.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Sắp diễn ra</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{upcoming}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Đã qua</p>
          <p className="text-2xl font-bold text-gray-400 mt-1">{meetings.length - upcoming}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Đang tải dữ liệu...</div>
        ) : meetings.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Video className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            Chưa có cuộc họp nào. Tạo lịch họp ở "Đề xuất &amp; Phân công".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cuộc họp</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Đề tài</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vòng</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thời gian</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nền tảng</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {meetings.map((m) => {
                  const past = new Date(m.scheduledAt).getTime() < now
                  return (
                    <tr key={m.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-800">{m.title}</td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{m.proposalTitle || '—'}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {m.roundType ? `${ROUND_LABEL[m.roundType] || m.roundType} · Vòng ${m.roundNumber}` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className={past ? 'text-gray-400' : ''}>
                            {new Date(m.scheduledAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <Clock className="w-3 h-3" /> {m.durationMinutes} phút
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-sm">{m.platform}</span>
                      </td>
                      <td className="px-6 py-4">
                        {m.meetingLink ? (
                          <a
                            href={m.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline font-medium"
                          >
                            <Video className="w-4 h-4" /> Tham gia <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-gray-400">Chưa có link</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
