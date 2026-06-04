import { useState, useEffect, useRef } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { notificationService } from '../../services/notificationService'
import type { NotificationDto } from '../../types/notification'

export default function NotificationBell() {
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationDto[]>([])
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const refreshCount = () => {
    notificationService.getCount().then((res) => {
      if (res.success && res.data) setUnread(res.data.unread)
    }).catch(() => {})
  }

  useEffect(() => {
    refreshCount()
    const t = setInterval(refreshCount, 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) {
      setLoading(true)
      notificationService.getMine().then((res) => {
        if (res.success && res.data) setItems(res.data)
        setLoading(false)
      })
    }
  }

  const handleRead = async (n: NotificationDto) => {
    if (n.isRead) return
    await notificationService.markRead(n.id)
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)))
    setUnread((u) => Math.max(0, u - 1))
  }

  const handleReadAll = async () => {
    await notificationService.markAllRead()
    setItems((prev) => prev.map((x) => ({ ...x, isRead: true })))
    setUnread(0)
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle} className="relative p-2 hover:bg-gray-100 rounded-lg transition" title="Thông báo">
        <Bell className="w-6 h-6 text-gray-600" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[70vh] overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Thông báo</h3>
            <button onClick={handleReadAll} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
              <CheckCheck className="w-4 h-4" /> Đọc tất cả
            </button>
          </div>
          <div className="overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Đang tải...</div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Chưa có thông báo</div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleRead(n)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${n.isRead ? '' : 'bg-blue-50'}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead && <span className="mt-1.5 w-2 h-2 bg-blue-500 rounded-full shrink-0" />}
                    <div className={n.isRead ? 'pl-4' : ''}>
                      <p className="font-medium text-gray-800 text-sm">{n.title}</p>
                      <p className="text-sm text-gray-600">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
