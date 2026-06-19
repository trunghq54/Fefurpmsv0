import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2, X } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// gộp class Tailwind (xử lý xung đột) — thay cho ./ui/utils đã gỡ.
const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

// ── ui-kit ──────────────────────────────────────────────────────────────────
// Lớp primitive dùng chung cho các màn hình (thay cho việc lặp class Tailwind
// thô khắp nơi). Giữ đúng phong cách hiện tại (xám trung tính + xanh primary +
// xanh lá / đỏ semantic) — đổi 1 chỗ áp dụng toàn bộ. Tham chiếu pattern
// "extract components" (Tailwind docs) + cva (class-variance-authority).

// Button -----------------------------------------------------------------------
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:opacity-60 disabled:pointer-events-none whitespace-nowrap',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        success: 'bg-green-600 text-white hover:bg-green-700',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
        ghost: 'text-gray-600 hover:bg-gray-100',
        warning: 'bg-amber-600 text-white hover:bg-amber-700',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5',
        icon: 'p-2',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export function Button({ className, variant, size, loading, disabled, children, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}

// Card -------------------------------------------------------------------------
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200', className)} {...props}>
      {children}
    </div>
  )
}

// Badge ------------------------------------------------------------------------
const badgeVariants = cva('inline-block px-2 py-0.5 rounded-full text-xs font-medium', {
  variants: {
    tone: {
      gray: 'bg-gray-100 text-gray-700',
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800',
    },
  },
  defaultVariants: { tone: 'gray' },
})
export function Badge({
  tone,
  className,
  children,
}: VariantProps<typeof badgeVariants> & { className?: string; children: React.ReactNode }) {
  return <span className={cn(badgeVariants({ tone }), className)}>{children}</span>
}

// Form controls ----------------------------------------------------------------
const controlCls =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(controlCls, className)} {...props} />,
)
Input.displayName = 'Input'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(controlCls, 'resize-y', className)} {...props} />,
)
Textarea.displayName = 'Textarea'

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(controlCls, className)} {...props}>
      {children}
    </select>
  ),
)
Select.displayName = 'Select'

export function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('block text-sm font-medium text-gray-700 mb-1', className)} {...props}>
      {children}
    </label>
  )
}

// Field = Label + control (children) -------------------------------------------
export function Field({
  label,
  children,
  className,
}: {
  label: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
    </div>
  )
}

// States -----------------------------------------------------------------------
export function Spinner({ text, className }: { text?: string; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-16 text-gray-400', className)}>
      <Loader2 className="w-5 h-5 animate-spin mr-2" /> {text || 'Đang tải...'}
    </div>
  )
}

export function EmptyState({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400', className)}>
      {children}
    </div>
  )
}

// Modal — shell chung cho dialog (header + body + footer). `className` để chỉnh max-width panel.
export function Modal({
  title,
  onClose,
  children,
  footer,
  className,
}: {
  title: React.ReactNode
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={cn('bg-white rounded-2xl shadow-2xl w-full max-w-md', className)}>
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
        {footer && <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  )
}
