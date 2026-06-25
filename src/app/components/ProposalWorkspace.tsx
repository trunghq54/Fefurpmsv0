import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  Users,
  ListChecks,
  FileSpreadsheet,
  Send,
  Save,
  CheckCircle,
  Plus,
  AlertTriangle,
} from 'lucide-react'
import { proposalService } from '../../services/proposalService'
import type { ProposalDto, CreateProposalRequest } from '../../types/proposal'
import { cycleService } from '../../services/cycleService'
import type { TrackDto } from '../../types/cycle'
import { teamMemberService } from '../../services/teamMemberService'
import type { TeamMemberResponse } from '../../types/budget'
import ProposalDossierEditor from './ProposalDossierEditor'
import ProposalDocumentPreview from './ProposalDocumentPreview'
import { Button, Card, Badge, Input, Textarea, Select, Label, Spinner } from './ui-kit'

type Section = 'info' | 'members' | 'detail' | 'documents'
const ROLE_CODES = [
  { code: 'CNNV', label: 'Chủ nhiệm' },
  { code: 'TKKH', label: 'Thư ký khoa học' },
  { code: 'TVC', label: 'Thành viên chính' },
  { code: 'TV', label: 'Thành viên' },
  { code: 'KTV', label: 'Kỹ thuật viên' },
]
const statusTone = (s: string): 'gray' | 'yellow' | 'green' | 'red' =>
  (({ DRAFT: 'gray', SUBMITTED: 'yellow', APPROVED: 'green', REJECTED: 'red' }) as const)[
    s?.toUpperCase() as 'DRAFT'
  ] || 'gray'

