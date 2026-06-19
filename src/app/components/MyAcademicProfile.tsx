import { useState, useEffect } from 'react'
import { Save, GraduationCap, BookOpen, Users, CheckCircle } from 'lucide-react'
import { academicProfileService } from '../../services/academicProfileService'
import type { AcademicProfileRequest } from '../../services/academicProfileService'
import { Button, Input, Select, Textarea } from './ui-kit'

const DEGREE_OPTIONS = ['Cử nhân', 'Thạc sĩ', 'Tiến sĩ', 'PGS.TS', 'GS.TS']
const GENDER_OPTIONS = ['Nam', 'Nữ', 'Khác']
const TITLE_OPTIONS = ['ThS', 'TS', 'PGS', 'GS', 'ThS-NCS']
const RANK_OPTIONS = ['', 'Giảng viên', 'Giảng viên chính', 'Giảng viên cao cấp', 'Nhà nghiên cứu']

const emptyForm: AcademicProfileRequest = {
  academicTitle: '',
  scientificRank: '',
  degreeLevel: '',
  specialization: '',
  dateOfBirth: '',
  gender: '',
  hometown: '',
  nationality: 'Việt Nam',
  gsPgsYear: undefined,
  gsPgsInstitution: '',
  isiScopusCount: 0,
  intlJournalCount: 0,
  domesticJournalCount: 0,
  intlConferenceCount: 0,
  domesticConferenceCount: 0,
  patentsCount: 0,
  phdSupervisedCount: 0,
  masterSupervisedCount: 0,
  institution: '',
  institutionAddress: '',
  specializationAreas: '',
}

interface Field {
  label: string
  key: keyof AcademicProfileRequest
  type?: string
  options?: string[]
}

