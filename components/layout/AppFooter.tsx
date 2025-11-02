/* フッター */
'use client'

import { usePathname } from 'next/navigation'
import BackButton from '@/components/ui/BackButton'

export default function AppFooter() {
  const pathname = usePathname()
  // '/trips' 一覧では戻るボタンを非表示。'/trips/...' 配下のみ表示。
  const showBack = !!pathname && pathname.startsWith('/trips/')
  const year = new Date().getFullYear()
  return (
    <footer className="mt-8">
      <div className="mx-auto flex max-w-screen-md items-center justify-between px-4 py-4 text-sm text-gray-500">
        <div>{showBack ? <BackButton /> : <span />}</div>
        {/* <div>© {year} りょこうアプリ</div> */}
      </div>
    </footer>
  )
}
