// app/page.tsx // ルート(LP)ページ
import { redirect } from "next/navigation" // ルーターのリダイレクト関数
import { createServer } from "@/lib/supabase/server" // サーバー側のSupabaseクライアント生成
import Landing from "@/components/marketing/Landing" // ランディングページコンポーネント

export default async function HomePage() { // ルートページのサーバーコンポーネント
  const { supabase } = await createServer() // サーバー環境のSupabaseクライアントを作成
  const { data: { user } } = await supabase.auth.getUser() // 認証済みユーザーを取得

  if (user) { // ユーザーが存在する場合
    redirect("/trips") // トリップ一覧へリダイレクト
  }

  return <Landing /> // 未ログインの場合はLPを表示
}
