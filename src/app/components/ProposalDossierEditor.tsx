import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Save, BookOpen, Package, Wallet, Users, Loader2, CheckCircle } from 'lucide-react'
import { proposalContentsService } from '../../services/proposalContentsService'
import type { ResearchContentDto, ExpectedProductDto } from '../../services/proposalContentsService'
import { proposalBudgetService } from '../../services/proposalBudgetService'
import type { BudgetItemDto, LaborDetailResponse } from '../../types/budget'
import { budgetExpenseCategoryService } from '../../services/masterDataService'
import type { BudgetExpenseCategoryResponse } from '../../types/masterData'
import { productCategoryService } from '../../services/productCategoryService'
import type { ProductCategoryDto } from '../../services/productCategoryService'

type Tab = 'contents' | 'products' | 'budget' | 'labor'
const fmt = (n: number) => (n || 0).toLocaleString('vi-VN')

// Editor nhập chi tiết hồ sơ cho 1 đề xuất (Draft) — để file Word/Excel xuất ra đầy đủ.
// embedded=true: nhúng inline trong workspace (không modal đè trang).
export default function ProposalDossierEditor({
  proposalId, title, onClose, embedded,
}: { proposalId: string; title?: string; onClose?: () => void; embedded?: boolean }) {
  const [tab, setTab] = useState<Tab>('contents')

  const tabs = (
    <div className="flex border-b border-gray-200 px-2 overflow-x-auto">
      <TabBtn active={tab === 'contents'} onClick={() => setTab('contents')} icon={<BookOpen className="w-4 h-4" />} label="Nội dung NC" />
      <TabBtn active={tab === 'products'} onClick={() => setTab('products')} icon={<Package className="w-4 h-4" />} label="Sản phẩm dự kiến" />
      <TabBtn active={tab === 'budget'} onClick={() => setTab('budget')} icon={<Wallet className="w-4 h-4" />} label="Kinh phí chi tiết" />
      <TabBtn active={tab === 'labor'} onClick={() => setTab('labor')} icon={<Users className="w-4 h-4" />} label="Tiền công" />
    </div>
  )
  const sections = (
    <>
      {tab === 'contents' && <ContentsSection proposalId={proposalId} />}
      {tab === 'products' && <ProductsSection proposalId={proposalId} />}
      {tab === 'budget' && <BudgetSection proposalId={proposalId} />}
      {tab === 'labor' && <LaborSection proposalId={proposalId} />}
    </>
  )

  if (embedded) {
    return (
      <div className="bg-white rounded-xl border border-gray-200">
        {tabs}
        <div className="p-4 bg-gray-50 rounded-b-xl">{sections}</div>
      </div>
    )
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Soạn chi tiết hồ sơ</h3>
            {title && <p className="text-sm text-gray-500 truncate max-w-2xl">{title}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        {tabs}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">{sections}</div>
      </div>
    </div>
  )
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition ${
        active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
      {icon} {label}
    </button>
  )
}

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500'

// ── Nội dung nghiên cứu + hoạt động ────────────────────────────────────────
function ContentsSection({ proposalId }: { proposalId: string }) {
  const [contents, setContents] = useState<ResearchContentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () => proposalContentsService.getContents(proposalId).then((r) => {
    if (r.success && r.data) setContents(r.data); setLoading(false)
  })
  useEffect(() => { load() }, [proposalId])

  const addContent = async () => {
    if (!title.trim()) return
    setBusy(true)
    try {
      await proposalContentsService.createContent(proposalId, {
        contentNumber: contents.length + 1, title, description: desc, sequence: contents.length + 1,
      })
      setTitle(''); setDesc(''); load()
    } finally { setBusy(false) }
  }
  const delContent = async (id: number) => { await proposalContentsService.deleteContent(proposalId, id); load() }

  if (loading) return <Loading />
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <p className="font-semibold text-gray-800">Thêm nội dung nghiên cứu</p>
        <input className={inputCls} placeholder="Tên nội dung" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className={inputCls} rows={2} placeholder="Mô tả (tuỳ chọn)" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <button onClick={addContent} disabled={busy || !title.trim()}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
          <Plus className="w-4 h-4" /> Thêm
        </button>
      </div>
      {contents.length === 0 ? <Empty text="Chưa có nội dung nghiên cứu." /> : contents.map((c) => (
        <ContentCard key={c.id} proposalId={proposalId} content={c} onChanged={load} onDelete={() => delContent(c.id)} />
      ))}
    </div>
  )
}

