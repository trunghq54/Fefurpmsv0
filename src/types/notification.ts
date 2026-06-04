export interface NotificationDto {
  id: string
  title: string
  message: string
  type: string
  relatedEntityId?: string
  relatedEntityType?: string
  isRead: boolean
  createdAt: string
}
