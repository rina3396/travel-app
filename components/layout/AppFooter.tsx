/* AppFooter */
'use client'

import { usePathname } from 'next/navigation'
import BackButton from '@/components/ui/BackButton'

export default function AppFooter() {
  const pathname = usePathname()
  const showBack = !!pathname && pathname.startsWith('/trips/')
  return (
    <footer className="mt-8">
      <div className="mx-auto flex max-w-screen-md items-center justify-between px-4 py-4 text-sm text-gray-600">
        <div>{showBack ? <BackButton className="sm:hidden" href="/trips" /> : <span />}</div>
      </div>
    </footer>
  )
}

