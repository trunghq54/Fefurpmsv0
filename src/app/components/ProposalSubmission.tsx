import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import {
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Home,
  List,
  LogOut,
  Plus,
  Trash2,
  Send,
  Undo2,
  Users,
  Wallet,
  FileText,
  X,
  BarChart3,
  Upload,
  Paperclip,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Eye,
  Pencil,
  FolderOpen,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import MyAcademicProfile from './MyAcademicProfile'
import { cycleService } from '../../services/cycleService'
import { proposalService } from '../../services/proposalService'
import { changeRequestService } from '../../services/changeRequestService'
import { roundService } from '../../services/roundService'
import { budgetExpenseCategoryService } from '../../services/masterDataService'
import type { BudgetExpenseCategoryResponse } from '../../types/masterData'
import { CHANGE_TYPE } from '../../types/changeRequest'
import type { ReviewRoundDto } from '../../types/review'
import ProposalDocuments from './ProposalDocuments'
import ProposalDocumentPreview from './ProposalDocumentPreview'
import ProposalDossierEditor from './ProposalDossierEditor'
import CycleSelection from './CycleSelection'
import ProposalWorkspace from './ProposalWorkspace'
import { Button, EmptyState } from './ui-kit'
import RoundResultsPanel from './RoundResultsPanel'
import RoleSwitcher from './RoleSwitcher'
import type { CycleDto } from '../../types/cycle'
import type {
  ProposalSummaryDto,
  ProposalDto,
  CreateMemberRequest,
  CreateBudgetItemRequest,
} from '../../types/proposal'

interface User {
  role: string
  name: string
}

interface ProposalSubmissionProps {
  user: User
  onLogout: () => void
}

const formatVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫'

const emptyMember: CreateMemberRequest = { fullName: '', email: '', department: '', role: '', workMonths: 0 }
const emptyBudget: CreateBudgetItemRequest = { category: '', amount: 0, note: '' }

// Key lưu nháp form đề tài trên trình duyệt (chống mất chữ khi F5 / load lại)
const DRAFT_KEY = 'furpms_proposal_draft'

// BE trả status CHỮ HOA (DRAFT, SUBMITTED, ...). Chuẩn hoá để khớp.
const statusColor = (status: string) => {
  const map: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SUBMITTED: 'bg-yellow-100 text-yellow-800',
    UNDER_REVIEW: 'bg-blue-100 text-blue-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    WITHDRAWN: 'bg-gray-100 text-gray-800',
  }
  return map[(status || '').toUpperCase()] || 'bg-gray-100 text-gray-800'
}

