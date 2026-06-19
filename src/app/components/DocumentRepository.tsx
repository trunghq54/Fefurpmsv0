import { useState, useEffect } from 'react'
import { FileText, Download, Search } from 'lucide-react'
import { proposalService } from '../../services/proposalService'
import type { ProposalDocumentDto } from '../../types/proposal'
import { Input, Select } from './ui-kit'

const fmtSize = (b: number) =>
  b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`

const TYPE_LABEL: Record<string, string> = { Proposal: 'Thuyết minh', CV: 'Lý lịch KH', Other: 'Khác' }

export default function DocumentRepository() {
  const [docs, setDocs] = useState<ProposalDocumentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    proposalService.getAllDocuments().then((res) => {
      if (res.success && res.data) setDocs(res.data)
      setLoading(false)
    })
  }, [])

  const filtered = docs.filter((d) => {
    const q = search.toLowerCase()
    const matchSearch = d.fileName.toLowerCase().includes(q) || (d.proposalTitle || '').toLowerCase().includes(q)
    const matchType = filterType === 'all' || d.documentType === filterType
    return matchSearch && matchType
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Kho tài liệu</h2>
        <p className="text-gray-500 mt-1">Toàn bộ tài liệu đính kèm các đề xuất (dữ liệu thật)</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[280px] relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên file / tên đề tài..."
              className="pl-10"
            />
          </div>
          <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-auto">
            <option value="all">Tất cả loại</option>
            <option value="Proposal">Thuyết minh</option>
            <option value="CV">Lý lịch KH</option>
            <option value="Other">Khác</option>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Đang tải dữ liệu...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            {docs.length === 0 ? 'Chưa có tài liệu nào được tải lên.' : 'Không có tài liệu khớp bộ lọc.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tài liệu</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Đề tài</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Loại</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kích thước</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ngày tải</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tải</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="font-medium text-gray-800">{d.fileName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs">
                      <p className="truncate">{d.proposalTitle || '—'}</p>
                      {d.principalInvestigatorName && (
                        <p className="text-xs text-gray-400">{d.principalInvestigatorName}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-sm">
                        {TYPE_LABEL[d.documentType] || d.documentType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{fmtSize(d.fileSizeBytes)}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(d.uploadedAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-4">
                      {d.proposalId ? (
                        <button
                          onClick={() => proposalService.downloadDocument(d.proposalId!, d.id, d.fileName)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Tải xuống"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
