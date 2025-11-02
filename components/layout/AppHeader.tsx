/* AppHeader */
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { createClientBrowser } from '@/lib/supabase/client'

export default function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClientBrowser(), [])

  // 認証画面ではヘッダーを非表示
  if (pathname?.startsWith('/auth')) return null

  const handleLogout = async () => {
    const ok = typeof window !== 'undefined' ? window.confirm('ログアウトしてもよろしいですか？') : true
    if (!ok) return
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }

  const linkBase = [
    'inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium',
    'transition ease-out duration-200 motion-reduce:transition-none',
    'shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm active:scale-[0.98]',
    'motion-reduce:transform-none focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1',
  ].join(' ')

  return (
    <header className="w-full border-b bg-white/95 supports-backdrop-blur:backdrop-blur">
      <div className="mx-auto flex max-w-screen-lg items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-bold text-gray-900 transition ease-out duration-200"
            title="ホームへ"
          >
            <span className="inline-block translate-y-[0.5px] transition-transform group-hover:-translate-y-0.5">🧭</span>
            <span className="transition-transform group-hover:-translate-y-0.5">旅のしおり</span>
          </Link>
        </div>

        <nav className="flex items-center gap-3 text-sm">
          <Link
            className={[linkBase, 'border-orange-500 bg-white text-orange-700 hover:bg-orange-500 hover:text-white hover:border-transparent active:bg-orange-600'].join(' ')}
            href="/trips/new"
          >
            新規作成
          </Link>
          <Link
            className={[linkBase, 'border-orange-500 bg-white text-orange-700 hover:bg-orange-500 hover:text-white hover:border-transparent active:bg-orange-600'].join(' ')}
            href="/trips"
          >
            旅行一覧
          </Link>
          <button
            onClick={handleLogout}
            className={[linkBase, 'border-red-600 bg-red-600 text-white hover:bg-red-700'].join(' ')}
            title="サインアウト後にログイン画面へ戻ります"
            type="button"
          >
            ログアウト
          </button>
        </nav>
      </div>
    </header>
  )
}