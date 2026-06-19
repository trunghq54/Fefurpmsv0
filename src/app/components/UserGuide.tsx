import { useState } from 'react'
import { useNavigate } from 'react-router'
import { BookOpen, Shield, Users, FileText, ClipboardCheck, ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface Step {
  step: string
  detail?: string
}
interface Section {
  title: string
  steps: Step[]
}

const GUIDES: Record<string, { label: string; icon: React.ElementType; color: string; sections: Section[] }> = {
  Admin: {
    label: 'Quản trị viên',
    icon: Shield,
    color: 'text-red-600 bg-red-50 border-red-200',
    sections: [
      {
        title: 'Quản lý người dùng',
        steps: [
          { step: 'Mở tab "Người dùng" trên thanh bên trái.' },
          { step: 'Bấm "Thêm người dùng" → điền Họ tên, Email, chọn vai trò (có thể chọn nhiều vai trò).' },
          { step: 'Bấm "Lưu". Người dùng mới sẽ đăng nhập lần đầu và được yêu cầu đổi mật khẩu.' },
          { step: 'Để cấp thêm vai trò hoặc vô hiệu hóa tài khoản: bấm "Sửa" trên dòng tương ứng.' },
        ],
      },
      {
        title: 'Tạo đợt nộp (Cycle) & Track',
        steps: [
          { step: 'Tab "Đợt nộp" → bấm "Tạo đợt nộp mới" → điền tên đợt, năm học, hạn nộp, hạn mức kinh phí → Lưu.' },
          { step: 'Bấm "Quản lý Track" trên đợt vừa tạo → thêm các track nghiên cứu → kích hoạt track.' },
          { step: 'Bấm "Kích hoạt đợt" để mở nộp đề xuất cho giảng viên.' },
          {
            step: 'Chỉ 1 đợt được kích hoạt tại một thời điểm. Huỷ kích hoạt đợt cũ trước khi tạo đợt mới.',
            detail: '',
          },
        ],
      },
      {
        title: 'Cấu hình tiêu chí chấm',
        steps: [
          { step: 'Tab "Tiêu chí chấm" → chọn loại vòng (Xét duyệt / Kiểm tra / Nghiệm thu).' },
          { step: 'Bấm "Thêm tiêu chí" → nhập tên tiêu chí, điểm tối đa → Lưu.' },
          { step: 'Kéo để sắp xếp thứ tự. Bấm mắt để ẩn/hiện.' },
          { step: 'Tiêu chí áp dụng ngay cho các vòng chấm tiếp theo.' },
        ],
      },
      {
        title: 'Xem & quản lý đề xuất',
        steps: [
          { step: 'Tab "Đề xuất" → bảng danh sách tất cả đề xuất kèm bộ lọc trạng thái / track / loại.' },
          { step: 'Bấm "Xem" để mở chi tiết: thông tin, kinh phí, thành viên, tài liệu đính kèm, kết quả các vòng.' },
          { step: '"Tóm tắt AI" → mở panel bên phải, bấm "Tóm tắt tài liệu" (cần Gemini API key).' },
        ],
      },
      {
        title: 'Phân công & kết thúc vòng',
        steps: [
          { step: 'Trong chi tiết đề xuất → mục "Vòng phản biện" → "Tạo vòng" → chọn loại vòng.' },
          { step: 'Bấm "Phân công" → chọn phản biện (vai trò Hội đồng phản biện) → Lưu.' },
          { step: 'Sau khi phản biện chấm xong → bấm "Kết thúc vòng & công bố kết quả" → xác nhận Đạt/Không đạt.' },
          { step: 'Kết quả tự động cập nhật trạng thái đề xuất (Đã duyệt / Đã từ chối).' },
        ],
      },
      {
        title: 'Xem phân tích & thống kê',
        steps: [
          { step: 'Tab "Tổng quan" → biểu đồ: số đề xuất theo trạng thái, phân bổ theo track, kênh chuyển tiếp.' },
          { step: 'Lọc theo đợt nộp để so sánh giữa các năm.' },
        ],
      },
      {
        title: 'Đổi vai trò',
        steps: [
          { step: 'Bấm biểu tượng đổi vai trò ở góc trên bên phải (chỉ hiện khi bạn có nhiều vai trò).' },
          { step: 'Chọn vai trò muốn chuyển → hệ thống điều hướng sang giao diện tương ứng.' },
        ],
      },
    ],
  },
  Staff: {
    label: 'Cán bộ',
    icon: Users,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    sections: [
      {
        title: 'Xem & quản lý đề xuất',
        steps: [
          { step: 'Tab "Đề xuất & Phân công" → bảng đề xuất toàn hệ thống.' },
          { step: 'Bấm "Xem" để mở chi tiết, xem tài liệu và kết quả các vòng.' },
        ],
      },
      {
        title: 'Phân công phản biện',
        steps: [
          { step: 'Mở chi tiết đề xuất → mục "Vòng phản biện" → bấm "Tạo vòng" (nếu chưa có).' },
          { step: 'Bấm "Phân công" → chọn người dùng có vai trò Hội đồng phản biện.' },
          { step: 'Lưu. Phản biện nhận thông báo và cần xác nhận nhận nhiệm vụ.' },
        ],
      },
      {
        title: 'Kết thúc vòng',
        steps: [
          { step: 'Sau khi đủ phiếu chấm → bấm "Kết thúc vòng & công bố kết quả" → chọn Đạt/Không đạt.' },
          { step: 'Trạng thái đề xuất cập nhật tự động.' },
        ],
      },
      {
        title: 'Lịch họp hội đồng',
        steps: [
          { step: 'Tab "Họp hội đồng" → xem danh sách cuộc họp.' },
          { step: 'Bấm "Tạo cuộc họp" → chọn vòng, thời gian, link họp trực tuyến.' },
        ],
      },
      {
        title: 'Đổi vai trò',
        steps: [{ step: 'Bấm biểu tượng đổi vai trò ở góc trên bên phải (khi có nhiều vai trò).' }],
      },
    ],
  },
  Faculty: {
    label: 'Giảng viên (Chủ nhiệm đề tài)',
    icon: FileText,
    color: 'text-green-600 bg-green-50 border-green-200',
    sections: [
      {
        title: 'Tạo đề xuất mới',
        steps: [
          { step: 'Trang chủ Faculty → bấm "Tạo đề xuất mới" (hoặc đảm bảo đang ở chế độ tạo mới).' },
          {
            step: 'Bước 1 – Thông tin: điền tên đề tài (VI/EN), chọn Track, loại nghiên cứu, thời gian, mục tiêu, phương pháp, sản phẩm dự kiến.',
          },
          { step: 'Bước 2 – Thành viên: bấm "Thêm thành viên" → điền họ tên, vai trò, số tháng tham gia.' },
          { step: 'Bước 3 – Kinh phí: bấm "Thêm khoản" → điền hạng mục và số tiền. Theo dõi thanh hạn mức.' },
          {
            step: 'Bước 4 – Tài liệu: chọn loại tài liệu (Thuyết minh / Lý lịch / Khác) → "Chọn file" → tải lên nhiều file.',
          },
          { step: 'Bước 5 – Xem lại & Lưu nháp: kiểm tra tóm tắt → bấm "Lưu nháp".' },
          { step: 'Biểu mẫu tự động lưu nháp trên trình duyệt (F5 không mất dữ liệu).' },
        ],
      },
      {
        title: 'Gửi duyệt đề xuất',
        steps: [
          { step: 'Tab "Đề xuất của tôi" → tìm đề xuất ở trạng thái Nháp.' },
          { step: 'Bấm "Gửi duyệt" → trạng thái chuyển sang Đã gửi.' },
          { step: 'Bấm "Rút lại" nếu muốn chỉnh sửa trước khi được xét duyệt.' },
        ],
      },
      {
        title: 'Thêm tài liệu sau khi lưu',
        steps: [
          { step: 'Tab "Đề xuất của tôi" → bấm "Tài liệu" trên đề xuất tương ứng.' },
          { step: 'Chọn loại tài liệu → bấm "Tải lên" → chọn file.' },
        ],
      },
      {
        title: 'Theo dõi kết quả',
        steps: [
          { step: 'Bấm "Kết quả" trên đề xuất → xem điểm và nhận xét từng vòng phản biện.' },
          { step: 'Kết quả chỉ hiển thị sau khi vòng được kết thúc bởi Admin/Staff.' },
        ],
      },
      {
        title: 'Yêu cầu thay đổi',
        steps: [
          {
            step: 'Bấm "Yêu cầu thay đổi" trên đề xuất đã gửi → chọn loại (Gia hạn / Thay đổi nội dung / Nhân sự / Kinh phí / Tạm dừng).',
          },
          { step: 'Nhập mô tả lý do → Gửi yêu cầu. Admin sẽ phê duyệt.' },
        ],
      },
      {
        title: 'Đổi vai trò',
        steps: [
          {
            step: 'Bấm biểu tượng đổi vai trò ở góc trên bên phải (khi có nhiều vai trò, VD vừa là Faculty vừa là ReviewCommittee).',
          },
        ],
      },
    ],
  },
  ReviewCommittee: {
    label: 'Hội đồng phản biện',
    icon: ClipboardCheck,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    sections: [
      {
        title: 'Xem & xác nhận phân công',
        steps: [
          { step: 'Trang Reviewer Portal → danh sách "Phân công của tôi".' },
          { step: 'Bấm "Nhận" để xác nhận hoặc "Từ chối" để từ chối phân công.' },
          { step: 'Sau khi nhận phân công, bấm "Chấm điểm" để mở màn hình chấm.' },
        ],
      },
      {
        title: 'Chấm điểm (Vòng Xét duyệt / Kiểm tra)',
        steps: [
          {
            step: 'Màn hình chấm: phần trên hiển thị đầy đủ thông tin đề xuất — tiêu đề, chủ nhiệm, mục tiêu, phương pháp, thành viên, kinh phí, và tài liệu đính kèm.',
          },
          { step: 'Bấm vào tên file để tải xuống thuyết minh PDF và đọc trước khi chấm.' },
          { step: 'Bấm "✨ AI gợi ý" bên cạnh từng tiêu chí để nhận gợi ý nhận xét từ AI (cần Gemini API key).' },
          { step: 'Điều chỉnh thanh điểm cho từng tiêu chí; xem tổng điểm cập nhật real-time.' },
          { step: 'Nhập nhận xét vào ô "Nhận xét" (tự nhập hoặc dùng gợi ý AI).' },
          { step: 'Bấm "Nộp điểm" để lưu. Có thể nộp lại nhiều lần trước khi vòng kết thúc.' },
        ],
      },
      {
        title: 'Phiếu nghiệm thu (Vòng Nghiệm thu)',
        steps: [
          { step: 'Màn hình chấm → mục "Phiếu nghiệm thu".' },
          { step: 'Chọn Kết luận: Đạt / Không đạt / Đạt xuất sắc.' },
          { step: 'Nếu vai trò Phản biện (Opponent): điền thêm điểm 4 tiêu chí (thang 1–5).' },
          { step: 'Nhập nhận xét phản biện → bấm "Nộp phiếu".' },
        ],
      },
      {
        title: 'Xem tóm tắt AI của đề xuất',
        steps: [
          { step: 'Trong màn hình chấm → bấm nút "Tóm tắt AI" ở phần thông tin đề xuất.' },
          { step: 'Panel bên phải mở ra → bấm "Tóm tắt tài liệu" để AI tóm tắt thuyết minh.' },
          { step: 'Có thể chỉnh sửa và lưu nội dung tóm tắt.' },
        ],
      },
      {
        title: 'Đổi vai trò',
        steps: [{ step: 'Bấm biểu tượng đổi vai trò ở góc trên bên phải (khi có nhiều vai trò).' }],
      },
    ],
  },
}

function SectionBlock({ section, idx }: { section: Section; idx: number }) {
  const [expanded, setExpanded] = useState(idx === 0)
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition text-left"
      >
        <span className="font-medium text-gray-800">{section.title}</span>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {expanded && (
        <div className="px-5 py-4 space-y-3 bg-white">
          {section.steps.map((s, i) => (
            <div key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-gray-700">{s.step}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function UserGuide() {
  const navigate = useNavigate()
  const { activeRole } = useAuth()
  const defaultRole = activeRole && GUIDES[activeRole] ? activeRole : 'Admin'
  const [selectedRole, setSelectedRole] = useState(defaultRole)

  const guide = GUIDES[selectedRole]
  const Icon = guide.icon

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-500" /> Hướng dẫn sử dụng FURPMS
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">Hướng dẫn theo vai trò — chọn vai trò của bạn bên dưới</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Role selector */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(GUIDES).map(([role, g]) => {
            const GIcon = g.icon
            const active = selectedRole === role
            return (
              <button
                key={role}
                onClick={() => setSelectedRole(role as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition ${
                  active ? `${g.color} border-current` : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <GIcon className="w-4 h-4" /> {g.label}
              </button>
            )
          })}
        </div>

        {/* Guide header */}
        <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border ${guide.color}`}>
          <Icon className="w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-semibold">Hướng dẫn cho: {guide.label}</p>
            <p className="text-sm opacity-70">{guide.sections.length} chủ đề · Bấm vào từng chủ đề để xem chi tiết</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          {guide.sections.map((section, idx) => (
            <SectionBlock key={idx} section={section} idx={idx} />
          ))}
        </div>
      </div>
    </div>
  )
}
