'use client'

import { useRouter } from 'next/navigation'

type Props = {
  className?: string
  label?: string
}

export default function BackButton({ className = '', label = '戻る' }: Props) {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={[
        'group inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium',
        // outline base
        'border-orange-500 bg-white text-orange-700',
        // motion + focus
        'transition ease-out duration-200 motion-reduce:transition-none',
        'shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm active:scale-[0.98] motion-reduce:transform-none',
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