// Không gian làm 1 đề tài (full-page, không popup): thông tin → thành viên → chi tiết → tài liệu → nộp.
export default function ProposalWorkspace({
  proposalId,
  onBack,
  onChanged,
}: {
  proposalId: string
  onBack: () => void
  onChanged?: () => void
}) {
  const [p, setP] = useState<ProposalDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState<Section>('info')
  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')

  const load = () =>
    proposalService.getById(proposalId).then((r) => {
      if (r.success && r.data) setP(r.data)
      setLoading(false)
    })
  useEffect(() => {
    load()
  }, [proposalId])

  const isDraft = p?.status?.toUpperCase() === 'DRAFT'

  const submit = async (confirmCv = false) => {
    setSubmitting(true)
    setSubmitMsg('')
    try {
      const res = await proposalService.submit(proposalId, confirmCv)
      if (res.success) {
        setSubmitMsg('OK')
        onChanged?.()
        load()
      } else setSubmitMsg(res.message || 'Nộp thất bại')
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Có lỗi khi nộp'
      // Nhắc cập nhật CV: BE trả 409 khi CV thiếu/cũ → cho PI xác nhận rồi nộp lại.
      if (!confirmCv && /CV|lý lịch/i.test(msg)) {
        setSubmitting(false)
        if (window.confirm(`${msg}\n\nBạn xác nhận lý lịch khoa học vẫn đúng và muốn nộp?`)) {
          await submit(true)
        }
        return
      }
      setSubmitMsg(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !p) return <Spinner text="Đang tải đề tài..." className="py-20" />

  const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: 'info', label: 'Thông tin chung', icon: <FileText className="w-4 h-4" /> },
    { id: 'members', label: 'Thành viên', icon: <Users className="w-4 h-4" /> },
    { id: 'detail', label: 'Nội dung & kinh phí', icon: <ListChecks className="w-4 h-4" /> },
    { id: 'documents', label: 'Tài liệu (Word/Excel)', icon: <FileSpreadsheet className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" /> Danh sách
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{p.titleVI || '(Chưa có tên)'}</h2>
            <Badge tone={statusTone(p.status)} className="mt-0.5">
              {p.status}
            </Badge>
          </div>
        </div>
        {isDraft && (
          <Button variant="success" size="lg" onClick={() => submit()} disabled={submitting}>
            {submitMsg === 'OK' ? <CheckCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            {submitMsg === 'OK' ? 'Đã nộp' : submitting ? 'Đang nộp...' : 'Nộp duyệt'}
          </Button>
        )}
      </div>
      {submitMsg && submitMsg !== 'OK' && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {submitMsg}
        </div>
      )}

      <div className="flex gap-4">
        {/* Section nav */}
        <div className="w-56 shrink-0 space-y-1">
          {navItems.map((n) => (
            <button
              key={n.id}
              onClick={() => setSection(n.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-left transition ${
                section === n.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {n.icon} {n.label}
            </button>
          ))}
        </div>

        {/* Section content */}
        <div className="flex-1 min-w-0">
          {section === 'info' && <InfoSection proposal={p} onSaved={load} />}
          {section === 'members' && <MembersSection proposalId={proposalId} canEdit={isDraft} />}
          {section === 'detail' && <ProposalDossierEditor proposalId={proposalId} embedded />}
          {section === 'documents' && <ProposalDocumentPreview proposalId={proposalId} embedded />}
        </div>
      </div>
    </div>
  )
}

// ── Thông tin chung (core + Mẫu 1) ─────────────────────────────────────────
function InfoSection({ proposal, onSaved }: { proposal: ProposalDto; onSaved: () => void }) {
  const [f, setF] = useState({
    titleVI: proposal.titleVI || '',
    titleEN: proposal.titleEN || '',
    trackId: proposal.trackId || '',
    researchType: proposal.researchTypeId ?? (proposal.researchType === 'Applied' ? 1 : 2),
    durationMonths: proposal.durationMonths || 12,
    objectives: proposal.objectives || '',
    methodology: proposal.methodology || '',
    expectedOutput: proposal.expectedOutput || '',
    abstractEN: proposal.abstractEN || '',
    urgency: proposal.urgency || '',
    novelty: proposal.novelty || '',
    applicationPotential: proposal.applicationPotential || '',
    transferPotential: proposal.transferPotential || '',
    facilities: proposal.facilities || '',
    fundingMethod: proposal.fundingMethod || 'PARTIAL',
  })
  const [tracks, setTracks] = useState<TrackDto[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')
  useEffect(() => {
    cycleService.getTracks().then((r) => {
      if (r.success && r.data) setTracks(r.data.filter((t) => t.isActive))
    })
  }, [])
  const set = (k: keyof typeof f, v: any) => setF((s) => ({ ...s, [k]: v }))

  const save = async () => {
    setSaving(true)
    setSaved(false)
    setErr('')
    try {
      const payload: CreateProposalRequest = {
        trackId: f.trackId,
        titleVI: f.titleVI,
        titleEN: f.titleEN,
        researchType: f.researchType,
        durationMonths: f.durationMonths,
        objectives: f.objectives,
        methodology: f.methodology,
        expectedOutput: f.expectedOutput,
        abstractEN: f.abstractEN,
        urgency: f.urgency,
        novelty: f.novelty,
        applicationPotential: f.applicationPotential,
        transferPotential: f.transferPotential,
        facilities: f.facilities,
        fundingMethod: f.fundingMethod,
        members: [],
        budgetItems: [], // rỗng → BE giữ nguyên members/budget (chỉ lưu thông tin lõi)
      }
      const res = await proposalService.update(proposal.id, payload)
      if (res.success) {
        setSaved(true)
        onSaved()
        setTimeout(() => setSaved(false), 2000)
      } else setErr(res.message || 'Lưu thất bại')
    } catch (e: any) {
      setErr(e?.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label>Tên đề tài (Tiếng Việt) *</Label>
          <Input value={f.titleVI} onChange={(e) => set('titleVI', e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label>Tên đề tài (Tiếng Anh)</Label>
          <Input value={f.titleEN} onChange={(e) => set('titleEN', e.target.value)} />
        </div>
        <div>
          <Label>Track *</Label>
          <Select value={f.trackId} onChange={(e) => set('trackId', e.target.value)}>
            <option value="">— Chọn track —</option>
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Loại nghiên cứu *</Label>
          <Select value={f.researchType} onChange={(e) => set('researchType', Number(e.target.value))}>
            <option value={1}>Ứng dụng</option>
            <option value={2}>Cơ bản</option>
          </Select>
        </div>
        <div>
          <Label>Thời gian (tháng) *</Label>
          <Input
            type="number"
            min={1}
            value={f.durationMonths}
            onChange={(e) => set('durationMonths', Number(e.target.value))}
          />
        </div>
        <div>
          <Label>Phương thức khoán chi</Label>
          <Select value={f.fundingMethod} onChange={(e) => set('fundingMethod', e.target.value)}>
            <option value="PARTIAL">Khoán từng phần</option>
            <option value="WHOLE">Khoán đến sản phẩm cuối</option>
          </Select>
        </div>
      </div>
      <Field label="Mục tiêu nghiên cứu" value={f.objectives} onChange={(v) => set('objectives', v)} />
      <Field label="Phương pháp / nội dung tổng quát" value={f.methodology} onChange={(v) => set('methodology', v)} />
      <Field label="Sản phẩm dự kiến (tóm tắt)" value={f.expectedOutput} onChange={(v) => set('expectedOutput', v)} />

      <div className="pt-2 border-t border-gray-100">
        <p className="text-sm font-semibold text-gray-700 mb-3">Thuyết minh chi tiết (Mẫu 1)</p>
        <div className="space-y-4">
          <Field label="Tổng quan, tính cấp thiết" value={f.urgency} onChange={(v) => set('urgency', v)} />
          <Field label="Tính mới, tính sáng tạo" value={f.novelty} onChange={(v) => set('novelty', v)} />
          <Field
            label="Khả năng ứng dụng"
            value={f.applicationPotential}
            onChange={(v) => set('applicationPotential', v)}
          />
          <Field
            label="Khả năng chuyển giao"
            value={f.transferPotential}
            onChange={(v) => set('transferPotential', v)}
          />
          <Field label="Cơ sở vật chất, trang thiết bị" value={f.facilities} onChange={(v) => set('facilities', v)} />
          <Field label="Tóm tắt tiếng Anh (Abstract)" value={f.abstractEN} onChange={(v) => set('abstractEN', v)} />
        </div>
      </div>

      {err && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">{err}</div>}
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}{' '}
          {saved ? 'Đã lưu' : saving ? 'Đang lưu...' : 'Lưu thông tin'}
        </Button>
      </div>
    </Card>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <Textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

// ── Thành viên ─────────────────────────────────────────────────────────────
function MembersSection({ proposalId, canEdit }: { proposalId: string; canEdit: boolean }) {
  const [members, setMembers] = useState<TeamMemberResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [n, setN] = useState({
    academicTitle: '',
    fullName: '',
    memberRoleCode: 'TVC',
    isSecretary: false,
    unitName: '',
    workContent: '',
    workMonths: 0,
  })
  const [busy, setBusy] = useState(false)

  const load = () =>
    teamMemberService.getTeamMembers(proposalId).then((r) => {
      if (r.success && r.data) setMembers(r.data)
      setLoading(false)
    })
  useEffect(() => {
    load()
  }, [proposalId])

  const add = async () => {
    if (!n.fullName.trim()) return
    setBusy(true)
    try {
      await teamMemberService.addTeamMember(proposalId, {
        fullName: n.fullName,
        academicTitle: n.academicTitle || undefined,
        unitName: n.unitName || undefined,
        workContent: n.workContent || n.fullName,
        workMonths: n.workMonths,
        isPi: false,
        isSecretary: n.isSecretary,
        memberRoleCode: n.memberRoleCode,
      })
      setN({
        academicTitle: '',
        fullName: '',
        memberRoleCode: 'TVC',
        isSecretary: false,
        unitName: '',
        workContent: '',
        workMonths: 0,
      })
      load()
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Spinner />
  return (
    <div className="space-y-4">
      <Card className="divide-y">
        {members.length === 0 && <div className="px-4 py-6 text-center text-gray-400 text-sm">Chưa có thành viên.</div>}
        {members.map((m) => (
          <div key={m.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div className="text-gray-800">
              {m.academicTitle ? `${m.academicTitle}. ` : ''}
              {m.fullName}
              <span className="text-gray-400">
                {' '}
                ·{' '}
                {m.isSecretary
                  ? 'Thư ký'
                  : ROLE_CODES.find((r) => r.code === m.memberRoleCode)?.label || m.memberRoleCode || 'Thành viên'}
              </span>
              {m.unitName && <span className="text-gray-400"> · {m.unitName}</span>}
            </div>
            <span className="text-gray-500">{m.workMonths} tháng</span>
          </div>
        ))}
      </Card>
      {canEdit && (
        <Card className="p-4 grid md:grid-cols-12 gap-2 items-end">
          <div className="md:col-span-2">
            <Label>Học hàm</Label>
            <Input
              value={n.academicTitle}
              onChange={(e) => setN({ ...n, academicTitle: e.target.value })}
              placeholder="GS.TS"
            />
          </div>
          <div className="md:col-span-3">
            <Label>Họ tên *</Label>
            <Input value={n.fullName} onChange={(e) => setN({ ...n, fullName: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>Vai trò</Label>
            <Select value={n.memberRoleCode} onChange={(e) => setN({ ...n, memberRoleCode: e.target.value })}>
              {ROLE_CODES.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Đơn vị</Label>
            <Input value={n.unitName} onChange={(e) => setN({ ...n, unitName: e.target.value })} />
          </div>
          <div className="md:col-span-1">
            <Label>Tháng</Label>
            <Input
              type="number"
              min={0}
              value={n.workMonths}
              onChange={(e) => setN({ ...n, workMonths: Number(e.target.value) })}
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <label className="flex items-center gap-1 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={n.isSecretary}
                onChange={(e) => setN({ ...n, isSecretary: e.target.checked })}
              />{' '}
              Thư ký
            </label>
            <Button size="sm" onClick={add} disabled={busy || !n.fullName.trim()}>
              <Plus className="w-4 h-4" /> Thêm
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
