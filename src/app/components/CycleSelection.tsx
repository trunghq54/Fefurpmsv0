import { useState, useEffect } from 'react'
import { CalendarRange, ArrowRight, Loader2 } from 'lucide-react'
import { cycleService } from '../../services/cycleService'
import type { CycleDto } from '../../types/cycle'

const fmtVnd = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫'
const fmtDate = (s?: string) => (s ? new Date(s).toLocaleDateString('vi-VN') : '—')

// Màn "Chọn đợt nộp" — PI xem các đợt đang mở rồi chọn 1 để nộp đề tài vào đúng đợt đó.
export default function CycleSelection({ onSelect }: { onSelect: (cycle: CycleDto) => void }) {
  const [cycles, setCycles] = useState<CycleDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cycleService.getAll().then((res) => {
      if (res.success && res.data) setCycles(res.data.filter((c) => c.status === 'Open' || c.status === 'OPEN'))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-16 text-gray-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tải đợt nộp...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Chọn đợt nộp đề tài</h2>
        <p className="text-gray-500 mt-1">Chọn một đợt đang mở để bắt đầu soạn và nộp đề xuất nghiên cứu.</p>
      </div>

      {cycles.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          Hiện không có đợt nộp nào đang mở. Vui lòng quay lại khi Phòng QLKH mở đợt.
        </div>
      ) : (
        <div className="grid gap-4">
          {cycles.map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <CalendarRange className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{c.name} <span className="text-gray-400 font-normal">· Năm học {c.academicYear}</span></h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Cửa sổ nộp: <b>{fmtDate(c.submissionStartDate)}</b> – <b>{fmtDate(c.submissionEndDateApplied)}</b>
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Hạn mức: Ứng dụng {fmtVnd(c.fundingCapApplied)} · Cơ bản {fmtVnd(c.fundingCapBasic)}
                  </p>
                  {c.description && <p className="text-sm text-gray-400 mt-1">{c.description}</p>}
                </div>
              </div>
              <button onClick={() => onSelect(c)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap">
                Nộp vào đợt này <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
