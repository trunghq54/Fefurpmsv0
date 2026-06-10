import api from '../lib/api'

export const exportService = {
  downloadScientific: async (proposalId: string): Promise<Blob> => {
    const res = await api.get(`/api/proposals/${proposalId}/export/scientific`, {
      responseType: 'blob',
    })
    return res.data as Blob
  },

  downloadBudget: async (proposalId: string): Promise<Blob> => {
    const res = await api.get(`/api/proposals/${proposalId}/export/budget`, {
      responseType: 'blob',
    })
    return res.data as Blob
  },

  triggerDownload: (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  },
}
