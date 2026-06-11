import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { LayoutDashboard, Calendar, UserPlus, LogOut, FileText, Users, UserCheck, CheckCircle, BookOpen, ClipboardList, ShoppingBag } from 'lucide-react'
import { analyticsService } from '../../services/analyticsService'
import type { AnalyticsOverview } from '../../types/analytics'
import ProposalManagement from './ProposalManagement'
import MeetingsOverview from './MeetingsOverview'
import ContractManagement from './ContractManagement'
import ResearchOrderManagement from './ResearchOrderManagement'
import RoleSwitcher from './RoleSwitcher'

interface User {
  role: string
  name: string
}

interface StaffDashboardProps {
  user: User
  onLogout: () => void
}

export default function StaffDashboard({ user, onLogout }: StaffDashboardProps) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeMenu = searchParams.get('tab') || 'dashboard'
  const setActiveMenu = (id: string) => setSearchParams({ tab: id })

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)

  useEffect(() => {
    analyticsService.getOverview().then((r) => { if (r.success && r.data) setOverview(r.data) }).catch(() => {})
  }, [])

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'reviewers', label: 'Đề xuất & Phân công', icon: UserPlus },
    { id: 'meetings', label: 'Quản lý lịch họp', icon: Calendar },
    { id: 'contracts', label: 'Hợp đồng', icon: ClipboardList },
    { id: 'research-orders', label: 'Đặt hàng NC', icon: ShoppingBag },
  ]

  const cards = [
    { label: 'Tổng đề xuất', value: overview?.totalProposals ?? '—', icon: FileText, color: 'bg-blue-100 text-blue-600' },
    { label: 'Giảng viên (PI)', value: overview?.totalPIs ?? '—', icon: Users, color: 'bg-green-100 text-green-600' },
    { label: 'Phản biện', value: overview?.totalReviewers ?? '—', icon: UserCheck, color: 'bg-purple-100 text-purple-600' },
    { label: 'Đã duyệt', value: overview?.totalByStatus?.['APPROVED'] ?? overview?.totalByStatus?.['Approved'] ?? 0, icon: CheckCircle, color: 'bg-orange-100 text-orange-600' },
  ]

  const renderContent = () => {
    switch (activeMenu) {
      case 'reviewers':
        return <ProposalManagement />
      case 'meetings':
        return <MeetingsOverview />
      case 'contracts':
        return <ContractManagement />
      case 'research-orders':
        return <ResearchOrderManagement />
      default:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-xl shadow-lg">
              <h2 className="text-3xl font-bold mb-2">Xin chào, {user.name}</h2>
              <p className="text-blue-100">Cổng cán bộ (Staff) — quản lý phân công phản biện & lịch họp</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {cards.map((c) => {
                const Icon = c.icon
                return (
                  <div key={c.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className={`inline-flex p-3 rounded-lg mb-4 ${c.color}`}><Icon className="w-6 h-6" /></div>
                    <p className="text-gray-500 text-sm">{c.label}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{c.value}</p>
                  </div>
                )
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <button onClick={() => setActiveMenu('reviewers')}
                className="text-left bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-400 transition">
                <div className="flex items-center gap-3 mb-2"><UserPlus className="w-5 h-5 text-blue-600" /><h3 className="font-semibold text-gray-800">Đề xuất & Phân công</h3></div>
                <p className="text-sm text-gray-500">Mở đề xuất, tạo vòng phản biện, phân công người chấm.</p>
              </button>
              <button onClick={() => setActiveMenu('meetings')}
                className="text-left bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-400 transition">
                <div className="flex items-center gap-3 mb-2"><Calendar className="w-5 h-5 text-blue-600" /><h3 className="font-semibold text-gray-800">Quản lý lịch họp</h3></div>
                <p className="text-sm text-gray-500">Xem toàn bộ cuộc họp hội đồng của các vòng phản biện.</p>
              </button>
              <button onClick={() => setActiveMenu('contracts')}
                className="text-left bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-400 transition">
                <div className="flex items-center gap-3 mb-2"><ClipboardList className="w-5 h-5 text-blue-600" /><h3 className="font-semibold text-gray-800">Hợp đồng</h3></div>
                <p className="text-sm text-gray-500">Tạo, ký kết, giải ngân và thanh lý hợp đồng nghiên cứu.</p>
              </button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600">FURPMS</h1>
          <p className="text-sm text-gray-500 mt-1">Cổng cán bộ</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeMenu === item.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button onClick={() => navigate('/guide')}
            className="w-full flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition mb-2">
            <BookOpen className="w-4 h-4" /><span>Hướng dẫn</span>
          </button>
          <div className="mb-4"><RoleSwitcher /></div>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-500 mt-1">Staff</p>
          </div>
          <button
            onClick={() => { if (window.confirm('Bạn có chắc muốn đăng xuất?')) onLogout() }}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-8">{renderContent()}</div>
      </div>
    </div>
  )
}
