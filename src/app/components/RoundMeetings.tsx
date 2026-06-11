import { useState, useEffect } from 'react'
import { Video, Plus, Calendar, ExternalLink } from 'lucide-react'
import { meetingService } from '../../services/meetingService'
import type { MeetingDto } from '../../types/meeting'

const PLATFORM_LABEL: Record<string, string> = {
  GOOGLE_MEET: 'Google Meet',
  TEAMS: 'Teams',
  IN_PERSON: 'Trực tiếp',
}

const toIso = (v: string) => (v ? `${v}:00Z` : '')

export default function RoundMeetings({ roundId, councilId }: { roundId: string; councilId?: string }) {
  const id = councilId ?? roundId
  const [meetings, setMeetings] = useState<MeetingDto[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [duration, setDuration] = useState(60)
  const [platform, setPlatform] = useState('GOOGLE_MEET')
  const [link, setLink] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    meetingService.getByRound(id).then((res) => {
      if (res.success && res.data) setMeetings(res.data)
    })
  }, [id])

  const create = async () => {
    if (!title.trim() || !scheduledAt) return
    setBusy(true)
    try {
      const res = await meetingService.create(id, {
        title, platform, scheduledAt: toIso(scheduledAt), durationMinutes: duration, meetingLink: link || undefined,
      })
      if (res.success && res.data) {
        setMeetings((prev) => [...prev, res.data!])
        setTitle(''); setScheduledAt(''); setLink(''); setShowForm(false)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-2 text-sm font-medium text-gray-600"><Video className="w-4 h-4" /> Lịch họp ({meetings.length})</span>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
          <Plus className="w-4 h-4" /> Đặt lịch
        </button>
      </div>

      {meetings.map((m) => (
        <div key={m.id} className="flex items-center justify-between bg-indigo-50 rounded-lg px-3 py-2 mb-1 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span className="text-gray-800 font-medium">{m.title || m.agenda || 'Họp hội đồng'}</span>
            <span className="text-gray-500">· {new Date(m.scheduledAt).toLocaleString('vi-VN')} · {PLATFORM_LABEL[m.platform] ?? m.platform}</span>
          </div>
          {m.meetingLink && (
            <a href={m.meetingLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 hover:underline">
              Link <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      ))}

      {showForm && (
        <div className="grid md:grid-cols-2 gap-2 mt-2 bg-gray-50 rounded-lg p-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề cuộc họp *"
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option value="GOOGLE_MEET">Google Meet</option>
            <option value="TEAMS">Teams</option>
            <option value="IN_PERSON">Trực tiếp</option>
          </select>
          <div className="flex gap-1">
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Dán link họp vào đây"
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            {platform === 'GOOGLE_MEET' && (
              <a href="https://meet.google.com/new" target="_blank" rel="noreferrer"
                title="Tạo Google Meet mới rồi sao chép link dán vào ô bên trái"
                className="px-2 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap flex items-center gap-1">
                <Video className="w-3 h-3" /> Tạo Meet
              </a>
            )}
          </div>
          {platform === 'GOOGLE_MEET' && !link && (
            <p className="md:col-span-2 text-xs text-gray-500">
              Bấm "Tạo Meet" → tab mới mở Google Meet → sao chép link → dán vào ô trên.
            </p>
          )}
          <div className="md:col-span-2 flex justify-end">
            <button onClick={create} disabled={busy}
              className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60">
              {busy ? 'Đang lưu...' : 'Lưu lịch họp'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
