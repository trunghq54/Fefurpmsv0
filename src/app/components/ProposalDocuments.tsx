import { useState, useEffect, useRef } from 'react'
import { Upload, FileText, Download, Trash2, Paperclip } from 'lucide-react'
import { proposalService } from '../../services/proposalService'
import type { ProposalDocumentDto } from '../../types/proposal'

const fmtSize = (b: number) => (b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`)

export default function ProposalDocuments({ proposalId, canEdit = true }: { proposalId: string; canEdit?: boolean }) {
  const [docs, setDocs] = useState<ProposalDocumentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [docType, setDocType] = useState('Proposal')
  const fileRef = useRef<HTMLInputElement>(null)

  const load = () => {
    setLoading(true)
    proposalService.getDocuments(proposalId).then((res) => {
      if (res.success && res.data) setDocs(res.data)
      setLoading(false)
    })
  }
  useEffect(load, [proposalId])

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true); setError('')
    try {
      const res = await proposalService.uploadDocument(proposalId, file, docType)
      if (res.success && res.data) setDocs((prev) => [res.data!, ...prev])
      else setError(res.message || 'Tải lên thất bại')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Tải lên thất bại')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const remove = async (d: ProposalDocumentDto) => {
    if (!window.confirm(`Xóa tài liệu "${d.fileName}"?`)) return
    await proposalService.deleteDocument(proposalId, d.id)
    setDocs((prev) => prev.filter((x) => x.id !== d.id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h5 className="flex items-center gap-2 font-semibold text-gray-800"><Paperclip className="w-4 h-4" /> Tài liệu ({docs.length})</h5>
        {canEdit && (
          <div className="flex items-center gap-2">
            <select value={docType} onChange={(e) => setDocType(e.target.value)}
              className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Proposal">Thuyết minh</option>
              <option value="CV">Lý lịch khoa học</option>
              <option value="Other">Khác</option>
            </select>
            <button onClick={() => fileRef.current?.click()} disabled={busy}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
              <Upload className="w-4 h-4" /> {busy ? 'Đang tải...' : 'Tải lên'}
            </button>
            <input ref={fileRef} type="file" onChange={onPick} accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" className="hidden" />
          </div>
        )}
      </div>

      {error && <div className="mb-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      {loading ? (
        <p className="text-sm text-gray-400">Đang tải...</p>
      ) : docs.length === 0 ? (
        <p className="text-sm text-gray-400">Chưa có tài liệu. {canEdit && 'Hỗ trợ PDF, DOC(X), XLS(X), ảnh — tối đa 10MB.'}</p>
      ) : (
        <div className="border border-gray-200 rounded-lg divide-y">
          {docs.map((d) => (
            <div key={d.id} className="px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-gray-800">{d.fileName}</span>
                <span className="text-gray-400">· {d.documentType} · {fmtSize(d.fileSizeBytes)}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => proposalService.downloadDocument(proposalId, d.id, d.fileName)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Tải xuống"><Download className="w-4 h-4" /></button>
                {canEdit && (
                  <button onClick={() => remove(d)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
