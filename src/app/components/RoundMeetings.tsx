import { useState, useEffect } from 'react'
import { Video, Plus, Calendar, ExternalLink } from 'lucide-react'
import { meetingService } from '../../services/meetingService'
import type { MeetingDto } from '../../types/meeting'
import { MEETING_PLATFORM } from '../../types/meeting'

const toIso = (v: string) => (v ? `${v}:00Z` : '')

export default function RoundMeetings({ roundId }: { roundId: string }) {
  const [meetings, setMeetings] = useState<MeetingDto[]>([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [duration, setDuration] = useState(60)
  const [platform, setPlatform] = useState<number>(MEETING_PLATFORM.GoogleMeet)
  const [link, setLink] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    meetingService.getByRound(roundId).then((res) => {
      if (res.success && res.data) setMeetings(res.data)
    })
  }, [roundId])

  const create = async () => {
    if (!title.trim() || !scheduledAt) return
    setBusy(true)
    try {
      const res = await meetingService.create(roundId, {
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
            <span className="text-gray-800">{m.title}</span>
            <span className="text-gray-500">· {new Date(m.scheduledAt).toLocaleString('vi-VN')} · {m.platform}</span>
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
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề cuộc họp"
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          <select value={platform} onChange={(e) => setPlatform(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option value={MEETING_PLATFORM.GoogleMeet}>Google Meet</option>
            <option value={MEETING_PLATFORM.Teams}>Teams</option>
          </select>
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link cuộc họp (dán thủ công)"
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
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
