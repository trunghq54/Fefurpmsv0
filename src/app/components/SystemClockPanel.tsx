import { useState, useEffect } from 'react'
import { Clock, FastForward, RotateCcw, BellRing, CheckCircle } from 'lucide-react'
import { systemClockService } from '../../services/systemClockService'
import type { SystemClockDto } from '../../services/systemClockService'
import { Button, Input } from './ui-kit'

// Bảng "mô phỏng thời gian" cho Admin — tua nhanh đồng hồ hệ thống để test các mốc hạn
// dài ngày (nhắc hạn sản phẩm, quá hạn hợp đồng...) mà không phải chờ thật.
export default function SystemClockPanel() {
  const [clock, setClock] = useState<SystemClockDto | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [custom, setCustom] = useState('')

  const load = () => {
    systemClockService.get().then((res) => {
      if (res.success && res.data) setClock(res.data)
    })
  }

  useEffect(() => {
    load()
  }, [])

  const apply = async (offsetDays: number) => {
    setBusy(true)
    setMsg('')
    try {
      const res = await systemClockService.set(offsetDays)
      if (res.success && res.data) {
        setClock(res.data)
        setMsg(offsetDays === 0 ? 'Đã đặt lại về thời gian thật.' : `Đã tua tới +${offsetDays} ngày.`)
      } else setMsg(res.message || 'Lỗi')
    } catch (e: any) {
      setMsg(e.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setBusy(false)
    }
  }

  const runScan = async () => {
    setBusy(true)
    setMsg('')
    try {
      const res = await systemClockService.runDeadlineScan()
      setMsg(res.success ? 'Đã chạy quét nhắc hạn — kiểm tra email/thông báo của PI.' : res.message || 'Lỗi')
    } catch (e: any) {
      setMsg(e.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setBusy(false)
    }
  }

  const fmt = (s?: string) => (s ? new Date(s).toLocaleString('vi-VN') : '—')

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-5 h-5 text-purple-600" />
        <h3 className="text-base font-semibold text-gray-800">Mô phỏng thời gian (chế độ test)</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Tua nhanh đồng hồ hệ thống để kiểm thử các mốc hạn dài ngày (nhắc hạn sản phẩm, quá hạn hợp đồng…) mà không cần
        chờ. Chỉ ảnh hưởng môi trường test.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500">Thời gian thật</p>
          <p className="font-medium text-gray-800">{fmt(clock?.realNow)}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <p className="text-purple-600">Thời gian hệ thống (đã tua)</p>
          <p className="font-semibold text-purple-800">{fmt(clock?.effectiveNow)}</p>
          <p className="text-xs text-purple-500 mt-0.5">offset hiện tại: +{clock?.offsetDays ?? 0} ngày</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[7, 14, 30, 90, 180].map((d) => (
          <Button
            key={d}
            variant="outline"
            size="sm"
            onClick={() => apply((clock?.offsetDays ?? 0) + d)}
            disabled={busy}
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <FastForward className="w-3.5 h-3.5" /> +{d} ngày
          </Button>
        ))}
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={0}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="offset"
            className="w-24 px-2 py-1.5 focus:ring-purple-500"
          />
          <Button
            size="sm"
            onClick={() => apply(Math.max(0, Number(custom) || 0))}
            disabled={busy || custom === ''}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Đặt
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={() => apply(0)} disabled={busy}>
          <RotateCcw className="w-3.5 h-3.5" /> Đặt lại
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={runScan}
          disabled={busy}
          className="border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          <BellRing className="w-3.5 h-3.5" /> Chạy quét nhắc hạn
        </Button>
      </div>

      {msg && (
        <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <CheckCircle className="w-4 h-4 shrink-0" /> {msg}
        </div>
      )}
    </div>
  )
}
