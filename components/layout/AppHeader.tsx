'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { createClientBrowser } from '@/lib/supabase/client'
import BackButton from '@/components/ui/BackButton'

export default function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClientBrowser(), [])

  if (pathname?.startsWith('/auth')) return null

  const handleLogout = async () => {
    const ok = typeof window !== 'undefined' ? window.confirm('ログアウトしてもよろしいですか？') : true
    if (!ok) return
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }

  const showBack = pathname?.startsWith('/trips')

  return (
    <header className="w-full border-b">
      <div className="mx-auto flex max-w-screen-lg items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {showBack && <BackButton />}
          <Link href="/" className="font-bold">旅アプリ</Link>
        </div>

        <nav className="flex items-center gap-3 text-sm">
          <Link className="underline" href="/trips/new">新規作成</Link>
          <Link className="underline" href="/trips">旅の一覧</Link>
          <button
            onClick={handleLogout}
            className="rounded border px-3 py-1"
            title="サインアウト後にログイン画面へ戻ります"
          >
            ログアウト
          </button>
        </nav>
      </div>
    </header>
  )
}

