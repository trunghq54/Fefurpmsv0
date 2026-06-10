import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { contractService } from '../../services/contractService'
import { disbursementService } from '../../services/disbursementService'
import { deliverableService } from '../../services/deliverableService'
import { amendmentService } from '../../services/amendmentService'
import type {
  ContractListResponse,
  ContractDetailResponse,
  DisbursementResponse,
  DeliverableResponse,
  AmendmentListResponse,
  AmendmentDetailResponse,
  CreateContractRequest,
  ConfirmDisbursementRequest,
  SubmitDeliverableRequest,
  EvaluateDeliverableRequest,
  CreateAmendmentRequest,
  ReviewAmendmentRequest,
} from '../../types/contract'
import { FileText, Plus, CheckCircle, Clock, AlertCircle, ChevronLeft, RefreshCw } from 'lucide-react'

// ── helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  PENDING_SIGNATURE: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-green-100 text-green-700',
  UNDER_REVIEW: 'bg-orange-100 text-orange-700',
  TERMINATED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  PENDING: 'bg-gray-100 text-gray-700',
  DISBURSED: 'bg-green-100 text-green-700',
  PASSED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
}

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-700'
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{status}</span>
}

function fmtMoney(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
}

function fmtDate(s: string | null | undefined) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('vi-VN')
}

// ── sub-components ───────────────────────────────────────────────────────────