export default function MyAcademicProfile({ userId }: { userId: string }) {
  const [form, setForm] = useState<AcademicProfileRequest>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    academicProfileService
      .get(userId)
      .then((res) => {
        if (res.success && res.data) {
          const p = res.data
          setForm({
            academicTitle: p.academicTitle ?? '',
            scientificRank: p.scientificRank ?? '',
            degreeLevel: p.degreeLevel ?? '',
            specialization: p.specialization ?? '',
            dateOfBirth: p.dateOfBirth ?? '',
            gender: p.gender ?? '',
            hometown: p.hometown ?? '',
            nationality: p.nationality ?? 'Việt Nam',
            gsPgsYear: p.gsPgsYear ?? undefined,
            gsPgsInstitution: p.gsPgsInstitution ?? '',
            isiScopusCount: p.isiScopusCount,
            intlJournalCount: p.intlJournalCount,
            domesticJournalCount: p.domesticJournalCount,
            intlConferenceCount: p.intlConferenceCount,
            domesticConferenceCount: p.domesticConferenceCount,
            patentsCount: p.patentsCount,
            phdSupervisedCount: p.phdSupervisedCount,
            masterSupervisedCount: p.masterSupervisedCount,
            institution: p.institution ?? '',
            institutionAddress: p.institutionAddress ?? '',
            specializationAreas: p.specializationAreas ?? '',
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [userId])

  const set = (key: keyof AcademicProfileRequest, value: string | number | undefined) =>
    setForm((f) => ({ ...f, [key]: value }))

  const save = async () => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await academicProfileService.upsert(userId, form)
      if (res.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      } else setError(res.message || 'Lưu thất bại')
    } catch (e: any) {
      setError(e.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Đang tải hồ sơ...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Hồ sơ khoa học</h2>
          <p className="text-gray-500 mt-1">Thông tin học hàm, học vị và công trình nghiên cứu của bạn</p>
        </div>
        <Button onClick={save} disabled={saving} className="px-5">
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Đã lưu!' : saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Personal info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-4">
          <GraduationCap className="w-5 h-5 text-blue-600" /> Thông tin cá nhân & học vị
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Danh hiệu KH"
            options={['', ...TITLE_OPTIONS]}
            value={form.academicTitle ?? ''}
            onChange={(v) => set('academicTitle', v)}
          />
          <SelectField
            label="Chức danh"
            options={RANK_OPTIONS}
            value={form.scientificRank ?? ''}
            onChange={(v) => set('scientificRank', v)}
          />
          <SelectField
            label="Trình độ"
            options={['', ...DEGREE_OPTIONS]}
            value={form.degreeLevel ?? ''}
            onChange={(v) => set('degreeLevel', v)}
          />
          <InputField
            label="Chuyên ngành"
            value={form.specialization ?? ''}
            onChange={(v) => set('specialization', v)}
            placeholder="VD: Công nghệ thông tin"
          />
          <InputField
            label="Ngày sinh"
            type="date"
            value={form.dateOfBirth ?? ''}
            onChange={(v) => set('dateOfBirth', v)}
          />
          <SelectField
            label="Giới tính"
            options={['', ...GENDER_OPTIONS]}
            value={form.gender ?? ''}
            onChange={(v) => set('gender', v)}
          />
          <InputField
            label="Quê quán"
            value={form.hometown ?? ''}
            onChange={(v) => set('hometown', v)}
            placeholder="VD: Hà Nội"
          />
          <InputField
            label="Quốc tịch"
            value={form.nationality ?? ''}
            onChange={(v) => set('nationality', v)}
            placeholder="Việt Nam"
          />
        </div>
      </div>

      {/* GS/PGS info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-4">
          <BookOpen className="w-5 h-5 text-blue-600" /> Công nhận GS/PGS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Năm công nhận"
            type="number"
            value={String(form.gsPgsYear ?? '')}
            onChange={(v) => set('gsPgsYear', v ? Number(v) : undefined)}
            placeholder="VD: 2020"
          />
          <InputField
            label="Cơ sở công nhận"
            value={form.gsPgsInstitution ?? ''}
            onChange={(v) => set('gsPgsInstitution', v)}
            placeholder="VD: Hội đồng CDGSNN"
          />
          <InputField
            label="Đơn vị công tác"
            value={form.institution ?? ''}
            onChange={(v) => set('institution', v)}
            placeholder="VD: ĐH FPT"
            className="md:col-span-2"
          />
          <InputField
            label="Địa chỉ đơn vị"
            value={form.institutionAddress ?? ''}
            onChange={(v) => set('institutionAddress', v)}
            placeholder="VD: Khu CNC Hòa Lạc, Thạch Thất, HN"
            className="md:col-span-2"
          />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lĩnh vực chuyên môn</label>
            <Textarea
              rows={2}
              value={form.specializationAreas ?? ''}
              onChange={(e) => set('specializationAreas', e.target.value)}
              placeholder="VD: Trí tuệ nhân tạo, Học máy, Xử lý ngôn ngữ tự nhiên"
              className="resize-none"
            />
          </div>
        </div>
      </div>

      {/* Publication counts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-4">
          <BookOpen className="w-5 h-5 text-blue-600" /> Công trình khoa học
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CountField label="ISI/Scopus" value={form.isiScopusCount} onChange={(v) => set('isiScopusCount', v)} />
          <CountField label="Tạp chí QT" value={form.intlJournalCount} onChange={(v) => set('intlJournalCount', v)} />
          <CountField
            label="Tạp chí trong nước"
            value={form.domesticJournalCount}
            onChange={(v) => set('domesticJournalCount', v)}
          />
          <CountField
            label="Hội nghị QT"
            value={form.intlConferenceCount}
            onChange={(v) => set('intlConferenceCount', v)}
          />
          <CountField
            label="Hội nghị trong nước"
            value={form.domesticConferenceCount}
            onChange={(v) => set('domesticConferenceCount', v)}
          />
          <CountField label="Bằng sáng chế" value={form.patentsCount} onChange={(v) => set('patentsCount', v)} />
        </div>
      </div>

      {/* Supervision */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-4">
          <Users className="w-5 h-5 text-blue-600" /> Hướng dẫn nghiên cứu sinh / học viên
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <CountField
            label="NCS Tiến sĩ đã hướng dẫn"
            value={form.phdSupervisedCount}
            onChange={(v) => set('phdSupervisedCount', v)}
          />
          <CountField
            label="Học viên Thạc sĩ đã hướng dẫn"
            value={form.masterSupervisedCount}
            onChange={(v) => set('masterSupervisedCount', v)}
          />
        </div>
      </div>
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  className = '',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  className?: string
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}

function SelectField({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o || '— Chọn —'}
          </option>
        ))}
      </Select>
    </div>
  )
}

function CountField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <Input type="number" min={0} value={value} onChange={(e) => onChange(Math.max(0, Number(e.target.value)))} />
    </div>
  )
}
