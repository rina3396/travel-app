// app/layout.tsx
import "@/styles/globals.css"
import type { Metadata } from "next"
import AppHeader from "@/components/layout/AppHeader"
import AppFooter from "@/components/layout/AppFooter"
// import { ToastHost } from "@/components/feedback/ToastHost"

export const metadata: Metadata = {
  title: "Travel App",
  description: "りょこうアプリ MVP",
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

        <AppFooter />
      </body>
    </html>
  )
}
