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
        await supabase.auth.signOut()
        router.replace('/auth/login')
    }

    return (
        <header className="w-full border-b">
            <div className="mx-auto flex max-w-screen-lg items-center justify-between px-4 py-3">
                <Link href="/" className="font-bold">
                    りょこうアプリ
                </Link>

                <nav className="flex items-center gap-3 text-sm">
                    <Link className="underline" href="/trips/new">
                        新規作成
                    </Link>
                    <Link className="underline" href="/trips">
                        旅の一覧
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="rounded border px-3 py-1"
                        title="サインアウトしてログイン画面に戻ります"
                    >
                        ログオフ
                    </button>
                </nav>
            </div>
        </header>
    )
}
