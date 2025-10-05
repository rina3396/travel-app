'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import { createClientBrowser } from '@/lib/supabase/client'
// 任意: あれば自作のUIボタンを使う。なければ <button> に置換OK
import { Button } from '@/components/ui/Button'

export default function AppHeader() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = useMemo(() => createClientBrowser(), [])
    const [loading, setLoading] = useState(false)

    // /auth/* ではヘッダーを出さない
    if (pathname?.startsWith('/auth')) return null

    const handleLogout = async () => {
        try {
            setLoading(true)
            await supabase.auth.signOut()
            // セッションを切ったらログイン画面へ
            router.replace('/auth/login')
        } catch (e) {
            console.error('Failed to sign out', e)
            // 失敗しても最終的にはログイン画面へ逃がす
            router.replace('/auth/login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <header className="w-full border-b">
            <div className="mx-auto max-w-screen-lg px-4 py-3 flex items-center justify-between">
                <Link href="/" className="font-bold">
                    りょこうアプリ
                </Link>

                <nav className="flex items-center gap-3">
                    {/* 例: 必要ならナビを追加 */}
                    <Link className="underline text-sm" href="/trips/new">新規作成</Link>

                    <Button
                        onClick={handleLogout}
                        disabled={loading}
                        aria-label="ログアウト"
                        title="ログアウト"
                    >
                        {loading ? 'ログアウト中…' : 'ログアウト'}
                    </Button>
                </nav>
            </div>
        </header>
    )
}
