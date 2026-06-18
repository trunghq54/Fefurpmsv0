import { useState } from 'react'
import { Search, FileText } from 'lucide-react'
import { aiService } from '../../services/aiService'
import type { ProposalSummaryDto } from '../../types/proposal'
import { Button, Input } from './ui-kit'

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800', Submitted: 'bg-yellow-100 text-yellow-800',
    UnderReview: 'bg-blue-100 text-blue-800', Approved: 'bg-green-100 text-green-800',
    Accepted: 'bg-green-100 text-green-800', RejectedAtReview: 'bg-red-100 text-red-800',
    RejectedAtAcceptance: 'bg-red-100 text-red-800',
  }
  return map[s] || 'bg-gray-100 text-gray-800'
}
const formatVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫'

export default function AdvancedSearch() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<ProposalSummaryDto[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const runSearch = async () => {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await aiService.search(q.trim())
      setResults(res.success && res.data ? res.data : [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Tìm kiếm đề xuất</h2>
        <p className="text-gray-500 mt-1">Tìm theo tên đề tài, mục tiêu, phương pháp... (dữ liệu thật)</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            placeholder="Nhập từ khoá rồi nhấn Enter..." className="pl-10 pr-28 py-3" />
          <Button onClick={runSearch} disabled={loading || !q.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 py-1.5">
            {loading ? 'Đang tìm...' : 'Tìm'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {!searched ? (
          <div className="p-12 text-center text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            Nhập từ khoá để tìm đề xuất.
          </div>
        ) : loading ? (
          <div className="p-12 text-center text-gray-400">Đang tìm...</div>
        ) : results.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            Không tìm thấy đề xuất nào khớp "{q}".
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            <div className="px-6 py-3 text-sm text-gray-500 bg-gray-50">{results.length} kết quả</div>
            {results.map((p) => (
              <div key={p.id} className="px-6 py-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800">{p.titleVI}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {p.principalInvestigatorName} · {p.trackName || '—'} · {p.researchType}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(p.status)}`}>{p.status}</span>
                    <p className="text-sm text-gray-500 mt-1">{formatVnd(p.totalBudget)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
