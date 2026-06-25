import api from '../lib/api'
import type { ApiResponse } from '../types/auth'
import type { ReviewRoundDto, ReviewAssignmentDto, MyAssignmentDto } from '../types/review'

// Shapes returned directly by the BE (before mapping)
interface BeCouncilMember {
  id: string
  councilId: string
  userId: string
  reviewerName: string
  reviewerEmail?: string
  memberRole: string
  isExternal: boolean
  status: string // INVITED | CONFIRMED | DECLINED
  invitationSentAt?: string
  confirmedAt?: string
  declinedAt?: string
}

interface BeRoundResponse {
  id: string
  roundNumber: number
  dimension: string
  roundType: string
  rubricTemplateId?: number
  sequence: number
  prerequisiteRoundId?: string
  status: string
  openedAt?: string
  closedAt?: string
  result?: string
  councilId?: string
  members: BeCouncilMember[]
}

interface BeMyMembership {
  memberId: string
  councilId: string
  roundId?: string
  roundType: string
  roundStatus: string
  memberRole: string
  status: string // INVITED | CONFIRMED | DECLINED
  proposalId: string
  proposalTitleVI: string
  proposalStatus: string
}

function mapMemberStatus(beStatus: string): 'Pending' | 'Accepted' | 'Declined' {
  if (beStatus === 'CONFIRMED') return 'Accepted'
  if (beStatus === 'DECLINED') return 'Declined'
  return 'Pending'
}

function mapMemberToAssignment(m: BeCouncilMember, roundId: string): ReviewAssignmentDto {
  return {
    id: m.id,
    councilId: m.councilId,
    reviewRoundId: roundId,
    reviewerId: m.userId,
    reviewerName: m.reviewerName,
    reviewerEmail: m.reviewerEmail,
    role: m.memberRole as 'Member' | 'Chair' | 'Opponent',
    status: mapMemberStatus(m.status),
    assignedAt: m.invitationSentAt,
    acceptedAt: m.confirmedAt,
  }
}

function mapRoundResponse(r: BeRoundResponse): ReviewRoundDto {
  return {
    id: r.id,
    roundType: r.roundType,
    roundNumber: r.roundNumber,
    dimension: r.dimension,
    status: r.status,
    result: r.result,
    councilId: r.councilId,
    openedAt: r.openedAt,
    closedAt: r.closedAt,
    assignments: (r.members ?? []).map((m) => mapMemberToAssignment(m, r.id)),
  }
}

function mapMembership(m: BeMyMembership): MyAssignmentDto {
  return {
    assignmentId: m.memberId,
    councilId: m.councilId,
    roundId: m.roundId,
    roundType: m.roundType,
    roundStatus: m.roundStatus,
    role: m.memberRole,
    status: mapMemberStatus(m.status),
    proposalId: m.proposalId,
    proposalTitleVI: m.proposalTitleVI,
    proposalStatus: m.proposalStatus,
  }
}

export const roundService = {
  // GET /api/councils/my-memberships → mapped to MyAssignmentDto[]
  getMyAssignments: async (): Promise<ApiResponse<MyAssignmentDto[]>> => {
    const res = await api.get<ApiResponse<BeMyMembership[]>>('/api/councils/my-memberships')
    if (res.data.success && res.data.data) {
      return { ...res.data, data: res.data.data.map(mapMembership) }
    }
    return res.data as unknown as ApiResponse<MyAssignmentDto[]>
  },

  // GET /api/proposals/{proposalId}/rounds → mapped to ReviewRoundDto[]
  getRounds: async (proposalId: string): Promise<ApiResponse<ReviewRoundDto[]>> => {
    const res = await api.get<ApiResponse<BeRoundResponse[]>>(`/api/proposals/${proposalId}/rounds`)
    if (res.data.success && res.data.data) {
      return { ...res.data, data: res.data.data.map(mapRoundResponse) }
    }
    return res.data as unknown as ApiResponse<ReviewRoundDto[]>
  },

  // POST /api/proposals/{proposalId}/rounds
  createRound: async (
    proposalId: string,
    data: { roundType: string; dimension?: string },
  ): Promise<ApiResponse<ReviewRoundDto>> => {
    const body = {
      roundType: data.roundType,
      dimension: data.dimension ?? 'SCIENCE',
    }
    const res = await api.post<ApiResponse<BeRoundResponse>>(`/api/proposals/${proposalId}/rounds`, body)
    if (res.data.success && res.data.data) {
      return { ...res.data, data: mapRoundResponse(res.data.data) }
    }
    return res.data as unknown as ApiResponse<ReviewRoundDto>
  },

  // POST /api/rounds/{roundId}/members → assign reviewer to round
  assign: async (
    roundId: string,
    data: { reviewerId: string; role: string },
  ): Promise<ApiResponse<ReviewAssignmentDto>> => {
    const body = { reviewerId: data.reviewerId, memberRole: data.role, isExternal: false }
    const res = await api.post<ApiResponse<BeCouncilMember>>(`/api/rounds/${roundId}/members`, body)
    if (res.data.success && res.data.data) {
      return { ...res.data, data: mapMemberToAssignment(res.data.data, roundId) }
    }
    return res.data as unknown as ApiResponse<ReviewAssignmentDto>
  },

  // DELETE /api/rounds/{roundId}/members/{memberId}
  removeAssignment: async (roundId: string, memberId: string): Promise<void> => {
    await api.delete(`/api/rounds/${roundId}/members/${memberId}`)
  },

  // POST /api/councils/{councilId}/send-invitations → gửi thư mời đồng loạt
  sendInvitations: async (councilId: string): Promise<ApiResponse<unknown>> => {
    const res = await api.post<ApiResponse<unknown>>(`/api/councils/${councilId}/send-invitations`, {})
    return res.data
  },

  // PATCH /api/council-members/{memberId}/respond
  respond: async (memberId: string, accept: boolean): Promise<ApiResponse<ReviewAssignmentDto>> => {
    const res = await api.patch<ApiResponse<BeCouncilMember>>(`/api/council-members/${memberId}/respond`, { accept })
    if (res.data.success && res.data.data) {
      return { ...res.data, data: mapMemberToAssignment(res.data.data, '') }
    }
    return res.data as unknown as ApiResponse<ReviewAssignmentDto>
  },

  // POST /api/rounds/{roundId}/open
  openRound: async (roundId: string): Promise<ApiResponse<ReviewRoundDto>> => {
    const res = await api.post<ApiResponse<BeRoundResponse>>(`/api/rounds/${roundId}/open`)
    if (res.data.success && res.data.data) {
      return { ...res.data, data: mapRoundResponse(res.data.data) }
    }
    return res.data as unknown as ApiResponse<ReviewRoundDto>
  },

  // POST /api/rounds/{roundId}/close
  closeRound: async (roundId: string, result: string): Promise<ApiResponse<ReviewRoundDto>> => {
    const res = await api.post<ApiResponse<BeRoundResponse>>(`/api/rounds/${roundId}/close`, { result })
    if (res.data.success && res.data.data) {
      return { ...res.data, data: mapRoundResponse(res.data.data) }
    }
    return res.data as unknown as ApiResponse<ReviewRoundDto>
  },
}
