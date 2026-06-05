import { useState, useRef, useEffect } from 'react'
import { Repeat, ChevronDown, Check } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { ROLE_LABEL } from '../../types/user'

export default function RoleSwitcher() {
  const { roles, activeRole, switchRole } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!roles || roles.length <= 1) return null
  const current = activeRole || roles[0]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        title="Đổi vai trò"
      >
        <Repeat className="w-4 h-4 text-blue-600" />
        <span className="font-medium text-gray-700">{ROLE_LABEL[current] || current}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-100">Chuyển vai trò</div>
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => { switchRole(r); setOpen(false) }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 ${r === current ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
            >
              {ROLE_LABEL[r] || r}
              {r === current && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
