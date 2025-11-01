'use client'

import { useRouter } from 'next/navigation'

type Props = {
  className?: string
  label?: string
}

export default function BackButton({ className, label = '戻る' }: Props) {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={[
        'inline-flex items-center gap-2 rounded border px-3 py-1 text-sm',
        'border-orange-500 text-orange-700 bg-white hover:bg-orange-50 active:bg-orange-100',
        className,
      ].filter(Boolean).join(' ')}
      aria-label={label}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-4 w-4"
        aria-hidden
      >
        <path d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
      {label}
    </button>
  )
}

