/* ヘッダー */
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { createClientBrowser } from '@/lib/supabase/client'

export default function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClientBrowser(), [])

  if (pathname?.startsWith('/auth')) return null

  const handleLogout = async () => {
    const ok = typeof window !== 'undefined' ? window.confirm('ログオフしてもよろしいですか？') : true
    if (!ok) return
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }

  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-screen-lg items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold">たびのしおり</Link>
        </div>

        <nav className="flex items-center gap-3 text-sm">
          <Link className="rounded-md border border-orange-500 px-3 py-1.5 text-orange-700 hover:bg-orange-50" href="/trips/new">新規作成</Link>
          <Link className="rounded-md border border-orange-500 px-3 py-1.5 text-orange-700 hover:bg-orange-50" href="/trips">旅行一覧</Link>
          <button
            onClick={handleLogout}
            className="rounded-md border border-red-600 bg-red-600 px-3 py-1.5 text-white hover:bg-red-700"
            title="サインアウト後にログイン画面へ戻ります"
          >
            ログオフ
          </button>
        </nav>
      </div>
    </header>
  )
}

