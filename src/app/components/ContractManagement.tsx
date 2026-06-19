import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { contractService } from '../../services/contractService'
import { disbursementService } from '../../services/disbursementService'
import { deliverableService } from '../../services/deliverableService'
import { amendmentService } from '../../services/amendmentService'
import { progressReportService } from '../../services/progressReportService'
import type { ProgressReportSummaryDto, ProgressReportDto, CreateProgressReportRequest, EvaluateProgressReportRequest } from '../../services/progressReportService'
import { finalReportService } from '../../services/finalReportService'
import type { FinalReportDto, SubmitFinalReportRequest } from '../../services/finalReportService'
import { settlementService } from '../../services/settlementService'
import type { SettlementDto, CreateSettlementRequest } from '../../services/settlementService'
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
import { Button, Input, Select, Textarea } from './ui-kit'

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
        <Button size="sm" onClick={handleGenerate}>
          <Plus size={14} /> Tạo lịch giải ngân
        </Button>
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
                <Input type="number" className="mt-1" value={confirmForm.actualAmount}
                  onChange={(e) => setConfirmForm({ ...confirmForm, actualAmount: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Mã tham chiếu ngân hàng</label>
                <Input type="text" className="mt-1" value={confirmForm.bankReference}
                  onChange={(e) => setConfirmForm({ ...confirmForm, bankReference: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Ghi chú</label>
                <Textarea className="mt-1" rows={2} value={confirmForm.notes ?? ''}
                  onChange={(e) => setConfirmForm({ ...confirmForm, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" onClick={() => setConfirmTarget(null)}>Hủy</Button>
              <Button variant="success" onClick={handleConfirm}>Xác nhận</Button>
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
                <Input type="text" className="mt-1" value={submitForm.fileUrl}
                  onChange={(e) => setSubmitForm({ ...submitForm, fileUrl: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Mô tả</label>
                <Textarea className="mt-1" rows={3} value={submitForm.description ?? ''}
                  onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" onClick={() => setSubmitTarget(null)}>Hủy</Button>
              <Button onClick={handleSubmit}>Nộp</Button>
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
                <Select className="mt-1" value={evalForm.acceptanceStatus}
                  onChange={(e) => setEvalForm({ ...evalForm, acceptanceStatus: e.target.value as 'PASSED' | 'FAILED' })}>
                  <option value="PASSED">Đạt (PASSED)</option>
                  <option value="FAILED">Không đạt (FAILED)</option>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Nhận xét chất lượng</label>
                <Textarea className="mt-1" rows={3} value={evalForm.qualityAssessment ?? ''}
                  onChange={(e) => setEvalForm({ ...evalForm, qualityAssessment: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" onClick={() => setEvalTarget(null)}>Hủy</Button>
              <Button onClick={handleEvaluate} className="bg-purple-600 hover:bg-purple-700">Lưu đánh giá</Button>
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
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> Tạo yêu cầu điều chỉnh
        </Button>
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
                <Input type="number" className="mt-1" value={createForm.categoryId}
                  onChange={(e) => setCreateForm({ ...createForm, categoryId: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Mô tả thay đổi</label>
                <Textarea className="mt-1" rows={3} value={createForm.changeDescription}
                  onChange={(e) => setCreateForm({ ...createForm, changeDescription: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Lý do</label>
                <Textarea className="mt-1" rows={3} value={createForm.justification}
                  onChange={(e) => setCreateForm({ ...createForm, justification: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Giá trị cũ</label>
                  <Input type="text" className="mt-1" value={createForm.oldValue ?? ''}
                    onChange={(e) => setCreateForm({ ...createForm, oldValue: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Giá trị mới</label>
                  <Input type="text" className="mt-1" value={createForm.newValue ?? ''}
                    onChange={(e) => setCreateForm({ ...createForm, newValue: e.target.value })} />
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
              <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
              <Button onClick={handleCreate}>Tạo yêu cầu</Button>
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
              <Textarea className="mt-1" rows={3} value={reviewForm.reviewerComments ?? ''}
                onChange={(e) => setReviewForm({ reviewerComments: e.target.value })} />
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" onClick={() => setReviewTarget(null)}>Hủy</Button>
              <Button variant={reviewTarget.action === 'approve' ? 'success' : 'danger'} onClick={handleReview}>
                {reviewTarget.action === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Progress Reports Tab ─────────────────────────────────────────────────────

function ProgressReportsTab({ contractId, isStaff, isPi }: { contractId: string; isStaff: boolean; isPi: boolean }) {
  const [reports, setReports] = useState<ProgressReportSummaryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<ProgressReportDto | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [evalTarget, setEvalTarget] = useState<string | null>(null)
  const [evalForm, setEvalForm] = useState<EvaluateProgressReportRequest>({ evaluationResult: 'SATISFACTORY' })
  const [createForm, setCreateForm] = useState<CreateProgressReportRequest>({
    reportingPeriodStart: '', reportingPeriodEnd: '', completedContent: '',
    overallCompletionPct: 0, expenditureToDate: 0, items: [],
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await progressReportService.getByContract(contractId)
      if (r.success && r.data) setReports(r.data)
    } finally { setLoading(false) }
  }, [contractId])

  useEffect(() => { load() }, [load])

  const openDetail = async (id: string) => {
    const r = await progressReportService.getById(id)
    if (r.success && r.data) setDetail(r.data)
  }

  const handleSubmit = async (id: string) => {
    await progressReportService.submit(id)
    load()
    if (detail?.id === id) {
      const r = await progressReportService.getById(id)
      if (r.success && r.data) setDetail(r.data)
    }
  }

  const handleEvaluate = async () => {
    if (!evalTarget) return
    await progressReportService.evaluate(evalTarget, evalForm)
    setEvalTarget(null)
    load()
    if (detail?.id === evalTarget) {
      const r = await progressReportService.getById(evalTarget)
      if (r.success && r.data) setDetail(r.data)
    }
  }

  const handleCreate = async () => {
    await progressReportService.create(contractId, createForm)
    setShowCreate(false)
    load()
  }

  const EVAL_LABEL: Record<string, string> = {
    SATISFACTORY: 'Đạt yêu cầu', UNSATISFACTORY: 'Không đạt', NEEDS_IMPROVEMENT: 'Cần cải thiện',
  }
  const evalColor: Record<string, string> = {
    SATISFACTORY: 'bg-green-100 text-green-700', UNSATISFACTORY: 'bg-red-100 text-red-700',
    NEEDS_IMPROVEMENT: 'bg-yellow-100 text-yellow-700',
  }

  if (loading) return <p className="text-gray-400 py-4">Đang tải...</p>

  if (detail) return (
    <div className="space-y-4">
      <button onClick={() => setDetail(null)} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
        <ChevronLeft size={14} /> Danh sách
      </button>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div><p className="text-gray-500">Kỳ báo cáo</p><p className="font-medium">{fmtDate(detail.reportingPeriodStart)} – {fmtDate(detail.reportingPeriodEnd)}</p></div>
        <div><p className="text-gray-500">Hoàn thành</p><p className="font-bold text-blue-600">{detail.overallCompletionPct}%</p></div>
        <div><p className="text-gray-500">Chi tiêu đến nay</p><p className="font-medium">{fmtMoney(detail.expenditureToDate)}</p></div>
        <div><p className="text-gray-500">Trạng thái</p><StatusBadge status={detail.status} /></div>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-3">
        <div><p className="font-medium text-gray-700 mb-1">Nội dung đã hoàn thành</p><p className="text-gray-600 whitespace-pre-wrap">{detail.completedContent}</p></div>
        {detail.pendingContent && <div><p className="font-medium text-gray-700 mb-1">Nội dung chưa hoàn thành</p><p className="text-gray-600 whitespace-pre-wrap">{detail.pendingContent}</p></div>}
        {detail.nextPeriodPlan && <div><p className="font-medium text-gray-700 mb-1">Kế hoạch kỳ tiếp</p><p className="text-gray-600 whitespace-pre-wrap">{detail.nextPeriodPlan}</p></div>}
      </div>
      {detail.evaluationResult && (
        <div className="border rounded-lg p-4 text-sm">
          <p className="font-medium text-gray-700 mb-2">Kết quả đánh giá</p>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${evalColor[detail.evaluationResult] ?? 'bg-gray-100 text-gray-700'}`}>{EVAL_LABEL[detail.evaluationResult] ?? detail.evaluationResult}</span>
          {detail.evaluationComments && <p className="text-gray-600 mt-2">{detail.evaluationComments}</p>}
        </div>
      )}
      <div className="flex gap-2">
        {isPi && detail.status === 'DRAFT' && (
          <Button size="sm" onClick={() => handleSubmit(detail.id)}>Nộp báo cáo</Button>
        )}
        {isStaff && detail.status === 'SUBMITTED' && (
          <Button size="sm" onClick={() => { setEvalTarget(detail.id); setEvalForm({ evaluationResult: 'SATISFACTORY' }) }} className="bg-purple-600 hover:bg-purple-700">Đánh giá</Button>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {isPi && (
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> Tạo báo cáo tiến độ
        </Button>
      )}
      {reports.length === 0 ? (
        <p className="text-gray-400 text-sm">Chưa có báo cáo tiến độ nào.</p>
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <div key={r.id} className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Kỳ {r.reportRound}: {fmtDate(r.reportingPeriodStart)} – {fmtDate(r.reportingPeriodEnd)}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>Hoàn thành: <b>{r.overallCompletionPct}%</b></span>
                  <StatusBadge status={r.status} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openDetail(r.id)} className="text-xs px-2 py-1 border rounded hover:bg-gray-50">Chi tiết</button>
                {isPi && r.status === 'DRAFT' && (
                  <button onClick={() => handleSubmit(r.id)} className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Nộp</button>
                )}
                {isStaff && r.status === 'SUBMITTED' && (
                  <button onClick={() => { setEvalTarget(r.id); setEvalForm({ evaluationResult: 'SATISFACTORY' }) }} className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">Đánh giá</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Tạo báo cáo tiến độ</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Từ ngày</label>
                  <Input type="date" className="mt-1" value={createForm.reportingPeriodStart}
                    onChange={(e) => setCreateForm({ ...createForm, reportingPeriodStart: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Đến ngày</label>
                  <Input type="date" className="mt-1" value={createForm.reportingPeriodEnd}
                    onChange={(e) => setCreateForm({ ...createForm, reportingPeriodEnd: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Nội dung đã hoàn thành *</label>
                <Textarea rows={3} className="mt-1" value={createForm.completedContent}
                  onChange={(e) => setCreateForm({ ...createForm, completedContent: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Nội dung chưa hoàn thành</label>
                <Textarea rows={2} className="mt-1" value={createForm.pendingContent ?? ''}
                  onChange={(e) => setCreateForm({ ...createForm, pendingContent: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Kế hoạch kỳ tiếp</label>
                <Textarea rows={2} className="mt-1" value={createForm.nextPeriodPlan ?? ''}
                  onChange={(e) => setCreateForm({ ...createForm, nextPeriodPlan: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Tiến độ tổng thể (%)</label>
                  <Input type="number" min={0} max={100} className="mt-1" value={createForm.overallCompletionPct}
                    onChange={(e) => setCreateForm({ ...createForm, overallCompletionPct: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Chi tiêu đến nay (₫)</label>
                  <Input type="number" className="mt-1" value={createForm.expenditureToDate}
                    onChange={(e) => setCreateForm({ ...createForm, expenditureToDate: Number(e.target.value) })} />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
              <Button onClick={handleCreate}>Tạo báo cáo</Button>
            </div>
          </div>
        </div>
      )}

      {evalTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Đánh giá báo cáo tiến độ</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Kết quả đánh giá</label>
                <Select className="mt-1" value={evalForm.evaluationResult}
                  onChange={(e) => setEvalForm({ ...evalForm, evaluationResult: e.target.value as EvaluateProgressReportRequest['evaluationResult'] })}>
                  <option value="SATISFACTORY">Đạt yêu cầu</option>
                  <option value="UNSATISFACTORY">Không đạt</option>
                  <option value="NEEDS_IMPROVEMENT">Cần cải thiện</option>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Nhận xét</label>
                <Textarea rows={3} className="mt-1" value={evalForm.evaluationComments ?? ''}
                  onChange={(e) => setEvalForm({ ...evalForm, evaluationComments: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" onClick={() => setEvalTarget(null)}>Hủy</Button>
              <Button onClick={handleEvaluate} className="bg-purple-600 hover:bg-purple-700">Lưu đánh giá</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Final Report Tab ──────────────────────────────────────────────────────────

function FinalReportTab({ contractId, isStaff, isPi }: { contractId: string; isStaff: boolean; isPi: boolean }) {
  const [report, setReport] = useState<FinalReportDto | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [showSubmit, setShowSubmit] = useState(false)
  const [submitForm, setSubmitForm] = useState<SubmitFinalReportRequest>({ reportFileUrl: '', language: 'vi' })
  const [revisionNotes, setRevisionNotes] = useState('')
  const [showRevision, setShowRevision] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await finalReportService.getByContract(contractId)
      setReport(r.success ? r.data : null)
    } finally { setLoading(false) }
  }, [contractId])

  useEffect(() => { load() }, [load])

  const handleSubmit = async () => {
    await finalReportService.submit(contractId, submitForm)
    setShowSubmit(false)
    load()
  }

  const handleAccept = async () => {
    if (!report) return
    await finalReportService.accept(report.id)
    load()
  }

  const handleRevision = async () => {
    if (!report) return
    await finalReportService.requestRevision(report.id, { revisionNotes })
    setShowRevision(false)
    load()
  }

  const handleArchive = async () => {
    if (!report) return
    await finalReportService.archive(report.id)
    load()
  }

  if (loading) return <p className="text-gray-400 py-4">Đang tải...</p>

  const STATUS_LABEL: Record<string, string> = {
    NOT_SUBMITTED: 'Chưa nộp', SUBMITTED: 'Đã nộp', UNDER_REVIEW: 'Đang xét',
    ACCEPTED: 'Chấp nhận', REVISION_REQUIRED: 'Yêu cầu chỉnh sửa', ARCHIVED: 'Đã lưu trữ',
  }

  return (
    <div className="space-y-4">
      {!report ? (
        <div className="text-center py-8 text-gray-400">
          <FileText size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Chưa có báo cáo tổng kết.</p>
          {isPi && (
            <Button size="sm" className="mt-3" onClick={() => setShowSubmit(true)}>
              Nộp báo cáo tổng kết
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div><p className="text-gray-500">Trạng thái</p><StatusBadge status={report.status} /></div>
            <div><p className="text-gray-500">Ngôn ngữ</p><p className="font-medium">{report.language === 'vi' ? 'Tiếng Việt' : 'English'}</p></div>
            {report.submittedAt && <div><p className="text-gray-500">Ngày nộp</p><p className="font-medium">{fmtDate(report.submittedAt)}</p></div>}
            {report.deadline && <div><p className="text-gray-500">Hạn nộp</p><p className="font-medium">{fmtDate(report.deadline)}</p></div>}
            {report.archivedAt && <div><p className="text-gray-500">Lưu trữ</p><p className="font-medium">{fmtDate(report.archivedAt)}</p></div>}
          </div>
          {report.reportFileUrl && (
            <div className="border rounded-lg p-3 text-sm">
              <p className="text-gray-500 mb-1">File báo cáo</p>
              <a href={report.reportFileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">{report.reportFileUrl}</a>
            </div>
          )}
          {report.revisionNotes && (
            <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-3 text-sm">
              <p className="font-medium text-yellow-800 mb-1">Yêu cầu chỉnh sửa</p>
              <p className="text-yellow-700">{report.revisionNotes}</p>
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            {isPi && (report.status === 'NOT_SUBMITTED' || report.status === 'REVISION_REQUIRED') && (
              <Button size="sm" onClick={() => setShowSubmit(true)}>
                {report.status === 'REVISION_REQUIRED' ? 'Nộp lại' : 'Nộp báo cáo'}
              </Button>
            )}
            {isStaff && report.status === 'SUBMITTED' && (
              <>
                <Button variant="success" size="sm" onClick={handleAccept}>Chấp nhận</Button>
                <Button size="sm" onClick={() => setShowRevision(true)} className="bg-yellow-500 hover:bg-yellow-600">Yêu cầu chỉnh sửa</Button>
              </>
            )}
            {isStaff && report.status === 'ACCEPTED' && !report.archivedAt && (
              <Button size="sm" onClick={handleArchive} className="bg-gray-600 hover:bg-gray-700">Lưu trữ</Button>
            )}
          </div>
        </div>
      )}

      {showSubmit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nộp báo cáo tổng kết</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">URL file báo cáo *</label>
                <Input type="text" className="mt-1" value={submitForm.reportFileUrl} placeholder="https://..."
                  onChange={(e) => setSubmitForm({ ...submitForm, reportFileUrl: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">URL tóm tắt (tùy chọn)</label>
                <Input type="text" className="mt-1" value={submitForm.summaryFileUrl ?? ''} placeholder="https://..."
                  onChange={(e) => setSubmitForm({ ...submitForm, summaryFileUrl: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Ngôn ngữ báo cáo</label>
                <Select className="mt-1" value={submitForm.language}
                  onChange={(e) => setSubmitForm({ ...submitForm, language: e.target.value })}>
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" onClick={() => setShowSubmit(false)}>Hủy</Button>
              <Button onClick={handleSubmit}>Nộp</Button>
            </div>
          </div>
        </div>
      )}

      {showRevision && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Yêu cầu chỉnh sửa</h3>
            <div>
              <label className="text-sm font-medium text-gray-700">Nội dung yêu cầu</label>
              <Textarea rows={4} className="mt-1" value={revisionNotes} onChange={(e) => setRevisionNotes(e.target.value)} />
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" onClick={() => setShowRevision(false)}>Hủy</Button>
              <Button onClick={handleRevision} className="bg-yellow-500 hover:bg-yellow-600">Gửi yêu cầu</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Settlement Tab ────────────────────────────────────────────────────────────

function SettlementTab({ contractId, isStaff }: { contractId: string; isStaff: boolean }) {
  const [settlement, setSettlement] = useState<SettlementDto | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<CreateSettlementRequest>({
    totalContractedAmount: 0, totalDisbursedAmount: 0, totalReturnedAmount: 0,
  })
  const [signeeId, setSigneeId] = useState('')
  const [clearedDate, setClearedDate] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await settlementService.getByContract(contractId)
      setSettlement(r.success ? r.data : null)
    } finally { setLoading(false) }
  }, [contractId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    await settlementService.create(contractId, createForm)
    setShowCreate(false)
    load()
  }

  const handleSign = async () => {
    if (!settlement || !signeeId) return
    await settlementService.sign(settlement.id, { sideASigneeId: signeeId })
    load()
  }

  const handleAccountingCleared = async () => {
    if (!settlement || !clearedDate) return
    await settlementService.markAccountingCleared(settlement.id, { clearedDate })
    load()
  }

  const handleAssetsCleared = async () => {
    if (!settlement || !clearedDate) return
    await settlementService.markAssetsCleared(settlement.id, { clearedDate })
    load()
  }

  if (loading) return <p className="text-gray-400 py-4">Đang tải...</p>

  return (
    <div className="space-y-4">
      {!settlement ? (
        <div className="text-center py-8 text-gray-400">
          <FileText size={36} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Chưa có hồ sơ thanh lý.</p>
          {isStaff && (
            <Button size="sm" className="mt-3 mx-auto" onClick={() => setShowCreate(true)}>
              <Plus size={14} /> Tạo hồ sơ thanh lý
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div><p className="text-gray-500">Tổng HĐ</p><p className="font-semibold">{fmtMoney(settlement.totalContractedAmount)}</p></div>
            <div><p className="text-gray-500">Đã giải ngân</p><p className="font-semibold">{fmtMoney(settlement.totalDisbursedAmount)}</p></div>
            <div><p className="text-gray-500">Hoàn trả</p><p className="font-semibold text-orange-600">{fmtMoney(settlement.totalReturnedAmount)}</p></div>
            {settlement.settlementDeadline && <div><p className="text-gray-500">Hạn thanh lý</p><p className="font-medium">{fmtDate(settlement.settlementDeadline)}</p></div>}
            {settlement.sideASigneeName && <div><p className="text-gray-500">Người ký Bên A</p><p className="font-medium">{settlement.sideASigneeName}</p></div>}
          </div>

          {settlement.productsSubmittedSummary && (
            <div className="border rounded-lg p-3 text-sm">
              <p className="font-medium text-gray-700 mb-1">Tóm tắt sản phẩm đã nộp</p>
              <p className="text-gray-600">{settlement.productsSubmittedSummary}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className={`border rounded-lg p-3 ${settlement.settlementSignedAt ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
              <p className="text-gray-500 text-xs">Ký thanh lý</p>
              <p className="font-medium mt-1">{settlement.settlementSignedAt ? fmtDate(settlement.settlementSignedAt) : '—'}</p>
            </div>
            <div className={`border rounded-lg p-3 ${settlement.accountingClearedAt ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
              <p className="text-gray-500 text-xs">Kế toán xác nhận</p>
              <p className="font-medium mt-1">{settlement.accountingClearedAt ? fmtDate(settlement.accountingClearedAt) : '—'}</p>
            </div>
            <div className={`border rounded-lg p-3 ${settlement.assetsClearedAt ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
              <p className="text-gray-500 text-xs">Tài sản xác nhận</p>
              <p className="font-medium mt-1">{settlement.assetsClearedAt ? fmtDate(settlement.assetsClearedAt) : '—'}</p>
            </div>
          </div>

          {isStaff && (
            <div className="border rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-gray-700">Hành động</p>
              {!settlement.settlementSignedAt && (
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">ID người ký Bên A (GUID)</label>
                    <Input type="text" className="mt-1 py-1.5 font-mono" value={signeeId} placeholder="xxxxxxxx-xxxx-..."
                      onChange={(e) => setSigneeId(e.target.value)} />
                  </div>
                  <Button variant="success" onClick={handleSign} className="py-2 whitespace-nowrap">Ký thanh lý</Button>
                </div>
              )}
              {(!settlement.accountingClearedAt || !settlement.assetsClearedAt) && (
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Ngày xác nhận</label>
                    <Input type="date" className="mt-1 py-1.5" value={clearedDate} onChange={(e) => setClearedDate(e.target.value)} />
                  </div>
                  {!settlement.accountingClearedAt && (
                    <Button onClick={handleAccountingCleared} className="py-2 whitespace-nowrap">Kế toán ✓</Button>
                  )}
                  {!settlement.assetsClearedAt && (
                    <Button onClick={handleAssetsCleared} className="py-2 whitespace-nowrap bg-purple-600 hover:bg-purple-700">Tài sản ✓</Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Tạo hồ sơ thanh lý</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Tổng HĐ (₫)</label>
                  <Input type="number" className="mt-1" value={createForm.totalContractedAmount}
                    onChange={(e) => setCreateForm({ ...createForm, totalContractedAmount: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Đã giải ngân (₫)</label>
                  <Input type="number" className="mt-1" value={createForm.totalDisbursedAmount}
                    onChange={(e) => setCreateForm({ ...createForm, totalDisbursedAmount: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Hoàn trả (₫)</label>
                  <Input type="number" className="mt-1" value={createForm.totalReturnedAmount}
                    onChange={(e) => setCreateForm({ ...createForm, totalReturnedAmount: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Tóm tắt sản phẩm đã nộp</label>
                <Textarea rows={2} className="mt-1" value={createForm.productsSubmittedSummary ?? ''}
                  onChange={(e) => setCreateForm({ ...createForm, productsSubmittedSummary: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Hạn thanh lý</label>
                <Input type="date" className="mt-1" value={createForm.settlementDeadline ?? ''}
                  onChange={(e) => setCreateForm({ ...createForm, settlementDeadline: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Ghi chú</label>
                <Textarea rows={2} className="mt-1" value={createForm.notes ?? ''}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
              <Button onClick={handleCreate}>Tạo hồ sơ</Button>
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
  const [tab, setTab] = useState<'disbursements' | 'deliverables' | 'amendments' | 'progress' | 'final' | 'settlement'>('disbursements')

  const tabs = [
    { id: 'disbursements' as const, label: 'Giải ngân' },
    { id: 'deliverables' as const, label: 'Sản phẩm' },
    { id: 'amendments' as const, label: 'Điều chỉnh' },
    { id: 'progress' as const, label: 'Báo cáo tiến độ' },
    { id: 'final' as const, label: 'Báo cáo tổng kết' },
    { id: 'settlement' as const, label: 'Thanh lý' },
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
          {tab === 'progress' && (
            <ProgressReportsTab contractId={contract.id} isStaff={isStaff} isPi={isPi} />
          )}
          {tab === 'final' && (
            <FinalReportTab contractId={contract.id} isStaff={isStaff} isPi={isPi} />
          )}
          {tab === 'settlement' && (
            <SettlementTab contractId={contract.id} isStaff={isStaff} />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function ContractManagement() {
  const { user, activeRole } = useAuth()
  const isStaff = activeRole === 'Staff' || activeRole === 'Admin'
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
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus size={14} /> Tạo hợp đồng
            </Button>
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
                <Input type="text" className="mt-1 font-mono" value={createForm.proposalId}
                  onChange={(e) => setCreateForm({ ...createForm, proposalId: e.target.value })}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Số hợp đồng</label>
                <Input type="text" className="mt-1" value={createForm.contractNumber}
                  onChange={(e) => setCreateForm({ ...createForm, contractNumber: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                  <Input type="date" className="mt-1" value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Ngày kết thúc</label>
                  <Input type="date" className="mt-1" value={createForm.endDate}
                    onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Số tháng gia hạn tối đa</label>
                <Input type="number" className="mt-1" value={createForm.maxExtensionMonths ?? 6}
                  onChange={(e) => setCreateForm({ ...createForm, maxExtensionMonths: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Đại diện bên A</label>
                <Input type="text" className="mt-1" value={createForm.sideARepresentative ?? ''}
                  onChange={(e) => setCreateForm({ ...createForm, sideARepresentative: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Hủy</Button>
              <Button onClick={handleCreate}>Tạo hợp đồng</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
