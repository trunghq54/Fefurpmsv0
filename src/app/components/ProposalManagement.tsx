import { useState, useEffect } from 'react'
import { Search, Eye, X, FileText, Users, Wallet, ClipboardList } from 'lucide-react'
import { proposalService } from '../../services/proposalService'
import type { ProposalSummaryDto, ProposalDto } from '../../types/proposal'
import ReviewRoundsPanel from './ReviewRoundsPanel'
import AiSummaryPanel from './AiSummaryPanel'
import ProposalDocuments from './ProposalDocuments'
import ProposalDocumentPreview from './ProposalDocumentPreview'
import { Button, Input, Select } from './ui-kit'

const STATUSES = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'CONTRACT_SIGNED',
  'IN_PROGRESS',
  'ACCEPTANCE_PENDING',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
  'SUSPENDED',
]

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Bản nháp',
  SUBMITTED: 'Đã nộp',
  UNDER_REVIEW: 'Đang xét duyệt',
  APPROVED: 'Đã duyệt',
  CONTRACT_SIGNED: 'Đã ký HĐ',
  IN_PROGRESS: 'Đang thực hiện',
  ACCEPTANCE_PENDING: 'Chờ nghiệm thu',
  ACCEPTED: 'Đã nghiệm thu',
  REJECTED: 'Từ chối',
  WITHDRAWN: 'Rút lại',
  SUSPENDED: 'Tạm dừng',
}

const statusColor = (status: string) => {
  const map: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SUBMITTED: 'bg-yellow-100 text-yellow-800',
    UNDER_REVIEW: 'bg-blue-100 text-blue-800',
    APPROVED: 'bg-green-100 text-green-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    CONTRACT_SIGNED: 'bg-purple-100 text-purple-800',
    IN_PROGRESS: 'bg-indigo-100 text-indigo-800',
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

const formatVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫'

export default function ProposalManagement() {
  const [proposals, setProposals] = useState<ProposalSummaryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')

  const [detail, setDetail] = useState<ProposalDto | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<{ id: string; title: string } | null>(null)

  const load = () => {
    setLoading(true)
    proposalService
      .getAll({
        status: filterStatus === 'all' ? undefined : filterStatus,
        type: filterType === 'all' ? undefined : filterType,
        search: search || undefined,
      })
      .then((res) => {
        if (res.success && res.data) setProposals(res.data)
        setLoading(false)
      })
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterType])

  const openDetail = async (id: string) => {
    setLoadingDetail(true)
    setDetail(null)
    const res = await proposalService.getById(id)
    if (res.success && res.data) setDetail(res.data)
    setLoadingDetail(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Đề xuất</h2>
        <p className="text-gray-500 mt-1">Theo dõi toàn bộ đề xuất nghiên cứu</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[280px] relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
              placeholder="Tìm theo tên đề tài... (Enter)"
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-auto">
            <option value="all">Tất cả trạng thái</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s] ?? s}
              </option>
            ))}
          </Select>
          <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-auto">
            <option value="all">Tất cả loại</option>
            <option value="Applied">Applied</option>
            <option value="Basic">Basic</option>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Tổng đề xuất</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{proposals.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Đã nộp</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {proposals.filter((p) => p.status === 'SUBMITTED').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Đã duyệt</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {proposals.filter((p) => p.status === 'APPROVED').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500">Tổng kinh phí đề xuất</p>
          <p className="text-lg font-bold text-blue-600 mt-1">
            {formatVnd(proposals.reduce((s, p) => s + p.totalBudget, 0))}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Đang tải dữ liệu...</div>
        ) : proposals.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            Không có đề xuất nào khớp bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Đề tài</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Chủ nhiệm</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Track</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Loại</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kinh phí</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {proposals.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-medium text-gray-800 truncate">{p.titleVI}</p>
                      <p className="text-sm text-gray-500">Tạo: {new Date(p.createdAt).toLocaleDateString('vi-VN')}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{p.principalInvestigatorName}</td>
                    <td className="px-6 py-4 text-gray-600">{p.trackName || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-sm">{p.researchType}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatVnd(p.totalBudget)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(p.status)}`}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openDetail(p.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {(detail || loadingDetail) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-800">Chi tiết đề xuất</h3>
              <div className="flex items-center gap-2">
                {detail && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewDoc({ id: detail.id, title: detail.titleVI })}
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <ClipboardList className="w-4 h-4" /> Hồ sơ (Word/Excel)
                  </Button>
                )}
                <button onClick={() => setDetail(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {loadingDetail ? (
              <div className="p-12 text-center text-gray-400">Đang tải...</div>
            ) : detail ? (
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">{detail.titleVI}</h4>
                  <p className="text-sm text-gray-500">{detail.titleEN}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(detail.status)}`}>
                      {detail.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm bg-gray-100">{detail.researchType}</span>
                    <span className="px-3 py-1 rounded-full text-sm bg-gray-100">{detail.durationMonths} tháng</span>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <Field label="Chủ nhiệm" value={detail.principalInvestigatorName} />
                  <Field label="Đợt" value={detail.cycleName} />
                  <Field label="Track" value={detail.trackName} />
                  <Field label="Tổng kinh phí" value={formatVnd(detail.totalBudget)} />
                </div>
                {detail.objectives && <Block label="Mục tiêu" value={detail.objectives} />}
                {detail.methodology && <Block label="Phương pháp" value={detail.methodology} />}
                {detail.expectedOutput && <Block label="Sản phẩm dự kiến" value={detail.expectedOutput} />}

                <div>
                  <h5 className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                    <Users className="w-4 h-4" /> Thành viên ({detail.members.length})
                  </h5>
                  <div className="border border-gray-200 rounded-lg divide-y">
                    {detail.members.map((m) => (
                      <div key={m.id} className="px-4 py-2 text-sm flex justify-between">
                        <span className="text-gray-800">
                          {m.fullName} <span className="text-gray-400">· {m.role}</span>
                        </span>
                        <span className="text-gray-500">{m.workMonths} tháng</span>
                      </div>
                    ))}
                    {detail.members.length === 0 && <div className="px-4 py-2 text-sm text-gray-400">Không có</div>}
                  </div>
                </div>

                <div>
                  <h5 className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                    <Wallet className="w-4 h-4" /> Kinh phí ({detail.budgetItems.length})
                  </h5>
                  <div className="border border-gray-200 rounded-lg divide-y">
                    {detail.budgetItems.map((b) => (
                      <div key={b.id} className="px-4 py-2 text-sm flex justify-between">
                        <span className="text-gray-800">{b.category}</span>
                        <span className="text-gray-600">{formatVnd(b.amount)}</span>
                      </div>
                    ))}
                    {detail.budgetItems.length === 0 && <div className="px-4 py-2 text-sm text-gray-400">Không có</div>}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-5">
                  <ProposalDocuments proposalId={detail.id} />
                </div>

                <AiSummaryPanel proposalId={detail.id} />

                <div className="border-t border-gray-200 pt-5">
                  <ReviewRoundsPanel proposalId={detail.id} />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {previewDoc && (
        <ProposalDocumentPreview
          proposalId={previewDoc.id}
          title={previewDoc.title}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value || '—'}</p>
    </div>
  )
}

function Block({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-800 whitespace-pre-wrap">{value}</p>
    </div>
  )
}