export default function ProposalSubmission({ user, onLogout }: ProposalSubmissionProps) {
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const [showSubmissions, setShowSubmissions] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  // Luồng mới: chọn đợt → workspace
  const [pickingCycle, setPickingCycle] = useState(false)
  const [selectedCycleId, setSelectedCycleId] = useState<number | undefined>(undefined)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)

  const [activeCycle, setActiveCycle] = useState<CycleDto | null>(null)
  const [loadingCycle, setLoadingCycle] = useState(true)
  const [budgetCategories, setBudgetCategories] = useState<BudgetExpenseCategoryResponse[]>([])

  const [titleVI, setTitleVI] = useState('')
  const [titleEN, setTitleEN] = useState('')
  const [trackId, setTrackId] = useState('')
  const [researchType, setResearchType] = useState<number>(1)
  const [durationMonths, setDurationMonths] = useState<number>(12)
  const [objectives, setObjectives] = useState('')
  const [methodology, setMethodology] = useState('')
  const [expectedOutput, setExpectedOutput] = useState('')
  const [members, setMembers] = useState<CreateMemberRequest[]>([{ ...emptyMember, role: 'Chủ nhiệm' }])
  const [budgetItems, setBudgetItems] = useState<CreateBudgetItemRequest[]>([{ ...emptyBudget }])

  const [pendingDocs, setPendingDocs] = useState<{ file: File; documentType: string }[]>([])
  const docFileRef = useRef<HTMLInputElement>(null)
  const [pendingDocType, setPendingDocType] = useState('Proposal')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [draftRestored, setDraftRestored] = useState(false)
  const hydratedRef = useRef(false)

  const [myProposals, setMyProposals] = useState<ProposalSummaryDto[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [rowBusy, setRowBusy] = useState<string | null>(null)

  // Chỉnh sửa đề xuất đã có (chỉ DRAFT). editingId != null => form ở chế độ sửa.
  const [editingId, setEditingId] = useState<string | null>(null)
  // Xem chi tiết (read-only) — mọi trạng thái
  const [viewProposal, setViewProposal] = useState<ProposalDto | null>(null)
  const [viewLoading, setViewLoading] = useState(false)

  // change-request modal
  const [crProposal, setCrProposal] = useState<ProposalSummaryDto | null>(null)
  const [crType, setCrType] = useState<number>(CHANGE_TYPE.ExtendTime)
  const [crDesc, setCrDesc] = useState('')
  const [crNewValue, setCrNewValue] = useState('')
  const [crBusy, setCrBusy] = useState(false)
  const [crMsg, setCrMsg] = useState('')

  // documents modal
  const [docProposal, setDocProposal] = useState<ProposalSummaryDto | null>(null)

  // hồ sơ Word/Excel (xem trước + tải) & soạn chi tiết
  const [previewProposal, setPreviewProposal] = useState<ProposalSummaryDto | null>(null)
  const [dossierProposal, setDossierProposal] = useState<ProposalSummaryDto | null>(null)

  // kết quả phản biện modal (PI xem điểm/phiếu các vòng của đề tài mình)
  const [resultsProposal, setResultsProposal] = useState<ProposalSummaryDto | null>(null)
  const [resultsRounds, setResultsRounds] = useState<ReviewRoundDto[]>([])
  const [resultsLoading, setResultsLoading] = useState(false)

  useEffect(() => {
    if (!resultsProposal) return
    setResultsLoading(true)
    roundService.getRounds(resultsProposal.id).then((res) => {
      if (res.success && res.data) setResultsRounds(res.data)
      setResultsLoading(false)
    })
  }, [resultsProposal])

  const ROUND_LABEL: Record<string, string> = {
    SCREENING: 'Sàng lọc',
    REVIEW: 'Xét duyệt',
    ACCEPTANCE: 'Nghiệm thu',
    ProposalReview: 'Xét duyệt',
    ProgressCheck: 'Kiểm tra tiến độ',
    Acceptance: 'Nghiệm thu',
  }

  const submitCr = async () => {
    if (!crProposal || !crDesc.trim()) {
      setCrMsg('Nhập mô tả')
      return
    }
    setCrBusy(true)
    setCrMsg('')
    try {
      const res = await changeRequestService.create(crProposal.id, {
        type: crType,
        description: crDesc,
        newValue: crType === CHANGE_TYPE.ExtendTime && crNewValue ? `${crNewValue}T00:00:00Z` : undefined,
      })
      if (res.success) {
        setCrMsg('Đã gửi yêu cầu')
        setTimeout(() => setCrProposal(null), 800)
      } else setCrMsg(res.message || 'Lỗi')
    } catch (e: any) {
      setCrMsg(e.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setCrBusy(false)
    }
  }

  useEffect(() => {
    cycleService.getActive().then((res) => {
      if (res.success && res.data) setActiveCycle(res.data)
      setLoadingCycle(false)
    })
    budgetExpenseCategoryService
      .getAll()
      .then((res) => {
        if (res.success && res.data) setBudgetCategories(res.data.filter((c) => c.isActive))
      })
      .catch(() => {})
  }, [])

  // Khôi phục bản nháp 1 lần khi mở form
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const d = JSON.parse(raw)
        if (d.titleVI) setTitleVI(d.titleVI)
        if (d.titleEN) setTitleEN(d.titleEN)
        if (d.trackId) setTrackId(d.trackId)
        if (d.researchType) setResearchType(d.researchType)
        if (d.durationMonths) setDurationMonths(d.durationMonths)
        if (d.objectives) setObjectives(d.objectives)
        if (d.methodology) setMethodology(d.methodology)
        if (d.expectedOutput) setExpectedOutput(d.expectedOutput)
        if (Array.isArray(d.members) && d.members.length) setMembers(d.members)
        if (Array.isArray(d.budgetItems) && d.budgetItems.length) setBudgetItems(d.budgetItems)
        if (d.currentStep) setCurrentStep(d.currentStep)
        setDraftRestored(true)
      }
    } catch {
      /* nháp hỏng -> bỏ qua */
    }
    hydratedRef.current = true
  }, [])

  // Tự lưu nháp khi gõ (sau khi đã hydrate, chỉ ở chế độ tạo mới, bỏ qua nháp rỗng)
  useEffect(() => {
    if (!hydratedRef.current || showSubmissions || editingId) return
    const isEmpty =
      !titleVI &&
      !titleEN &&
      !trackId &&
      !objectives &&
      !methodology &&
      !expectedOutput &&
      members.every((m) => !m.fullName?.trim()) &&
      budgetItems.every((b) => !b.category?.trim())
    if (isEmpty) return
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          titleVI,
          titleEN,
          trackId,
          researchType,
          durationMonths,
          objectives,
          methodology,
          expectedOutput,
          members,
          budgetItems,
          currentStep,
        }),
      )
    } catch {
      /* hết quota -> bỏ qua */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    titleVI,
    titleEN,
    trackId,
    researchType,
    durationMonths,
    objectives,
    methodology,
    expectedOutput,
    members,
    budgetItems,
    currentStep,
    showSubmissions,
  ])

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
    resetForm()
    setDraftRestored(false)
  }

  const loadMy = () => {
    setLoadingList(true)
    proposalService.getMy().then((res) => {
      if (res.success && res.data) setMyProposals(res.data)
      setLoadingList(false)
    })
  }

  useEffect(() => {
    if (showSubmissions) loadMy()
  }, [showSubmissions])

  const activeTracks = (activeCycle?.tracks || []).filter((t) => t.isActive)
  const fundingCap = researchType === 1 ? (activeCycle?.fundingCapApplied ?? 0) : (activeCycle?.fundingCapBasic ?? 0)
  const totalBudget = budgetItems.reduce((s, b) => s + (Number(b.amount) || 0), 0)
  const overCap = activeCycle != null && totalBudget > fundingCap

  const resetForm = () => {
    setTitleVI('')
    setTitleEN('')
    setTrackId('')
    setResearchType(1)
    setDurationMonths(12)
    setObjectives('')
    setMethodology('')
    setExpectedOutput('')
    setMembers([{ ...emptyMember, role: 'Chủ nhiệm' }])
    setBudgetItems([{ ...emptyBudget }])
    setPendingDocs([])
    setCurrentStep(1)
    setError('')
  }

  // Điền nhanh dữ liệu mẫu hợp lệ để test (chỉ ở chế độ tạo mới)
  const fillSample = () => {
    setTitleVI('Nghiên cứu ứng dụng trí tuệ nhân tạo trong quản lý đề tài nghiên cứu khoa học')
    setTitleEN('Applying Artificial Intelligence to Research Project Management')
    if (activeTracks[0]) setTrackId(activeTracks[0].id)
    setResearchType(1)
    setDurationMonths(12)
    setObjectives(
      '1. Khảo sát hiện trạng quy trình quản lý đề tài.\n2. Xây dựng mô hình hỗ trợ ra quyết định.\n3. Thử nghiệm và đánh giá trên dữ liệu thực tế.',
    )
    setMethodology(
      'Kết hợp nghiên cứu lý thuyết và thực nghiệm; thu thập dữ liệu thực tế; đánh giá bằng các chỉ số định lượng (precision, recall, F1).',
    )
    setExpectedOutput('01 bài báo hội nghị/tạp chí, 01 phần mềm demo, 01 báo cáo tổng kết.')
    setMembers([
      { fullName: 'Nguyễn Văn An', email: 'an.nv@fpt.edu.vn', department: 'SE', role: 'Chủ nhiệm', workMonths: 6 },
      { fullName: 'Trần Thị Bình', email: 'binh.tt@fpt.edu.vn', department: 'AI', role: 'TVC', workMonths: 4 },
    ])
    setBudgetItems([
      { category: budgetCategories[0]?.name || '', amount: 50000000, note: 'Thù lao nhóm nghiên cứu' },
      { category: budgetCategories[1]?.name || '', amount: 20000000, note: 'Nguyên vật liệu, vật tư' },
    ])
    setCurrentStep(1)
    setError('')
  }

  const validateStep = (step: number): string => {
    if (step === 1) {
      if (!titleVI.trim()) return 'Tên đề tài (VI) là bắt buộc'
      if (!trackId) return 'Vui lòng chọn Track'
      if (!durationMonths || durationMonths <= 0) return 'Thời gian thực hiện không hợp lệ'
    }
    if (step === 3 && overCap) return `Tổng kinh phí vượt hạn mức ${formatVnd(fundingCap)}`
    return ''
  }

  const handleNext = () => {
    const err = validateStep(currentStep)
    if (err) {
      setError(err)
      return
    }
    setError('')
    if (currentStep < 5) setCurrentStep(currentStep + 1)
  }

  // Đổ dữ liệu một ProposalDto vào form (dùng cho chế độ sửa)
  const fillForm = (p: ProposalDto) => {
    setTitleVI(p.titleVI || '')
    setTitleEN(p.titleEN || '')
    setTrackId(p.trackId || '')
    setResearchType(p.researchTypeId ?? (p.researchType === 'Applied' ? 1 : 2))
    setDurationMonths(p.durationMonths || 12)
    setObjectives(p.objectives || '')
    setMethodology(p.methodology || '')
    setExpectedOutput(p.expectedOutput || '')
    setMembers(
      p.members.length
        ? p.members.map((m) => ({
            fullName: m.fullName,
            email: m.email || '',
            department: m.department || '',
            role: m.role || '',
            workMonths: m.workMonths,
          }))
        : [{ ...emptyMember, role: 'Chủ nhiệm' }],
    )
    setBudgetItems(
      p.budgetItems.length
        ? p.budgetItems.map((b) => ({ category: b.category, amount: b.amount, note: b.note || '' }))
        : [{ ...emptyBudget }],
    )
    setPendingDocs([])
    setCurrentStep(1)
    setError('')
  }

  // Mở form ở chế độ sửa (chỉ DRAFT)
  const handleEdit = async (p: ProposalSummaryDto) => {
    setRowBusy(p.id)
    try {
      const res = await proposalService.getById(p.id)
      if (res.success && res.data) {
        fillForm(res.data)
        setEditingId(p.id)
        setShowSubmissions(false)
        setShowProfile(false)
        setDraftRestored(false)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setRowBusy(null)
    }
  }

  // Mở modal xem chi tiết (read-only, mọi trạng thái)
  const handleView = async (p: ProposalSummaryDto) => {
    setViewLoading(true)
    setViewProposal({ id: p.id } as ProposalDto)
    try {
      const res = await proposalService.getById(p.id)
      if (res.success && res.data) setViewProposal(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setViewLoading(false)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    resetForm()
    setShowSubmissions(true)
  }

  const handleSaveDraft = async () => {
    for (const s of [1, 3]) {
      const err = validateStep(s)
      if (err) {
        setError(err)
        setCurrentStep(s)
        return
      }
    }
    setSaving(true)
    setError('')
    const payload = {
      cycleId: selectedCycleId,
      trackId,
      titleVI,
      titleEN,
      researchType,
      durationMonths,
      objectives,
      methodology,
      expectedOutput,
      members: members.filter((m) => m.fullName.trim()),
      budgetItems: budgetItems.filter((b) => b.category.trim()),
    }
    try {
      // Chế độ sửa đề xuất đã có
      if (editingId) {
        const res = await proposalService.update(editingId, payload)
        if (res.success) {
          // Upload tài liệu mới (nếu có)
          const uploadErrors: string[] = []
          for (const { file, documentType } of pendingDocs) {
            try {
              const up = await proposalService.uploadDocument(editingId, file, documentType)
              if (!up.success) uploadErrors.push(`${file.name}: ${up.message || 'Lỗi tải lên'}`)
            } catch (e: any) {
              uploadErrors.push(`${file.name}: ${e.response?.data?.message || 'Lỗi tải lên'}`)
            }
          }
          setEditingId(null)
          resetForm()
          if (uploadErrors.length)
            setError(`Đã cập nhật, nhưng một số tài liệu chưa tải lên:\n${uploadErrors.join('\n')}`)
          setShowSubmissions(true)
        } else {
          setError(res.message || 'Cập nhật thất bại')
        }
        return
      }

      const res = await proposalService.create(payload)
      if (res.success && res.data) {
        const newId = res.data.id
        // Upload collected files sequentially
        const uploadErrors: string[] = []
        for (const { file, documentType } of pendingDocs) {
          try {
            const up = await proposalService.uploadDocument(newId, file, documentType)
            if (!up.success) uploadErrors.push(`${file.name}: ${up.message || 'Lỗi tải lên'}`)
          } catch (e: any) {
            uploadErrors.push(`${file.name}: ${e.response?.data?.message || 'Lỗi tải lên'}`)
          }
        }
        localStorage.removeItem(DRAFT_KEY)
        setDraftRestored(false)
        resetForm()
        // Sau khi tạo nháp → vào thẳng workspace để soạn chi tiết + tài liệu + nộp.
        setWorkspaceId(newId)
      } else {
        setError(res.message || 'Tạo đề xuất thất bại')
      }
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (id: string) => {
    setRowBusy(id)
    try {
      const res = await proposalService.submit(id)
      if (res.success && res.data) {
        setMyProposals((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: res.data!.status, submittedAt: res.data!.submittedAt } : p)),
        )
      }
    } catch (e) {
      console.error(e)
    } finally {
      setRowBusy(null)
    }
  }

  const handleWithdraw = async (id: string) => {
    setRowBusy(id)
    try {
      const res = await proposalService.withdraw(id)
      if (res.success && res.data) {
        setMyProposals((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: res.data!.status, submittedAt: undefined } : p)),
        )
      }
    } catch (e) {
      console.error(e)
    } finally {
      setRowBusy(null)
    }
  }

  const steps = [
    { number: 1, title: 'Thông tin', icon: FileText },
    { number: 2, title: 'Thành viên', icon: Users },
    { number: 3, title: 'Kinh phí', icon: Wallet },
    { number: 4, title: 'Tài liệu', icon: Paperclip },
    { number: 5, title: 'Xem lại', icon: CheckCircle },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">FURPMS</h1>
              <p className="text-sm text-gray-500">Faculty Portal</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/guide')}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <BookOpen className="w-4 h-4" /> Hướng dẫn
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSubmissions(true)
                  setPickingCycle(false)
                  setWorkspaceId(null)
                  setShowProfile(false)
                  setEditingId(null)
                }}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <List className="w-4 h-4" /> Đề xuất của tôi
              </Button>
              <Button
                onClick={() => {
                  setPickingCycle(true)
                  setShowSubmissions(false)
                  setWorkspaceId(null)
                  setShowProfile(false)
                  setEditingId(null)
                  resetForm()
                }}
              >
                <Plus className="w-4 h-4" /> Tạo đề tài mới
              </Button>
              <Button
                variant={showProfile ? 'primary' : 'outline'}
                onClick={() => {
                  setShowProfile(!showProfile)
                  setShowSubmissions(false)
                }}
                className={
                  showProfile
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'border-purple-300 text-purple-700 hover:bg-purple-50'
                }
              >
                <GraduationCap className="w-4 h-4" /> Hồ sơ KH
              </Button>
              <RoleSwitcher />
              <div className="border-l border-gray-300 pl-4">
                <p className="font-medium text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-500">Chủ nhiệm đề tài</p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Bạn có chắc muốn đăng xuất?')) onLogout()
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active cycle banner */}
      <div className={`border-l-4 ${activeCycle ? 'bg-blue-50 border-blue-400' : 'bg-yellow-50 border-yellow-400'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-start gap-3">
          <AlertCircle className={`w-5 h-5 mt-0.5 ${activeCycle ? 'text-blue-600' : 'text-yellow-600'}`} />
          <div>
            {loadingCycle ? (
              <p className="text-sm text-gray-600">Đang tải đợt nộp...</p>
            ) : activeCycle ? (
              <>
                <p className="font-medium text-blue-800">
                  Đợt đang mở: {activeCycle.name} ({activeCycle.academicYear})
                </p>
                <p className="text-sm text-blue-700">
                  Hạn nộp Quý I: {new Date(activeCycle.submissionEndDateApplied).toLocaleDateString('vi-VN')} · Hạn mức:
                  Applied {formatVnd(activeCycle.fundingCapApplied)} / Basic {formatVnd(activeCycle.fundingCapBasic)}
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-yellow-800">Hiện không có đợt nộp nào đang mở</p>
                <p className="text-sm text-yellow-700">
                  Bạn chưa thể tạo đề xuất mới. Vui lòng quay lại khi có đợt mở.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {workspaceId ? (
          <ProposalWorkspace
            proposalId={workspaceId}
            onBack={() => {
              setWorkspaceId(null)
              setShowSubmissions(true)
              loadMy()
            }}
            onChanged={loadMy}
          />
        ) : pickingCycle ? (
          <CycleSelection
            onSelect={(c) => {
              setSelectedCycleId(Number(c.id))
              setPickingCycle(false)
              resetForm()
              setShowSubmissions(false)
            }}
          />
        ) : showProfile && authUser ? (
          <MyAcademicProfile userId={authUser.id} />
        ) : (
          <>
            {!showSubmissions && draftRestored && (
              <div className="mb-6 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <p className="text-sm text-amber-800">
                  Đã khôi phục bản nháp bạn đang nhập dở (lưu tự động trên máy này).
                </p>
                <button
                  onClick={discardDraft}
                  className="text-sm font-medium text-amber-700 hover:text-amber-900 underline"
                >
                  Xoá nháp
                </button>
              </div>
            )}
            {showSubmissions ? (
              <MySubmissions
                proposals={myProposals}
                loading={loadingList}
                rowBusy={rowBusy}
                onOpen={(p) => setWorkspaceId(p.id)}
                onWithdraw={handleWithdraw}
                onChangeRequest={(p) => {
                  setCrProposal(p)
                  setCrType(CHANGE_TYPE.ExtendTime)
                  setCrDesc('')
                  setCrNewValue('')
                  setCrMsg('')
                }}
                onResults={(p) => {
                  setResultsProposal(p)
                  setResultsRounds([])
                }}
              />
            ) : !activeCycle && !loadingCycle && !editingId ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
                Không có đợt nộp đang mở.
              </div>
            ) : (
              <>
                {editingId && (
                  <div className="mb-6 flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
                    <p className="text-sm text-indigo-800">
                      Đang chỉnh sửa đề xuất <b>nháp</b>. Bấm "Cập nhật" ở bước cuối để lưu thay đổi.
                    </p>
                    <button
                      onClick={cancelEdit}
                      className="text-sm font-medium text-indigo-700 hover:text-indigo-900 underline"
                    >
                      Huỷ
                    </button>
                  </div>
                )}
                {!editingId && (
                  <div className="mb-6 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    <p className="text-sm text-amber-800">
                      Đang tạo đề xuất mới. Muốn test nhanh? Bấm nút bên để điền sẵn dữ liệu mẫu.
                    </p>
                    <Button variant="warning" size="sm" onClick={fillSample}>
                      <Plus className="w-4 h-4" /> Điền dữ liệu mẫu
                    </Button>
                  </div>
                )}
                {/* Progress */}
                <div className="mb-10 flex items-center justify-between">
                  {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold mb-2 transition ${
                            currentStep >= step.number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {currentStep > step.number ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <step.icon className="w-5 h-5" />
                          )}
                        </div>
                        <p className="font-medium text-gray-800 text-center text-sm">{step.title}</p>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`h-1 flex-1 mx-2 transition ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'}`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  {/* Step 1 */}
                  {currentStep === 1 && (
                    <div className="space-y-5">
                      <h2 className="text-xl font-semibold text-gray-800">Thông tin cơ bản</h2>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tên đề tài (Tiếng Việt) *
                        </label>
                        <input
                          value={titleVI}
                          onChange={(e) => setTitleVI(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên đề tài (Tiếng Anh)</label>
                        <input
                          value={titleEN}
                          onChange={(e) => setTitleEN(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Track *</label>
                          <select
                            value={trackId}
                            onChange={(e) => setTrackId(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value="">— Chọn track —</option>
                            {activeTracks.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Loại nghiên cứu *</label>
                          <select
                            value={researchType}
                            onChange={(e) => setResearchType(Number(e.target.value))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value={1}>Applied (Quý I)</option>
                            <option value={2}>Basic (Quý II)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian (tháng) *</label>
                          <input
                            type="number"
                            value={durationMonths}
                            onChange={(e) => setDurationMonths(Number(e.target.value))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mục tiêu</label>
                        <textarea
                          value={objectives}
                          onChange={(e) => setObjectives(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phương pháp nghiên cứu</label>
                        <textarea
                          value={methodology}
                          onChange={(e) => setMethodology(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sản phẩm dự kiến</label>
                        <textarea
                          value={expectedOutput}
                          onChange={(e) => setExpectedOutput(e.target.value)}
                          rows={2}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 2 — Members */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-800">Thành viên tham gia</h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setMembers([...members, { ...emptyMember }])}
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          <Plus className="w-4 h-4" /> Thêm thành viên
                        </Button>
                      </div>
                      {members.map((m, i) => (
                        <div
                          key={i}
                          className="grid md:grid-cols-12 gap-3 items-end border border-gray-200 rounded-lg p-4"
                        >
                          <div className="md:col-span-3">
                            <label className="block text-xs text-gray-500 mb-1">Họ tên</label>
                            <input
                              value={m.fullName}
                              onChange={(e) =>
                                setMembers(members.map((x, j) => (j === i ? { ...x, fullName: e.target.value } : x)))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-xs text-gray-500 mb-1">Email</label>
                            <input
                              value={m.email}
                              onChange={(e) =>
                                setMembers(members.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">Khoa</label>
                            <input
                              value={m.department}
                              onChange={(e) =>
                                setMembers(members.map((x, j) => (j === i ? { ...x, department: e.target.value } : x)))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">Vai trò</label>
                            <input
                              value={m.role}
                              onChange={(e) =>
                                setMembers(members.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="md:col-span-1">
                            <label className="block text-xs text-gray-500 mb-1">Tháng</label>
                            <input
                              type="number"
                              value={m.workMonths}
                              onChange={(e) =>
                                setMembers(
                                  members.map((x, j) => (j === i ? { ...x, workMonths: Number(e.target.value) } : x)),
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="md:col-span-1">
                            <button
                              onClick={() => setMembers(members.filter((_, j) => j !== i))}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {members.length === 0 && <p className="text-sm text-gray-400">Chưa có thành viên nào.</p>}
                    </div>
                  )}

                  {/* Step 3 — Budget */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-800">Dự toán kinh phí</h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setBudgetItems([...budgetItems, { ...emptyBudget }])}
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          <Plus className="w-4 h-4" /> Thêm khoản
                        </Button>
                      </div>
                      {budgetItems.map((b, i) => (
                        <div
                          key={i}
                          className="grid md:grid-cols-12 gap-3 items-end border border-gray-200 rounded-lg p-4"
                        >
                          <div className="md:col-span-4">
                            <label className="block text-xs text-gray-500 mb-1">Hạng mục</label>
                            <select
                              value={b.category}
                              onChange={(e) =>
                                setBudgetItems(
                                  budgetItems.map((x, j) => (j === i ? { ...x, category: e.target.value } : x)),
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">— Chọn hạng mục —</option>
                              {budgetCategories.map((c) => (
                                <option key={c.id} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                              {b.category && !budgetCategories.some((c) => c.name === b.category) && (
                                <option value={b.category}>{b.category}</option>
                              )}
                            </select>
                          </div>
                          <div className="md:col-span-3">
                            <label className="block text-xs text-gray-500 mb-1">Số tiền (₫)</label>
                            <input
                              type="number"
                              value={b.amount}
                              onChange={(e) =>
                                setBudgetItems(
                                  budgetItems.map((x, j) => (j === i ? { ...x, amount: Number(e.target.value) } : x)),
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="md:col-span-4">
                            <label className="block text-xs text-gray-500 mb-1">Ghi chú</label>
                            <input
                              value={b.note}
                              onChange={(e) =>
                                setBudgetItems(
                                  budgetItems.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)),
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="md:col-span-1">
                            <button
                              onClick={() => setBudgetItems(budgetItems.filter((_, j) => j !== i))}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <div
                        className={`flex items-center justify-between p-4 rounded-lg ${overCap ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}
                      >
                        <span className="font-medium text-gray-700">Tổng kinh phí</span>
                        <span className={`font-bold ${overCap ? 'text-red-600' : 'text-gray-800'}`}>
                          {formatVnd(totalBudget)} / hạn mức {formatVnd(fundingCap)}
                        </span>
                      </div>
                      {overCap && (
                        <p className="text-sm text-red-600">⚠️ Tổng kinh phí vượt hạn mức cho loại nghiên cứu này.</p>
                      )}
                    </div>
                  )}

                  {/* Step 4 — Documents */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800">Đính kèm tài liệu</h2>
                          <p className="text-sm text-gray-500 mt-0.5">
                            Tài liệu sẽ được tải lên ngay sau khi lưu đề xuất. Có thể thêm sau ở mục "Đề xuất của tôi".
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={pendingDocType}
                            onChange={(e) => setPendingDocType(e.target.value)}
                            className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Proposal">Thuyết minh</option>
                            <option value="CV">Lý lịch khoa học</option>
                            <option value="Other">Khác</option>
                          </select>
                          <Button type="button" size="sm" onClick={() => docFileRef.current?.click()}>
                            <Upload className="w-4 h-4" /> Chọn file
                          </Button>
                          <input
                            ref={docFileRef}
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) setPendingDocs((prev) => [...prev, { file, documentType: pendingDocType }])
                              if (docFileRef.current) docFileRef.current.value = ''
                            }}
                          />
                        </div>
                      </div>
                      {pendingDocs.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-sm text-gray-400">
                          Chưa có tài liệu. Có thể bỏ qua và tải lên sau.
                        </div>
                      ) : (
                        <div className="border border-gray-200 rounded-lg divide-y">
                          {pendingDocs.map((d, i) => (
                            <div key={i} className="px-4 py-2.5 flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-800">{d.file.name}</span>
                                <span className="text-gray-400">
                                  · {d.documentType} · {(d.file.size / 1024).toFixed(0)} KB
                                </span>
                              </div>
                              <button
                                onClick={() => setPendingDocs((prev) => prev.filter((_, j) => j !== i))}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 5 — Review */}
                  {currentStep === 5 && (
                    <div className="space-y-5">
                      <h2 className="text-xl font-semibold text-gray-800">Xem lại & lưu</h2>
                      <div className="bg-gray-50 rounded-lg p-6 space-y-3 text-sm">
                        <Row label="Tên đề tài (VI)" value={titleVI || '—'} />
                        <Row label="Tên đề tài (EN)" value={titleEN || '—'} />
                        <Row label="Track" value={activeTracks.find((t) => t.id === trackId)?.name || '—'} />
                        <Row label="Loại nghiên cứu" value={researchType === 1 ? 'Applied' : 'Basic'} />
                        <Row label="Thời gian" value={`${durationMonths} tháng`} />
                        <Row label="Số thành viên" value={String(members.filter((m) => m.fullName.trim()).length)} />
                        <Row
                          label="Tổng kinh phí"
                          value={`${formatVnd(totalBudget)} / hạn mức ${formatVnd(fundingCap)}`}
                        />
                        <Row
                          label="Tài liệu đính kèm"
                          value={pendingDocs.length ? `${pendingDocs.length} file` : 'Không có'}
                        />
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <p className="text-sm text-green-700">
                          {editingId ? (
                            <>
                              Thay đổi sẽ được lưu vào đề xuất <b>nháp</b> hiện tại.
                            </>
                          ) : (
                            <>
                              Đề xuất sẽ được lưu ở trạng thái <b>Nháp</b>. Bạn có thể gửi duyệt sau ở mục "Đề xuất của
                              tôi".
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mt-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  {/* Nav buttons */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        setError('')
                        if (currentStep > 1) setCurrentStep(currentStep - 1)
                      }}
                      disabled={currentStep === 1}
                    >
                      <ArrowLeft className="w-4 h-4" /> Trước
                    </Button>
                    {currentStep < 5 ? (
                      <Button size="lg" onClick={handleNext}>
                        Tiếp <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button variant="success" size="lg" onClick={handleSaveDraft} disabled={saving || overCap}>
                        <CheckCircle className="w-4 h-4" />{' '}
                        {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Lưu nháp'}
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Xem chi tiết đề xuất (read-only) */}
      {viewProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-800">Chi tiết đề xuất</h3>
              <button onClick={() => setViewProposal(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {viewLoading || !viewProposal.titleVI ? (
                <p className="text-sm text-gray-400">Đang tải...</p>
              ) : (
                <>
                  <div className="bg-gray-50 rounded-lg p-5 space-y-2 text-sm">
                    <Row label="Tên đề tài (VI)" value={viewProposal.titleVI || '—'} />
                    <Row label="Tên đề tài (EN)" value={viewProposal.titleEN || '—'} />
                    <Row label="Track" value={viewProposal.trackName || '—'} />
                    <Row
                      label="Loại nghiên cứu"
                      value={viewProposal.researchType === 'Applied' ? 'Ứng dụng' : 'Cơ bản'}
                    />
                    <Row label="Trạng thái" value={viewProposal.status} />
                    <Row label="Thời gian thực hiện" value={`${viewProposal.durationMonths} tháng`} />
                    <Row label="Tổng kinh phí" value={formatVnd(viewProposal.totalBudget)} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Mục tiêu nghiên cứu</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
                      {viewProposal.objectives || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Phương pháp / nội dung</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-3">
                      {viewProposal.methodology || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Thành viên ({viewProposal.members.length})
                    </p>
                    {viewProposal.members.length === 0 ? (
                      <p className="text-sm text-gray-400">Chưa có thành viên.</p>
                    ) : (
                      <div className="space-y-2">
                        {viewProposal.members.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm"
                          >
                            <span className="text-gray-800">
                              {m.fullName} {m.role && <span className="text-gray-400">· {m.role}</span>}
                              {m.department && <span className="text-gray-400"> · {m.department}</span>}
                              {m.email && <span className="text-gray-400"> · {m.email}</span>}
                            </span>
                            <span className="text-gray-500">{m.workMonths} tháng công</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Dự toán kinh phí</p>
                    {viewProposal.budgetItems.length === 0 ? (
                      <p className="text-sm text-gray-400">Chưa có khoản kinh phí.</p>
                    ) : (
                      <div className="space-y-2">
                        {viewProposal.budgetItems.map((b) => (
                          <div
                            key={b.id}
                            className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm"
                          >
                            <span className="text-gray-800">
                              {b.category}
                              {b.note && <span className="text-gray-400"> · {b.note}</span>}
                            </span>
                            <span className="text-gray-700 font-medium">{formatVnd(b.amount)}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-800 border-t border-gray-200">
                          <span>Tổng cộng</span>
                          <span>{formatVnd(viewProposal.totalBudget)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {viewProposal.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                      <b>Lý do từ chối:</b> {viewProposal.rejectionReason}
                    </div>
                  )}
                  {viewProposal.status === 'DRAFT' && (
                    <div className="pt-2 flex justify-end">
                      <Button
                        variant="success"
                        onClick={() => {
                          const p = viewProposal
                          setViewProposal(null)
                          handleEdit({ id: p.id } as ProposalSummaryDto)
                        }}
                      >
                        <Pencil className="w-4 h-4" /> Chỉnh sửa đề xuất này
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Documents modal */}
      {docProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Tài liệu — {docProposal.titleVI}</h3>
              <button onClick={() => setDocProposal(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <ProposalDocuments proposalId={docProposal.id} />
            </div>
          </div>
        </div>
      )}

      {/* Hồ sơ Word/Excel — xem trước + tải */}
      {previewProposal && (
        <ProposalDocumentPreview
          proposalId={previewProposal.id}
          title={previewProposal.titleVI}
          onClose={() => setPreviewProposal(null)}
        />
      )}

      {/* Soạn chi tiết hồ sơ */}
      {dossierProposal && (
        <ProposalDossierEditor
          proposalId={dossierProposal.id}
          title={dossierProposal.titleVI}
          onClose={() => setDossierProposal(null)}
        />
      )}

      {/* Kết quả phản biện modal (PI) */}
      {resultsProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-800">Kết quả phản biện — {resultsProposal.titleVI}</h3>
              <button onClick={() => setResultsProposal(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {resultsLoading ? (
                <p className="text-sm text-gray-400">Đang tải...</p>
              ) : resultsRounds.length === 0 ? (
                <p className="text-sm text-gray-400">Đề tài chưa có vòng phản biện nào.</p>
              ) : (
                resultsRounds.map((r) => (
                  <div key={r.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">
                        {ROUND_LABEL[r.roundType] || r.roundType} · Vòng {r.roundNumber}
                      </span>
                      <div className="flex items-center gap-2">
                        {(r.status === 'PASSED' || r.status === 'FAILED') && r.result && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${r.result === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                          >
                            {r.result === 'APPROVED' ? 'Đạt' : r.result === 'REJECTED' ? 'Từ chối' : r.result}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">{r.status}</span>
                      </div>
                    </div>
                    <RoundResultsPanel roundId={r.id} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Change request modal */}
      {crProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Yêu cầu thay đổi</h3>
              <button onClick={() => setCrProposal(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">
                Đề tài: <b className="text-gray-800">{crProposal.titleVI}</b>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại yêu cầu</label>
                <select
                  value={crType}
                  onChange={(e) => setCrType(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={CHANGE_TYPE.ExtendTime}>Gia hạn thời gian</option>
                  <option value={CHANGE_TYPE.ContentChange}>Thay đổi nội dung</option>
                  <option value={CHANGE_TYPE.PersonnelChange}>Thay đổi nhân sự</option>
                  <option value={CHANGE_TYPE.BudgetChange}>Thay đổi kinh phí</option>
                  <option value={CHANGE_TYPE.Suspend}>Tạm dừng</option>
                </select>
              </div>
              {crType === CHANGE_TYPE.ExtendTime && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc mới</label>
                  <input
                    type="date"
                    value={crNewValue}
                    onChange={(e) => setCrNewValue(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả / lý do *</label>
                <textarea
                  value={crDesc}
                  onChange={(e) => setCrDesc(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {crMsg && <div className="text-sm text-blue-600">{crMsg}</div>}
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCrProposal(null)}>
                Hủy
              </Button>
              <Button onClick={submitCr} disabled={crBusy}>
                {crBusy ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800 text-right">{value}</span>
    </div>
  )
}

interface MySubmissionsProps {
  proposals: ProposalSummaryDto[]
  loading: boolean
  rowBusy: string | null
  onOpen: (p: ProposalSummaryDto) => void
  onWithdraw: (id: string) => void
  onChangeRequest: (p: ProposalSummaryDto) => void
  onResults: (p: ProposalSummaryDto) => void
}

function MySubmissions({
  proposals,
  loading,
  rowBusy,
  onOpen,
  onWithdraw,
  onChangeRequest,
  onResults,
}: MySubmissionsProps) {
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Đề xuất của tôi</h2>
          <p className="text-gray-500 mt-1">Theo dõi và gửi duyệt các đề xuất nghiên cứu</p>
        </div>
        <Button onClick={() => navigate('/contracts')} className="bg-indigo-600 hover:bg-indigo-700">
          <ClipboardList className="w-4 h-4" /> Hợp đồng & Báo cáo
        </Button>
      </div>

      {loading ? (
        <EmptyState>Đang tải...</EmptyState>
      ) : proposals.length === 0 ? (
        <EmptyState>Chưa có đề xuất nào. Bấm "Tạo đề xuất mới" để bắt đầu.</EmptyState>
      ) : (
        <div className="grid gap-4">
          {proposals.map((p) => (
            <div key={p.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{p.titleVI}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                    <span className="px-2 py-0.5 bg-gray-100 rounded">{p.researchType}</span>
                    <span>Track: {p.trackName || '—'}</span>
                    <span>•</span>
                    <span>{formatVnd(p.totalBudget)}</span>
                    <span>•</span>
                    <span>Tạo: {new Date(p.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(p.status)}`}>
                    {p.status}
                  </span>
                  <Button size="sm" onClick={() => onOpen(p)} disabled={rowBusy === p.id}>
                    <FolderOpen className="w-4 h-4" /> Mở
                  </Button>
                  {p.status === 'SUBMITTED' && (
                    <Button variant="outline" size="sm" onClick={() => onWithdraw(p.id)} disabled={rowBusy === p.id}>
                      <Undo2 className="w-4 h-4" /> Rút lại
                    </Button>
                  )}
                  {p.status !== 'DRAFT' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onResults(p)}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <BarChart3 className="w-4 h-4" /> Kết quả
                    </Button>
                  )}
                  {p.status !== 'DRAFT' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onChangeRequest(p)}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <FileText className="w-4 h-4" /> Yêu cầu thay đổi
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
