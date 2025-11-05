// app/layout.tsx
import "@/styles/globals.css"
import type { Metadata } from "next"
import AppHeader from "@/components/layout/AppHeader"
import AppFooter from "@/components/layout/AppFooter"
import FloatingBackButton from "@/components/ui/FloatingBackButton"
// import { ToastHost } from "@/components/feedback/ToastHost"

export const metadata: Metadata = {
  title: "Travel App",
  description: "��傱���A�v�� MVP",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <AppHeader />

        <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8">
          <main className="py-6">{children}</main>
        </div>

        {/* <ToastHost /> */}

        {/* 画面左下の戻る（/trips/... のみ表示）: デスクトップ中心 */}
        <FloatingBackButton className="hidden sm:flex" href="/trips" />

        {process.env.NODE_ENV !== 'production' && (
          <a href="/" className="fixed bottom-4 right-4 z-[60] rounded-md border bg-white px-3 py-2 text-xs shadow">
            Go LP
          </a>
        )}

        <AppFooter />
      </body>
    </html>
  )
}