function DisbursementsTab({
  contractId,
  isStaff,
  contractStatus,
}: {
  contractId: string
  isStaff: boolean
  contractStatus: string
}) {
  const [items, setItems] = useState<DisbursementResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmTarget, setConfirmTarget] = useState<number | null>(null)
  const [confirmForm, setConfirmForm] = useState<ConfirmDisbursementRequest>({
    actualAmount: 0,
    bankReference: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await contractService.getDisbursements(contractId)
      if (r.success && r.data) setItems(r.data)
    } finally {
      setLoading(false)
    }
  }, [contractId])

  useEffect(() => { load() }, [load])

  const handleGenerate = async () => {
    await contractService.generateDisbursements(contractId)
    load()
  }

  const handleConfirm = async () => {
    if (confirmTarget == null) return
    await disbursementService.confirm(confirmTarget, confirmForm)
    setConfirmTarget(null)
    load()
  }

  if (loading) return <p className="text-gray-500 py-4">Đang tải...</p>

  return (
    <div className="space-y-4">
      {isStaff && items.length === 0 && contractStatus === 'ACTIVE' && (
        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus size={14} /> Tạo lịch giải ngân
        </button>
      )}

      {items.length === 0 ? (
        <p className="text-gray-400 text-sm">Chưa có lịch giải ngân.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-600 text-xs uppercase">
                <th className="px-3 py-2">Đợt</th>
                <th className="px-3 py-2">%</th>
                <th className="px-3 py-2">Kế hoạch</th>
                <th className="px-3 py-2">Thực tế</th>
                <th className="px-3 py-2">Điều kiện</th>
                <th className="px-3 py-2">Trạng thái</th>
                {isStaff && <th className="px-3 py-2">Hành động</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{d.roundNumber}</td>
                  <td className="px-3 py-2">{d.percentage}%</td>
                  <td className="px-3 py-2">{fmtMoney(d.plannedAmount)}</td>
                  <td className="px-3 py-2">{d.actualAmount != null ? fmtMoney(d.actualAmount) : '—'}</td>
                  <td className="px-3 py-2 max-w-xs truncate" title={d.conditionDescription}>{d.conditionDescription}</td>
                  <td className="px-3 py-2"><StatusBadge status={d.status} /></td>
                  {isStaff && (
                    <td className="px-3 py-2">
                      {d.status === 'PENDING' && d.conditionMetAt && (
                        <button
                          onClick={() => {
                            setConfirmTarget(d.id)
                            setConfirmForm({ actualAmount: d.plannedAmount, bankReference: '' })
                          }}
                          className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Xác nhận giải ngân
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmTarget != null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Xác nhận giải ngân</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Số tiền thực tế (VNĐ)</label>
                <input
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={confirmForm.actualAmount}
                  onChange={(e) => setConfirmForm({ ...confirmForm, actualAmount: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Mã tham chiếu ngân hàng</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={confirmForm.bankReference}
                  onChange={(e) => setConfirmForm({ ...confirmForm, bankReference: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Ghi chú</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  rows={2}
                  value={confirmForm.notes ?? ''}
                  onChange={(e) => setConfirmForm({ ...confirmForm, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setConfirmTarget(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Hủy</button>
              <button onClick={handleConfirm} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DeliverablesTab({
  contractId,
  isStaff,
  isPi,
}: {
  contractId: string
  isStaff: boolean
  isPi: boolean
}) {
  const [items, setItems] = useState<DeliverableResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [submitTarget, setSubmitTarget] = useState<number | null>(null)
  const [submitForm, setSubmitForm] = useState<SubmitDeliverableRequest>({ fileUrl: '' })
  const [evalTarget, setEvalTarget] = useState<number | null>(null)
  const [evalForm, setEvalForm] = useState<EvaluateDeliverableRequest>({ acceptanceStatus: 'PASSED' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await contractService.getDeliverables(contractId)
      if (r.success && r.data) setItems(r.data)
    } finally {
      setLoading(false)
    }
  }, [contractId])

  useEffect(() => { load() }, [load])

  const handleSubmit = async () => {
    if (submitTarget == null) return
    await deliverableService.submit(submitTarget, submitForm)
    setSubmitTarget(null)
    load()
  }

  const handleEvaluate = async () => {
    if (evalTarget == null) return
    await deliverableService.evaluate(evalTarget, evalForm)
    setEvalTarget(null)
    load()
  }

  if (loading) return <p className="text-gray-500 py-4">Đang tải...</p>
  if (items.length === 0) return <p className="text-gray-400 text-sm">Chưa có sản phẩm giao nộp.</p>

  return (
    <div className="space-y-3">
      {items.map((d) => (
        <div key={d.id} className="border rounded-lg p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="font-medium text-gray-800">{d.productName}</p>
              {d.categoryName && <p className="text-xs text-gray-500">{d.categoryName}</p>}
              {d.description && <p className="text-sm text-gray-600 mt-1">{d.description}</p>}
              <div className="flex gap-3 mt-2 text-xs text-gray-500">
                {d.dueDate && <span>Hạn: {fmtDate(d.dueDate)}</span>}
                {d.submittedAt && <span>Nộp: {fmtDate(d.submittedAt)}</span>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              {d.acceptanceStatus && <StatusBadge status={d.acceptanceStatus} />}
              {!d.submittedAt && isPi && (
                <button
                  onClick={() => { setSubmitTarget(d.id); setSubmitForm({ fileUrl: '' }) }}
                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Nộp sản phẩm
                </button>
              )}
              {d.submittedAt && !d.acceptanceStatus && isStaff && (
                <button
                  onClick={() => { setEvalTarget(d.id); setEvalForm({ acceptanceStatus: 'PASSED' }) }}
                  className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Đánh giá
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {submitTarget != null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nộp sản phẩm</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">URL file sản phẩm</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={submitForm.fileUrl}
                  onChange={(e) => setSubmitForm({ ...submitForm, fileUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Mô tả</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  value={submitForm.description ?? ''}
                  onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setSubmitTarget(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Hủy</button>
              <button onClick={handleSubmit} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Nộp</button>
            </div>
          </div>
        </div>
      )}

      {evalTarget != null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Đánh giá sản phẩm</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Kết quả đánh giá</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={evalForm.acceptanceStatus}
                  onChange={(e) => setEvalForm({ ...evalForm, acceptanceStatus: e.target.value as 'PASSED' | 'FAILED' })}
                >
                  <option value="PASSED">Đạt (PASSED)</option>
                  <option value="FAILED">Không đạt (FAILED)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Nhận xét chất lượng</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  value={evalForm.qualityAssessment ?? ''}
                  onChange={(e) => setEvalForm({ ...evalForm, qualityAssessment: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setEvalTarget(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Hủy</button>
              <button onClick={handleEvaluate} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">Lưu đánh giá</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AmendmentsTab({
  contractId,
  isStaff,
  isPi,
}: {
  contractId: string
  isStaff: boolean
  isPi: boolean
}) {
  const [items, setItems] = useState<AmendmentListResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<CreateAmendmentRequest>({
    categoryId: 1,
    changeDescription: '',
    justification: '',
    requiresRectorApproval: false,
  })
  const [reviewTarget, setReviewTarget] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null)
  const [reviewForm, setReviewForm] = useState<ReviewAmendmentRequest>({ reviewerComments: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await contractService.getAmendments(contractId)
      if (r.success && r.data) setItems(r.data)
    } finally {
      setLoading(false)
    }
  }, [contractId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    await contractService.createAmendment(contractId, createForm)
    setShowCreate(false)
    load()
  }

  const handleReview = async () => {
    if (!reviewTarget) return
    if (reviewTarget.action === 'approve') {
      await amendmentService.approve(reviewTarget.id, reviewForm)
    } else {
      await amendmentService.reject(reviewTarget.id, reviewForm)
    }
    setReviewTarget(null)
    load()
  }

  if (loading) return <p className="text-gray-500 py-4">Đang tải...</p>

  return (
    <div className="space-y-4">
      {isPi && (
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          <Plus size={14} /> Tạo yêu cầu điều chỉnh
        </button>
      )}

      {items.length === 0 ? (
        <p className="text-gray-400 text-sm">Chưa có yêu cầu điều chỉnh.</p>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{a.changeDescription}</p>
                  <p className="text-sm text-gray-600 mt-1">{a.justification}</p>
                  <div className="flex gap-3 mt-2 text-xs text-gray-500">
                    {a.categoryName && <span>Loại: {a.categoryName}</span>}
                    <span>Ngày: {fmtDate(a.requestedAt)}</span>
                  </div>
                  {(a.oldValue || a.newValue) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {a.oldValue && <>Cũ: <span className="font-mono">{a.oldValue}</span>&nbsp;</>}
                      {a.newValue && <>Mới: <span className="font-mono">{a.newValue}</span></>}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <StatusBadge status={a.status} />
                  {isStaff && a.status === 'PENDING' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setReviewTarget({ id: a.id, action: 'approve' }); setReviewForm({ reviewerComments: '' }) }}
                        className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >Duyệt</button>
                      <button
                        onClick={() => { setReviewTarget({ id: a.id, action: 'reject' }); setReviewForm({ reviewerComments: '' }) }}
                        className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >Từ chối</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Tạo yêu cầu điều chỉnh</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">ID danh mục điều chỉnh</label>
                <input
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={createForm.categoryId}
                  onChange={(e) => setCreateForm({ ...createForm, categoryId: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Mô tả thay đổi</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  value={createForm.changeDescription}
                  onChange={(e) => setCreateForm({ ...createForm, changeDescription: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Lý do</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  value={createForm.justification}
                  onChange={(e) => setCreateForm({ ...createForm, justification: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Giá trị cũ</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={createForm.oldValue ?? ''}
                    onChange={(e) => setCreateForm({ ...createForm, oldValue: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Giá trị mới</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={createForm.newValue ?? ''}
                    onChange={(e) => setCreateForm({ ...createForm, newValue: e.target.value })}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={createForm.requiresRectorApproval}
                  onChange={(e) => setCreateForm({ ...createForm, requiresRectorApproval: e.target.checked })}
                />
                Cần phê duyệt từ Hiệu trưởng
              </label>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Hủy</button>
              <button onClick={handleCreate} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Tạo yêu cầu</button>
            </div>
          </div>
        </div>
      )}

      {reviewTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {reviewTarget.action === 'approve' ? 'Phê duyệt yêu cầu' : 'Từ chối yêu cầu'}
            </h3>
            <div>
              <label className="text-sm font-medium text-gray-700">Nhận xét</label>
              <textarea
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                rows={3}
                value={reviewForm.reviewerComments ?? ''}
                onChange={(e) => setReviewForm({ reviewerComments: e.target.value })}
              />
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setReviewTarget(null)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Hủy</button>
              <button
                onClick={handleReview}
                className={`px-4 py-2 text-sm text-white rounded-lg ${reviewTarget.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}`}
              >
                {reviewTarget.action === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Contract Detail ──────────────────────────────────────────────────────────

function ContractDetail({
  contract,
  onBack,
  isStaff,
  isPi,
}: {
  contract: ContractDetailResponse
  onBack: () => void
  isStaff: boolean
  isPi: boolean
}) {
  const [tab, setTab] = useState<'disbursements' | 'deliverables' | 'amendments'>('disbursements')

  const tabs = [
    { id: 'disbursements' as const, label: 'Giải ngân' },
    { id: 'deliverables' as const, label: 'Sản phẩm' },
    { id: 'amendments' as const, label: 'Điều chỉnh' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{contract.contractNumber}</h2>
          <p className="text-sm text-gray-500">{contract.proposalTitle}</p>
        </div>
        <div className="ml-auto"><StatusBadge status={contract.status} /></div>
      </div>

      <div className="bg-white border rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Tổng kinh phí</p>
          <p className="font-semibold text-gray-800">{fmtMoney(contract.totalAmount)}</p>
        </div>
        <div>
          <p className="text-gray-500">Phương thức</p>
          <p className="font-semibold text-gray-800">{contract.fundingMethod ?? '—'}</p>
        </div>
        <div>
          <p className="text-gray-500">Ngày bắt đầu</p>
          <p className="font-semibold text-gray-800">{fmtDate(contract.startDate)}</p>
        </div>
        <div>
          <p className="text-gray-500">Ngày kết thúc</p>
          <p className="font-semibold text-gray-800">{fmtDate(contract.endDate)}</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="flex border-b">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === 'disbursements' && (
            <DisbursementsTab contractId={contract.id} isStaff={isStaff} contractStatus={contract.status} />
          )}
          {tab === 'deliverables' && (
            <DeliverablesTab contractId={contract.id} isStaff={isStaff} isPi={isPi} />
          )}
          {tab === 'amendments' && (
            <AmendmentsTab contractId={contract.id} isStaff={isStaff} isPi={isPi} />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function ContractManagement() {
  const { user, activeRole } = useAuth()
  const isStaff = activeRole === 'Staff' || activeRole === 'Administrator'
  const isPi = activeRole === 'Faculty'

  const [contracts, setContracts] = useState<ContractListResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ContractDetailResponse | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<CreateContractRequest>({
    proposalId: '',
    contractNumber: '',
    startDate: '',
    endDate: '',
    maxExtensionMonths: 6,
  })

  const loadList = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await contractService.getContracts()
      if (r.success && r.data) setContracts(r.data)
    } catch {
      setError('Không thể tải danh sách hợp đồng.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadList() }, [loadList])

  const openDetail = async (id: string) => {
    setSelectedId(id)
    const r = await contractService.getContract(id)
    if (r.success && r.data) setDetail(r.data)
  }

  const handleSign = async (id: string) => {
    await contractService.signContract(id)
    loadList()
    if (selectedId === id) {
      const r = await contractService.getContract(id)
      if (r.success && r.data) setDetail(r.data)
    }
  }

  const handleCreate = async () => {
    await contractService.createContract(createForm)
    setShowCreate(false)
    loadList()
  }

  if (selectedId && detail) {
    return (
      <ContractDetail
        contract={detail}
        onBack={() => { setSelectedId(null); setDetail(null) }}
        isStaff={isStaff}
        isPi={isPi}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý Hợp đồng</h2>
          <p className="text-sm text-gray-500 mt-1">Danh sách hợp đồng nghiên cứu khoa học</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadList}
            className="p-2 border rounded-lg hover:bg-gray-50"
            title="Làm mới"
          >
            <RefreshCw size={16} />
          </button>
          {isStaff && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Plus size={14} /> Tạo hợp đồng
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center py-10 text-gray-400">Đang tải...</div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {!loading && !error && contracts.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p>Chưa có hợp đồng nào.</p>
        </div>
      )}

      {!loading && contracts.length > 0 && (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-600 text-xs uppercase border-b">
                <th className="px-4 py-3">Số HĐ</th>
                <th className="px-4 py-3">Đề tài</th>
                <th className="px-4 py-3">Kinh phí</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.contractNumber}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={c.proposalTitle ?? ''}>
                    <span className="text-gray-800">{c.proposalTitle ?? '—'}</span>
                    {c.proposalCode && <span className="text-xs text-gray-400 ml-1">({c.proposalCode})</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{fmtMoney(c.totalAmount)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                    {fmtDate(c.startDate)} – {fmtDate(c.endDate)}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openDetail(c.id)}
                        className="text-xs px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100"
                      >
                        Chi tiết
                      </button>
                      {isStaff && c.status === 'PENDING_SIGNATURE' && (
                        <button
                          onClick={() => handleSign(c.id)}
                          className="text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100"
                        >
                          Ký kết
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Tạo hợp đồng mới</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">ID đề xuất (APPROVED)</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                  value={createForm.proposalId}
                  onChange={(e) => setCreateForm({ ...createForm, proposalId: e.target.value })}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Số hợp đồng</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={createForm.contractNumber}
                  onChange={(e) => setCreateForm({ ...createForm, contractNumber: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                  <input
                    type="date"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Ngày kết thúc</label>
                  <input
                    type="date"
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Số tháng gia hạn tối đa</label>
                <input
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={createForm.maxExtensionMonths ?? 6}
                  onChange={(e) => setCreateForm({ ...createForm, maxExtensionMonths: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Đại diện bên A</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={createForm.sideARepresentative ?? ''}
                  onChange={(e) => setCreateForm({ ...createForm, sideARepresentative: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Hủy</button>
              <button onClick={handleCreate} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Tạo hợp đồng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
