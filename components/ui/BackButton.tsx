'use client'

import { useRouter } from 'next/navigation'

type Props = {
  className?: string
  label?: string
  href?: string // フォールバック先（履歴がない場合）
}

export default function BackButton({ className = '', label = '戻る', href }: Props) {
  const router = useRouter()
  const handleClick = () => {
    if (typeof window !== 'undefined') {
      const hasHistory = window.history.length > 1
      const ref = document.referrer || ''
      const sameOrigin = ref && ref.startsWith(window.location.origin)
      if (hasHistory && sameOrigin) {
        router.back()
        return
      }
    }
    router.push(href || '/trips')
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        'group inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium',
        // outline base
        'border-orange-500 bg-white text-orange-700',
        // motion + focus
        'transition-colors ease-out duration-200 motion-reduce:transition-none',
        'shadow-sm hover:shadow-md active:shadow-sm',
        // hover invert (no double border)
        'hover:bg-orange-500 hover:text-white hover:border-transparent active:bg-orange-600',
        'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1',
        className,
      ].filter(Boolean).join(' ')}
      aria-label={label}
      title={label}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
        aria-hidden
      >
        <path d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
      <span className="transition-transform group-hover:-translate-x-0.5">{label}</span>
    </button>
  )
}