function ContentCard({ proposalId, content, onChanged, onDelete }: {
  proposalId: string; content: ResearchContentDto; onChanged: () => void; onDelete: () => void
}) {
  const [name, setName] = useState(''); const [result, setResult] = useState('')
  const [sm, setSm] = useState(1); const [em, setEm] = useState(1); const [busy, setBusy] = useState(false)

  const addActivity = async () => {
    if (!name.trim()) return
    setBusy(true)
    try {
      await proposalContentsService.createActivity(proposalId, content.id, {
        activityName: name, expectedResult: result, startMonth: sm, endMonth: em,
        estimatedCost: 0, sequence: (content.activities?.length || 0) + 1, requiresApproval: false,
      })
      setName(''); setResult(''); onChanged()
    } finally { setBusy(false) }
  }
  const delAct = async (id: number) => { await proposalContentsService.deleteActivity(proposalId, id); onChanged() }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-800">Nội dung {content.contentNumber}: {content.title}</p>
          {content.description && <p className="text-sm text-gray-500 mt-0.5">{content.description}</p>}
        </div>
        <button onClick={onDelete} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
      </div>
      <div className="mt-3 space-y-1.5">
        {(content.activities || []).map((a) => (
          <div key={a.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5 text-sm">
            <span className="text-gray-700">{a.activityName} <span className="text-gray-400">· tháng {a.startMonth}–{a.endMonth}</span></span>
            <button onClick={() => delAct(a.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </div>
      <div className="mt-3 grid md:grid-cols-12 gap-2 items-end">
        <div className="md:col-span-4"><label className="text-xs text-gray-500">Hoạt động</label><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="md:col-span-4"><label className="text-xs text-gray-500">Kết quả cần đạt</label><input className={inputCls} value={result} onChange={(e) => setResult(e.target.value)} /></div>
        <div className="md:col-span-1"><label className="text-xs text-gray-500">Từ (th)</label><input type="number" min={1} className={inputCls} value={sm} onChange={(e) => setSm(Number(e.target.value))} /></div>
        <div className="md:col-span-1"><label className="text-xs text-gray-500">Đến (th)</label><input type="number" min={1} className={inputCls} value={em} onChange={(e) => setEm(Number(e.target.value))} /></div>
        <div className="md:col-span-2"><button onClick={addActivity} disabled={busy || !name.trim()}
          className="flex items-center gap-1 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-60"><Plus className="w-4 h-4" /> Hoạt động</button></div>
      </div>
    </div>
  )
}

// ── Sản phẩm dự kiến ───────────────────────────────────────────────────────
function ProductsSection({ proposalId }: { proposalId: string }) {
  const [products, setProducts] = useState<ExpectedProductDto[]>([])
  const [cats, setCats] = useState<ProductCategoryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState(''); const [req, setReq] = useState(''); const [catId, setCatId] = useState<number | ''>(''); const [busy, setBusy] = useState(false)

  const load = () => proposalContentsService.getExpectedProducts(proposalId).then((r) => {
    if (r.success && r.data) setProducts(r.data); setLoading(false)
  })
  useEffect(() => {
    load()
    productCategoryService.getAll(true).then((r) => { if (r.success && r.data) setCats(r.data) }).catch(() => {})
  }, [proposalId])

  const add = async () => {
    if (!name.trim()) return
    setBusy(true)
    try {
      await proposalContentsService.createExpectedProduct(proposalId, {
        productName: name, scientificRequirements: req, categoryId: catId === '' ? undefined : catId, sequence: products.length + 1,
      })
      setName(''); setReq(''); setCatId(''); load()
    } finally { setBusy(false) }
  }
  const del = async (id: number) => { await proposalContentsService.deleteExpectedProduct(proposalId, id); load() }

  if (loading) return <Loading />
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 grid md:grid-cols-12 gap-2 items-end">
        <div className="md:col-span-4"><label className="text-xs text-gray-500">Tên sản phẩm</label><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="md:col-span-4"><label className="text-xs text-gray-500">Tiêu chí/Yêu cầu KH</label><input className={inputCls} value={req} onChange={(e) => setReq(e.target.value)} /></div>
        <div className="md:col-span-2"><label className="text-xs text-gray-500">Dạng SP</label>
          <select className={inputCls} value={catId} onChange={(e) => setCatId(e.target.value === '' ? '' : Number(e.target.value))}>
            <option value="">—</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-2"><button onClick={add} disabled={busy || !name.trim()}
          className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"><Plus className="w-4 h-4" /> Thêm</button></div>
      </div>
      {products.length === 0 ? <Empty text="Chưa có sản phẩm dự kiến." /> : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div><span className="font-medium text-gray-800">{p.productName}</span>{p.scientificRequirements && <span className="text-gray-400"> · {p.scientificRequirements}</span>}</div>
              <button onClick={() => del(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Kinh phí chi tiết (cột nguồn vốn) ──────────────────────────────────────
function BudgetSection({ proposalId }: { proposalId: string }) {
  const [items, setItems] = useState<BudgetItemDto[]>([])
  const [cats, setCats] = useState<BudgetExpenseCategoryResponse[]>([])
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [saved, setSaved] = useState(false)
  const [newCat, setNewCat] = useState<number | ''>('')

  useEffect(() => {
    Promise.all([proposalBudgetService.getBudget(proposalId), budgetExpenseCategoryService.getAll()]).then(([b, c]) => {
      if (b.success && b.data) setItems(b.data.items)
      if (c.success && c.data) setCats(c.data.filter((x) => x.isActive))
      setLoading(false)
    })
  }, [proposalId])

  const total = items.reduce((s, i) => s + (Number(i.amount) || 0), 0)
  const setField = (idx: number, key: keyof BudgetItemDto, val: number) =>
    setItems(items.map((it, j) => j === idx ? { ...it, [key]: val } : it))

  const addItem = () => {
    if (newCat === '') return
    const cat = cats.find((c) => c.id === newCat)
    setItems([...items, { id: null, categoryId: newCat as number, categoryCode: cat?.code ?? null, categoryName: cat?.name ?? null, amount: 0, sourceKhoan: 0, sourceNgoaiKhoan: 0, sourceNsnn: 0, sourceOther: 0, sequence: items.length + 1 }])
    setNewCat('')
  }
  const removeItem = (idx: number) => setItems(items.filter((_, j) => j !== idx))

  const save = async () => {
    setSaving(true); setSaved(false)
    try {
      const res = await proposalBudgetService.updateBudget(proposalId, { totalAmount: total, items })
      if (res.success && res.data) { setItems(res.data.items); setSaved(true); setTimeout(() => setSaved(false), 2000) }
    } finally { setSaving(false) }
  }

  if (loading) return <Loading />
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 border-b">
            <th className="py-2 pr-2">Hạng mục</th><th className="px-2">Tổng (₫)</th><th className="px-2">Khoán</th><th className="px-2">Ngoài khoán</th><th className="px-2">NSNN</th><th className="px-2">Khác</th><th></th>
          </tr></thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx} className="border-b last:border-0">
                <td className="py-1.5 pr-2 text-gray-800">{it.categoryName || it.categoryCode || `#${it.categoryId}`}</td>
                <td className="px-1"><NumCell value={it.amount} onChange={(v) => setField(idx, 'amount', v)} /></td>
                <td className="px-1"><NumCell value={it.sourceKhoan} onChange={(v) => setField(idx, 'sourceKhoan', v)} /></td>
                <td className="px-1"><NumCell value={it.sourceNgoaiKhoan} onChange={(v) => setField(idx, 'sourceNgoaiKhoan', v)} /></td>
                <td className="px-1"><NumCell value={it.sourceNsnn} onChange={(v) => setField(idx, 'sourceNsnn', v)} /></td>
                <td className="px-1"><NumCell value={it.sourceOther} onChange={(v) => setField(idx, 'sourceOther', v)} /></td>
                <td><button onClick={() => removeItem(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} className="py-4 text-center text-gray-400">Chưa có khoản chi.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm" value={newCat} onChange={(e) => setNewCat(e.target.value === '' ? '' : Number(e.target.value))}>
            <option value="">— Chọn hạng mục —</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={addItem} disabled={newCat === ''} className="flex items-center gap-1 px-3 py-2 text-sm border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 disabled:opacity-50"><Plus className="w-4 h-4" /> Thêm khoản</button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Tổng: <b className="text-gray-900">{fmt(total)} ₫</b></span>
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 text-sm">
            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />} {saved ? 'Đã lưu' : saving ? 'Đang lưu...' : 'Lưu kinh phí'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Tiền công trực tiếp ────────────────────────────────────────────────────
function LaborSection({ proposalId }: { proposalId: string }) {
  const [rows, setRows] = useState<LaborDetailResponse[]>([])
  const [loading, setLoading] = useState(true); const [savingId, setSavingId] = useState<number | null>(null)

  const load = () => proposalBudgetService.getLaborDetails(proposalId).then((r) => {
    if (r.success && r.data) setRows(r.data); setLoading(false)
  })
  useEffect(() => { load() }, [proposalId])

  const setField = (idx: number, key: keyof LaborDetailResponse, val: number) =>
    setRows(rows.map((row, j) => j === idx ? { ...row, [key]: val } : row))

  const saveRow = async (row: LaborDetailResponse) => {
    setSavingId(row.id)
    try {
      const res = await proposalBudgetService.updateLaborDetail(proposalId, row.id, {
        workDays: row.workDays ?? undefined, coefficient: row.coefficient ?? undefined,
        totalResearchHours: row.totalResearchHours, hourlyRate: row.hourlyRate,
      })
      if (res.success && res.data) setRows(rows.map((r) => r.id === row.id ? res.data! : r))
    } finally { setSavingId(null) }
  }

  if (loading) return <Loading />
  if (rows.length === 0) return <Empty text="Chưa có dòng tiền công. Thêm thành viên cho đề tài trước (hệ thống tự tạo dòng tiền công theo thành viên)." />
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left text-gray-500 border-b">
          <th className="py-2 pr-2">Thành viên</th><th className="px-2">Số ngày công</th><th className="px-2">Hệ số</th><th className="px-2">Đơn giá ngày</th><th className="px-2">Tổng tiền</th><th></th>
        </tr></thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id} className="border-b last:border-0">
              <td className="py-1.5 pr-2 text-gray-800">{row.teamMemberName || `#${row.teamMemberId}`}</td>
              <td className="px-1"><NumCell value={row.workDays ?? 0} onChange={(v) => setField(idx, 'workDays', v)} /></td>
              <td className="px-1"><input type="number" step="0.01" className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right" value={row.coefficient ?? 0} onChange={(e) => setField(idx, 'coefficient', Number(e.target.value))} /></td>
              <td className="px-2 text-right text-gray-600">{row.dailyRate != null ? fmt(row.dailyRate) : '—'}</td>
              <td className="px-2 text-right text-gray-800 font-medium">{row.computedDailyTotal != null ? fmt(row.computedDailyTotal) : (row.totalAmount ? fmt(row.totalAmount) : '—')}</td>
              <td><button onClick={() => saveRow(row)} disabled={savingId === row.id}
                className="flex items-center gap-1 px-2.5 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"><Save className="w-3.5 h-3.5" /> Lưu</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 mt-2">Đơn giá ngày = hệ số × lương cơ bản ngày; tổng tiền = số ngày công × đơn giá — hệ thống tự tính khi lưu.</p>
    </div>
  )
}

function NumCell({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return <input type="number" min={0} className="w-32 px-2 py-1 border border-gray-300 rounded text-sm text-right"
    value={value} onChange={(e) => onChange(Math.max(0, Number(e.target.value)))} />
}
function Loading() { return <div className="flex items-center justify-center py-12 text-gray-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tải...</div> }
function Empty({ text }: { text: string }) { return <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">{text}</div> }
