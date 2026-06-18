import { useState, useEffect, useRef } from 'react'
import { X, FileText, Sheet, Download } from 'lucide-react'
import { renderAsync } from 'docx-preview'
import * as XLSX from 'xlsx'
import { exportService } from '../../services/exportService'
import { Button, Spinner } from './ui-kit'

type Tab = 'word' | 'excel'

// Xem trước (render đúng file BE sinh ra) + tải Word (Thuyết minh) / Excel (Dự toán).
export default function ProposalDocumentPreview({
  proposalId, title, onClose, embedded,
}: { proposalId: string; title?: string; onClose?: () => void; embedded?: boolean }) {
  const [tab, setTab] = useState<Tab>('word')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [excelHtml, setExcelHtml] = useState<{ name: string; html: string }[]>([])
  const wordRef = useRef<HTMLDivElement>(null)
  // giữ blob đã tải để nút "Tải" không phải gọi lại API
  const blobs = useRef<{ word?: Blob; excel?: Blob }>({})

  const codeShort = proposalId.slice(0, 8).toUpperCase()

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true); setError('')
      try {
        if (tab === 'word') {
          const blob = await exportService.downloadScientific(proposalId)
          if (cancelled) return
          blobs.current.word = blob
          if (wordRef.current) {
            wordRef.current.innerHTML = ''
            await renderAsync(blob, wordRef.current, undefined, {
              className: 'docx', inWrapper: true, ignoreWidth: false, ignoreHeight: false,
            })
          }
        } else {
          const blob = await exportService.downloadBudget(proposalId)
          if (cancelled) return
          blobs.current.excel = blob
          const buf = await blob.arrayBuffer()
          const wb = XLSX.read(buf, { type: 'array' })
          const sheets = wb.SheetNames.map((name) => ({
            name,
            html: XLSX.utils.sheet_to_html(wb.Sheets[name]),
          }))
          if (!cancelled) setExcelHtml(sheets)
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.status === 404
          ? 'Endpoint xuất file chưa sẵn sàng.'
          : (e?.message || 'Không tải được tài liệu.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [tab, proposalId])

  const download = () => {
    if (tab === 'word' && blobs.current.word)
      exportService.triggerDownload(blobs.current.word, `ThuyetMinh_${codeShort}.docx`)
    if (tab === 'excel' && blobs.current.excel)
      exportService.triggerDownload(blobs.current.excel, `DuToan_${codeShort}.xlsx`)
  }

  const styleTag = (
    <style>{`
      .excel-preview table { border-collapse: collapse; width: 100%; }
      .excel-preview td, .excel-preview th { border: 1px solid #e5e7eb; padding: 4px 8px; white-space: nowrap; }
      .docx { background: white; }
    `}</style>
  )
  const tabs = (
    <div className="flex items-center justify-between border-b border-gray-200 px-2">
      <div className="flex">
        <TabBtn active={tab === 'word'} onClick={() => setTab('word')} icon={<FileText className="w-4 h-4" />} label="Thuyết minh (Word)" />
        <TabBtn active={tab === 'excel'} onClick={() => setTab('excel')} icon={<Sheet className="w-4 h-4" />} label="Dự toán (Excel)" />
      </div>
      <Button onClick={download} disabled={loading} size="sm" className="my-1">
        <Download className="w-4 h-4" /> Tải {tab === 'word' ? '.docx' : '.xlsx'}
      </Button>
    </div>
  )
  const body = (
    <>
      {loading && <Spinner text="Đang tải & dựng tài liệu..." />}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}
      <div className={tab === 'word' && !loading && !error ? 'flex justify-center' : 'hidden'}>
        <div ref={wordRef} className="bg-white shadow" />
      </div>
      {tab === 'excel' && !loading && !error && (
        <div className="space-y-6">
          {excelHtml.length === 0 ? (
            <p className="text-sm text-gray-400">Chưa có dữ liệu dự toán.</p>
          ) : excelHtml.map((s) => (
            <div key={s.name} className="bg-white rounded-lg shadow p-4 overflow-auto">
              <p className="font-semibold text-gray-700 mb-2">Sheet: {s.name}</p>
              <div className="excel-preview text-sm" dangerouslySetInnerHTML={{ __html: s.html }} />
            </div>
          ))}
        </div>
      )}
    </>
  )

  if (embedded) {
    return (
      <div className="bg-white rounded-xl border border-gray-200">
        {tabs}
        <div className="p-4 bg-gray-100 rounded-b-xl max-h-[70vh] overflow-auto">{body}</div>
        {styleTag}
      </div>
    )
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Hồ sơ tài liệu</h3>
            {title && <p className="text-sm text-gray-500 truncate max-w-2xl">{title}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        {tabs}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">{body}</div>
        {styleTag}
      </div>
    </div>
  )
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
        active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}>
      {icon} {label}
    </button>
  )
}
