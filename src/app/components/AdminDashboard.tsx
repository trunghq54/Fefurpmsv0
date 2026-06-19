import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import {
  LayoutDashboard,
  Users,
  FileText,
  UserCheck,
  Calendar,
  LogOut,
  Search,
  CalendarRange,
  FileEdit,
  Paperclip,
  SlidersHorizontal,
  BookOpen,
  ClipboardList,
  Building2,
  Tag,
  ShoppingBag,
  Clock,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import UserManagement from './UserManagement'
import CycleManagement from './CycleManagement'
import ChangeRequestQueue from './ChangeRequestQueue'
import NotificationBell from './NotificationBell'
import RoleSwitcher from './RoleSwitcher'
import { analyticsService } from '../../services/analyticsService'
import type { AnalyticsOverview, TrackStats, FunnelStage } from '../../types/analytics'
import ProposalManagement from './ProposalManagement'
import MeetingsOverview from './MeetingsOverview'
import DocumentRepository from './DocumentRepository'
import AdvancedSearch from './AdvancedSearch'
import RubricSettings from './RubricSettings'
import ContractManagement from './ContractManagement'
import OrgUnitManagement from './OrgUnitManagement'
import ProductCategoryManagement from './ProductCategoryManagement'
import ResearchOrderManagement from './ResearchOrderManagement'
import SystemClockPanel from './SystemClockPanel'

interface User {
  role: string
  name: string
}

interface AdminDashboardProps {
  user: User
  onLogout: () => void
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeMenu = searchParams.get('tab') || 'dashboard'
  const setActiveMenu = (id: string) => setSearchParams({ tab: id })

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [byTrack, setByTrack] = useState<TrackStats[]>([])
  const [funnel, setFunnel] = useState<FunnelStage[]>([])

  useEffect(() => {
    analyticsService.getOverview().then((r) => {
      if (r.success && r.data) setOverview(r.data)
    })
    analyticsService.getByTrack().then((r) => {
      if (r.success && r.data) setByTrack(r.data)
    })
    analyticsService.getFunnel().then((r) => {
      if (r.success && r.data) setFunnel(r.data)
    })
  }, [])

  const liveStats = [
    { label: 'Tổng đề xuất', value: String(overview?.totalProposals ?? '—'), icon: FileText, color: 'bg-blue-500' },
    { label: 'Giảng viên (PI)', value: String(overview?.totalPIs ?? '—'), icon: Users, color: 'bg-green-500' },
    { label: 'Phản biện', value: String(overview?.totalReviewers ?? '—'), icon: UserCheck, color: 'bg-purple-500' },
    {
      label: 'Đã duyệt',
      value: String(overview?.totalByStatus?.['APPROVED'] ?? overview?.totalByStatus?.['Approved'] ?? 0),
      icon: Calendar,
      color: 'bg-orange-500',
    },
  ]
  const trackChart = byTrack.map((t) => ({ name: t.trackName, total: t.total, passed: t.passed }))
  const funnelColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
  const funnelChart = funnel.map((f, i) => ({
    name: f.stage,
    value: f.count,
    color: funnelColors[i % funnelColors.length],
  }))

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'search', label: 'Tìm kiếm', icon: Search },
    { id: 'users', label: 'Người dùng', icon: Users },
    { id: 'cycles', label: 'Đợt & Track', icon: CalendarRange },
    { id: 'proposals', label: 'Đề xuất', icon: FileText },
    { id: 'change-requests', label: 'Yêu cầu thay đổi', icon: FileEdit },
    { id: 'documents', label: 'Tài liệu', icon: Paperclip },
    { id: 'meetings', label: 'Lịch họp', icon: Calendar },
    { id: 'rubric', label: 'Tiêu chí chấm', icon: SlidersHorizontal },
    { id: 'contracts', label: 'Hợp đồng', icon: ClipboardList },
    { id: 'orgunits', label: 'Đơn vị tổ chức', icon: Building2 },
    { id: 'product-categories', label: 'Danh mục SP', icon: Tag },
    { id: 'research-orders', label: 'Đặt hàng NC', icon: ShoppingBag },
    { id: 'devtools', label: 'Công cụ test', icon: Clock },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600">FURPMS</h1>
          <p className="text-sm text-gray-500 mt-1">Cổng quản trị</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeMenu === item.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => navigate('/guide')}
            className="w-full flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition mb-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Hướng dẫn</span>
          </button>
          <div className="mb-4">
            <RoleSwitcher />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user.name[0]}
            </div>
            <div>
              <p className="font-medium text-gray-800">{user.name}</p>
              <p className="text-sm text-gray-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Bạn có chắc muốn đăng xuất?')) onLogout()
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white border-b border-gray-200 p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h2>
              <p className="text-gray-500 mt-1">Xin chào, {user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeMenu === 'search' && <AdvancedSearch />}
          {activeMenu === 'users' && <UserManagement />}
          {activeMenu === 'cycles' && <CycleManagement />}
          {activeMenu === 'proposals' && <ProposalManagement />}
          {activeMenu === 'change-requests' && <ChangeRequestQueue />}
          {activeMenu === 'documents' && <DocumentRepository />}
          {activeMenu === 'meetings' && <MeetingsOverview />}
          {activeMenu === 'rubric' && <RubricSettings />}
          {activeMenu === 'contracts' && <ContractManagement />}
          {activeMenu === 'orgunits' && <OrgUnitManagement />}
          {activeMenu === 'product-categories' && <ProductCategoryManagement />}
          {activeMenu === 'research-orders' && <ResearchOrderManagement />}
          {activeMenu === 'devtools' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Công cụ test</h2>
                <p className="text-gray-500 mt-1">
                  Tiện ích hỗ trợ kiểm thử các luồng dài ngày mà không phải chờ thật.
                </p>
              </div>
              <SystemClockPanel />
            </div>
          )}

          {activeMenu === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {liveStats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                      </div>
                      <div className={`${stat.color} p-4 rounded-xl`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Đề xuất theo Track</h3>
                  {trackChart.length === 0 ? (
                    <p className="text-sm text-gray-400 py-12 text-center">Chưa có dữ liệu.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={trackChart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total" name="Tổng" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="passed" name="Đã duyệt" fill="#10b981" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Phễu xét duyệt (Funnel)</h3>
                  {funnelChart.length === 0 ? (
                    <p className="text-sm text-gray-400 py-12 text-center">Chưa có dữ liệu.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={funnelChart}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={100}
                          dataKey="value"
                          nameKey="name"
                        >
                          {funnelChart.map((entry) => (
                            <Cell key={`funnel-${entry.name}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
