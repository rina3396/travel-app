// app/layout.tsx
import "@/styles/globals.css"
import type { Metadata } from "next"
import AppHeader from "@/components/layout/AppHeader"
// import { ToastHost } from "@/components/feedback/ToastHost"

export const metadata: Metadata = {
  title: "Travel App",
  description: "りょこうアプリ MVP",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // 共通レイアウト（ヘッダー/フッター/トーストなどをここで）
  return (
    <html lang="ja">
      <body className="min-h-dvh bg-white text-gray-900">
        {/* --- 共通ヘッダー --- */}
        <AppHeader />

        <div className="mx-auto max-w-screen-md p-4">
          <main className="py-4">{children}</main>
        </div>

        {/* --- 共通トースト領域（必要に応じて） --- */}
        {/* <ToastHost /> */}

        {/* --- 共通フッター --- */}
        <footer className="mt-8 text-center text-sm text-gray-500 border-t pt-4">
          © {new Date().getFullYear()} りょこうアプリ
        </footer>
      </body>
    </html>
  )
}
