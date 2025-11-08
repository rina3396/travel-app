import Link from 'next/link'
import "@/styles/globals.css" // グローバルCSSを読み込む
import type { Metadata } from "next" // Next.js のメタデータ型をインポート
import AppHeader from "@/components/layout/AppHeader" // 共通ヘッダーコンポーネント
import AppFooter from "@/components/layout/AppFooter" // 共通フッターコンポーネント
import FloatingBackButton from "@/components/ui/FloatingBackButton" // フローティング戻るボタン
// import { ToastHost } from "@/components/feedback/ToastHost" // トースト通知のホスト（未使用）

export const metadata: Metadata = {
  title: "Travel App", // 既定のページタイトル
  description: "旅行アプリ MVP", // サイトの説明
}

export default function RootLayout({ children }: { children: React.ReactNode }) { // ルートレイアウトコンポーネント
  return ( // コンポーネントの描画内容
    <html lang="ja" suppressHydrationWarning> {/* 言語を日本語に設定・水和時警告を抑制 */}
      <body className="min-h-dvh bg-background text-foreground antialiased"> {/* 最小高さとテーマの適用 */}
        <AppHeader /> {/* アプリ共通のヘッダー */}

        <div className="mx-auto max-w-screen-lg px-4 sm:px-6 lg:px-8"> {/* コンテンツの中央寄せコンテナ */}
          <main className="py-6">{children}</main> {/* 子ページの内容を表示 */}
        </div>

        {/* <ToastHost /> */} {/* トースト通知（必要時に有効化） */}

        {/* 戻るボタン（/trips へ戻る・デスクトップで表示） */}
        <FloatingBackButton className="hidden sm:flex" href="/trips" /> {/* フローティング戻るボタン */}

        {process.env.NODE_ENV !== 'production' && ( /* 本番以外の環境でLPへのリンクを表示 */
          <Link href="/" className="fixed bottom-4 right-4 z-[60] rounded-md border bg-white px-3 py-2 text-xs shadow"> {/* LPへの固定リンク */}
            Go LP {/* リンクテキスト */}
          </Link>
        )}

        <AppFooter /> {/* アプリ共通のフッター */}
      </body>
    </html>
  )
}



