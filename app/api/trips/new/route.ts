// app/api/trips/new/route.ts // 旅の新規作成ウィザードAPI
import { NextRequest, NextResponse } from "next/server" // Next.js の型
import { createServer } from "@/lib/supabase/server" // サーバー側Supabaseクライアント

type WizardPayload = { // 受け取るボディの型
  title?: string // タイトル
  start_date?: string | null // 開始日(スネークケース)
  end_date?: string | null // 終了日(スネークケース)
  startDate?: string | null // 開始日(キャメルケース)
  endDate?: string | null // 終了日(キャメルケース)
  participants?: string[] // 参加者メール
  budget?: { amount?: number; currency?: string } // 予算
  share?: { public?: boolean } // 公開設定
}

export async function POST(req: NextRequest) { // 新規作成ハンドラ
  const { supabase, applyPendingCookies } = await createServer() // クライアントとCookie適用関数

  const authHeader = req.headers.get("authorization") ?? "" // Authorizationヘッダー
  const token = authHeader.replace(/^Bearer\s+/i, "") || undefined // Bearerトークン抽出

  // 認証ユーザー（Cookie もしくは Bearer）
  let { data: { user }, error: userErr } = await supabase.auth.getUser() // Cookieで取得
  if ((!user || userErr) && token) { // CookieでNGかつトークンがある
    const r = await supabase.auth.getUser(token) // トークンで取得
    user = r.data.user // ユーザー
    userErr = r.error // エラー
  }
  if (userErr || !user) { // 未認証
    const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 }) // 401返却
    applyPendingCookies?.(res) // Cookie適用
    return res // 終了
  }

  const body = (await req.json().catch(() => ({}))) as WizardPayload // ボディ取得（失敗時は空）
  const title = body.title?.trim() // タイトル整形
  if (!title) { // タイトル必須
    const res = NextResponse.json({ error: "�^�C�g������͂��Ă�������" }, { status: 400 }) // 400返却
    applyPendingCookies?.(res) // Cookie適用
    return res // 終了
  }

  const startDate = body.start_date ?? body.startDate ?? null // 開始日
  const endDate = body.end_date ?? body.endDate ?? null // 終了日

  // 1) trips 作成（owner_id）
  const { data: trip, error: tripErr } = await supabase // 挿入実行
    .from("trips") // テーブル
    .insert({ title, start_date: startDate, end_date: endDate, owner_id: user.id }) // 行
    .select("id") // id取得
    .single() // 単一行
  if (tripErr || !trip) { // 失敗
    const res = NextResponse.json({ error: tripErr?.message ?? "Failed to create trip" }, { status: 400 }) // 400
    applyPendingCookies?.(res) // Cookie適用
    return res // 終了
  }

  const tripId = trip.id as string // 作成されたtripのID

  // 2) 参加者（メール）からUUIDを引いて trip_members に登録
  const participants = (body.participants ?? []) // 参加者配列
    .map((x) => (typeof x === "string" ? x.trim().toLowerCase() : "")) // 正規化
    .filter((x) => x) // 空を除外

  if (participants.length > 0) { // 参加者がいれば
    try { // 管理APIでユーザーIDを解決
      const admin = (await import("@/lib/supabase/admin")).createAdmin() // 管理クライアント
      const listed = await admin.auth.admin.listUsers() // ユーザー一覧
      const userIds = (listed.data?.users ?? []) // ユーザー配列
        .filter(u => participants.includes((u.email ?? "").toLowerCase())) // メール一致
        .map(u => u.id) // IDを抽出
      if (userIds.length > 0) { // 見つかったら
        const rows = userIds.map((uid) => ({ trip_id: tripId, user_id: uid, role: "viewer" as const })) // 追加行
        await supabase.from("trip_members").insert(rows) // バルク挿入
      }
    } catch (e: unknown) { // 失敗時は警告付きで成功扱い
      const message = e instanceof Error ? e.message : String(e) // メッセージ
      const res = NextResponse.json({ id: tripId, warning: `members: ${message || 'lookup failed'}` }, { status: 201 }) // 201
      applyPendingCookies?.(res) // Cookie適用
      return res // 終了
    }
  }

  // 3) 公開設定（シェアリンクの有効化）
  const enablePublic = !!body.share?.public // 真偽値
  if (enablePublic) { // 公開する場合
    await supabase.from("share_links").insert({ trip_id: tripId, is_enabled: true }).select("id").maybeSingle() // upsert相当
  }

  // 4) 予算 upsert
  if (body.budget && (typeof body.budget.amount === "number" || body.budget.currency)) { // 予算あり
    const amount = typeof body.budget.amount === "number" ? body.budget.amount : 0 // 金額
    const currency = body.budget.currency ?? "JPY" // 通貨
    try { // upsert実行
      await supabase.from("budgets").upsert(
        { trip_id: tripId, amount, currency }, // 値
        { onConflict: "trip_id" } // 衝突キー
      )
    } catch { // 失敗は無視
      // ignore
    }
  }

  const res = NextResponse.json({ id: tripId }, { status: 201 }) // 作成成功レスポンス
  applyPendingCookies?.(res) // Cookie適用
  return res // 返却
}

