import { ShieldCheck, Briefcase, GraduationCap, Gavel, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import type { RoleName } from '../../types/auth'
import { ROLE_LABEL } from '../../types/user'

const ROLE_ICON: Record<string, any> = {
  Admin: ShieldCheck,
  Staff: Briefcase,
  Faculty: GraduationCap,
  ReviewCommittee: Gavel,
}
const ROLE_DESC: Record<string, string> = {
  Admin: 'Quản trị hệ thống, người dùng, đợt nộp',
  Staff: 'Quản lý hội đồng, phân công, lịch họp',
  Faculty: 'Nộp & theo dõi đề xuất nghiên cứu',
  ReviewCommittee: 'Phản biện & chấm điểm đề xuất',
}

export default function SelectRole() {
  const { user, roles, switchRole, logout } = useAuth()
  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Xin chào, {user.fullName}</h1>
          <p className="text-gray-500 mt-2">Tài khoản của bạn có nhiều vai trò — chọn vai trò để tiếp tục</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {roles.map((r: RoleName) => {
            const Icon = ROLE_ICON[r] || ShieldCheck
            return (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-md hover:border-blue-400 transition group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">{ROLE_LABEL[r] || r}</h3>
                </div>
                <p className="text-sm text-gray-500">{ROLE_DESC[r]}</p>
              </button>
            )
          })}
        </div>
        <div className="text-center mt-6">
          <button onClick={logout} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600">
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      </div>
    </div>
  )
}
