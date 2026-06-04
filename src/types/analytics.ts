export interface AnalyticsOverview {
  totalProposals: number
  totalByStatus: Record<string, number>
  totalByResearchType: Record<string, number>
  totalPIs: number
  totalReviewers: number
  activeCycle?: string
}

export interface TrackStats {
  trackName: string
  total: number
  passed: number
  failed: number
  pending: number
}

export interface FunnelStage {
  stage: string
  count: number
}
