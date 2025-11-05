/* AppHeader */

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { createClientBrowser } from '@/lib/supabase/client'

export default function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClientBrowser(), [])
  const [menuOpen, setMenuOpen] = useState(false)

  // 認証ページではヘッダー非表示
  if (pathname?.startsWith('/auth')) return null

  const handleLogout = async () => {
    const ok = typeof window !== 'undefined' ? window.confirm('ログアウトしますか？') : true
    if (!ok) return
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }

  const linkBase = [
    'inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium',
    // smoother interactions: color + transform + shadow
    'transition ease-out duration-200 motion-reduce:transition-none',
    'shadow-sm hover:shadow-lg',
    'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none',
    // focus ring
    'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1',
  ].join(' ')

  const isActive = (path: string) => {
    if (!pathname) return false
    if (path === '/trips') return pathname === '/trips' || pathname.startsWith('/trips/')
    return pathname === path
  }

  const navClass = (path: string) => [
    linkBase,
    isActive(path)
      ? 'border-orange-500 bg-orange-500 text-white'
      : 'border-orange-500 bg-white text-orange-700 hover:bg-orange-500 hover:text-white hover:border-transparent active:bg-orange-600',
  ].join(' ')

  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-md supports-backdrop-blur:backdrop-blur-md ring-1 ring-gray-900/5">
      <div className="mx-auto flex max-w-screen-lg items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 font-bold text-gray-900 transition-colors ease-out duration-200"
            title="ホーム"
          >
            <span className="inline-block translate-y-[0.5px]">🏝️</span>
            <span>Travel App</span>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-sm sm:hidden"
          aria-label="メニュー"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
          </svg>
        </button>

        <nav className="hidden items-center gap-3 text-sm sm:flex">
          <Link
            className={[navClass('/guide'), 'mr-6 sm:mr-8'].join(' ')}
            href="/guide"
            aria-current={isActive('/guide') ? 'page' : undefined}
            aria-label="ガイド"
            title="ガイド"
          >
            ガイド
          </Link>
          <Link
            className={navClass('/trips/new')}
            href="/trips/new"
            aria-current={isActive('/trips/new') ? 'page' : undefined}
          >
            新規作成
          </Link>
          <Link
            className={navClass('/trips')}
            href="/trips"
            aria-current={isActive('/trips') ? 'page' : undefined}
          >
            旅の一覧
          </Link>
          {pathname === '/' && (
            <Link
              href="/auth/login"
              className={[linkBase, 'border-gray-900 bg-gray-900 text-white hover:bg-black focus:ring-gray-900'].join(' ')}
              title="ログイン"
            >
              ログイン
            </Link>
          )}
          {pathname !== '/' && (
            <button
              onClick={handleLogout}
              className={[linkBase, 'border-gray-900 bg-gray-900 text-white hover:bg-black focus:ring-gray-900'].join(' ')}
              title="サインアウト"
              type="button"
            >
              ログアウト
            </button>
          )}
        </nav>
      </div>
      {/* Mobile dropdown nav */}
      {menuOpen && (
        <div id="mobile-nav" className="sm:hidden border-t bg-white/95 supports-backdrop-blur:backdrop-blur">
          <div className="mx-auto max-w-screen-lg px-4 py-2">
            <div className="flex flex-col gap-2">
              <Link className={navClass('/guide')} href="/guide" onClick={() => setMenuOpen(false)}>
                ガイド
              </Link>
              <Link className={navClass('/trips/new')} href="/trips/new" onClick={() => setMenuOpen(false)}>
                新規作成
              </Link>
              <Link className={navClass('/trips')} href="/trips" onClick={() => setMenuOpen(false)}>
                旅の一覧
              </Link>
              {pathname === '/' && (
                <Link
                  href="/auth/login"
                  className={[linkBase, 'border-gray-900 bg-gray-900 text-white hover:bg-black focus:ring-gray-900'].join(' ')}
                  onClick={() => setMenuOpen(false)}
                >
                  ログイン
                </Link>
              )}
              {pathname !== '/' && (
                <button
                  onClick={async () => { await handleLogout(); setMenuOpen(false) }}
                  className={[linkBase, 'border-gray-900 bg-gray-900 text-white hover:bg-black focus:ring-gray-900'].join(' ')}
                  type="button"
                >
                  ログアウト
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
