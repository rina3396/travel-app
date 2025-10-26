'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AppHeader() {
    const pathname = usePathname()

    if (pathname?.startsWith('/auth')) return null

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
                        旅程一覧
                    </Link>
                </nav>
            </div>
        </header>
    )
}
