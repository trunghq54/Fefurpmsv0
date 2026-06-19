import { FileText, Users, Wallet } from 'lucide-react'
import type { ProposalDto } from '../../types/proposal'
import ProposalDocuments from './ProposalDocuments'
import AiSummaryPanel from './AiSummaryPanel'

const statusColor = (status: string) => {
  const map: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800',
    Submitted: 'bg-yellow-100 text-yellow-800',
    UnderReview: 'bg-blue-100 text-blue-800',
    Approved: 'bg-green-100 text-green-800',
    Accepted: 'bg-green-100 text-green-800',
    RejectedAtReview: 'bg-red-100 text-red-800',
    RejectedAtAcceptance: 'bg-red-100 text-red-800',
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

const formatVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫'

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

export default function ProposalDetailView({
  proposal,
  assignmentId,
}: {
  proposal: ProposalDto
  assignmentId?: string
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-4 h-4 text-blue-500" />
          <h4 className="text-base font-semibold text-gray-800">{proposal.titleVI}</h4>
        </div>
        <p className="text-sm text-gray-500 ml-6">{proposal.titleEN}</p>
        <div className="flex flex-wrap gap-2 mt-2 ml-6">
          <span className={`px-3 py-0.5 rounded-full text-xs font-medium ${statusColor(proposal.status)}`}>
            {proposal.status}
          </span>
          <span className="px-3 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">{proposal.researchType}</span>
          <span className="px-3 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
            {proposal.durationMonths} tháng
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 text-sm">
        <Field label="Chủ nhiệm" value={proposal.principalInvestigatorName} />
        <Field label="Đợt" value={proposal.cycleName} />
        <Field label="Track" value={proposal.trackName} />
        <Field label="Tổng kinh phí" value={formatVnd(proposal.totalBudget)} />
      </div>

      {proposal.objectives && <Block label="Mục tiêu" value={proposal.objectives} />}
      {proposal.methodology && <Block label="Phương pháp" value={proposal.methodology} />}
      {proposal.expectedOutput && <Block label="Sản phẩm dự kiến" value={proposal.expectedOutput} />}

      <div>
        <h5 className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
          <Users className="w-4 h-4" /> Thành viên ({proposal.members.length})
        </h5>
        <div className="border border-gray-200 rounded-lg divide-y text-sm">
          {proposal.members.map((m) => (
            <div key={m.id} className="px-4 py-2 flex justify-between">
              <span className="text-gray-800">
                {m.fullName} <span className="text-gray-400">· {m.role}</span>
              </span>
              <span className="text-gray-500">{m.workMonths} tháng</span>
            </div>
          ))}
          {proposal.members.length === 0 && <div className="px-4 py-2 text-sm text-gray-400">Không có</div>}
        </div>
      </div>

      <div>
        <h5 className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
          <Wallet className="w-4 h-4" /> Kinh phí ({proposal.budgetItems.length})
        </h5>
        <div className="border border-gray-200 rounded-lg divide-y text-sm">
          {proposal.budgetItems.map((b) => (
            <div key={b.id} className="px-4 py-2 flex justify-between">
              <span className="text-gray-800">{b.category}</span>
              <span className="text-gray-600">{formatVnd(b.amount)}</span>
            </div>
          ))}
          {proposal.budgetItems.length === 0 && <div className="px-4 py-2 text-sm text-gray-400">Không có</div>}
        </div>
      </div>

      <ProposalDocuments proposalId={proposal.id} canEdit={false} />

      <div className="pt-2">
        <AiSummaryPanel proposalId={proposal.id} assignmentId={assignmentId} />
      </div>
    </div>
  )
}
