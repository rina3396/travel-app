// app/trips/[tripId]/share/page.tsx // 共有・メンバー管理（クライアント）
"use client" // クライアントコンポーネント

import { useEffect, useMemo, useState, use as usePromise } from "react" // Reactフック
import { createClientBrowser } from "@/lib/supabase/client" // ブラウザ用Supabase
import type { DbMember, DbShareLink } from "@/types/trips" // 型
import Button from "@/components/ui/Button" // ボタン
import Card from "@/components/ui/Card" // カード
import Skeleton from "@/components/ui/Skeleton" // スケルトン

// use shared Db types // 共通型をエイリアス
type Member = DbMember // メンバー型
type ShareLink = DbShareLink // シェアリンク型

// NOTE: placeholder to avoid unresolved identifier in disabled code paths // サンプル用プレースホルダ
const id: string = "" // ダミーID

export default function TripSharePage({ params }: { params: Promise<{ tripId: string }> }) { // ページ本体
  const { tripId } = usePromise(params) // ルートパラメータ
  const supabase = useMemo(() => createClientBrowser(), []) // Supabaseクライアント

  const [members, setMembers] = useState<Member[]>([]) // メンバー一覧
  const [loading, setLoading] = useState(true) // ローディング
  const [error, setError] = useState<string | null>(null) // エラー

  const [link, setLink] = useState<ShareLink | null>(null) // 公開リンク
  const [copyOk, setCopyOk] = useState<string | null>(null) // コピー結果

  const [newEmail, setNewEmail] = useState("") // 追加メール
  const [newRole, setNewRole] = useState<"viewer" | "editor">("viewer") // 追加ロール

  useEffect(() => { // 初期ロード
    let alive = true // 生存フラグ
    ;(async () => { // 即時非同期
      setLoading(true) // 読込ON
      setError(null) // エラー消去
      try {
        const [{ data: mData, error: mErr }, { data: lData, error: lErr }] = await Promise.all([
          supabase.from("trip_members").select("user_id, role").eq("trip_id", tripId), // メンバー取得
          supabase // シェアリンク取得
            .from("share_links")
            .select("id, is_enabled, expires_at")
            .eq("trip_id", tripId)
            .eq("is_enabled", true)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ])
        if (!alive) return // 中断
        if (mErr) throw new Error(mErr.message) // メンバー取得失敗
        if (lErr && (lErr as { code?: string }).code !== "PGRST116") throw new Error(lErr.message) // リンク失敗
        setMembers(mData ?? []) // 反映
        setLink(lData ?? null) // 反映
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "�ǂݍ��݂Ɏ��s���܂���") // エラー表示
      } finally {
        setLoading(false) // 読込OFF
      }
    })()
    return () => { alive = false } // クリーンアップ
  }, [supabase, tripId]) // 依存

  const publicUrl = link ? `${typeof window !== 'undefined' ? location.origin : ''}/share/${link.id}` : null // 公開URL

  async function copyShareUrl() { // 共有URLをコピー
    if (!publicUrl) return // なし
    try {
      await navigator.clipboard.writeText(publicUrl) // クリップボード
      setCopyOk("�����N���R�s�[���܂���") // 成功
      setTimeout(() => setCopyOk(null), 1500) // メッセージ消し
    } catch {
      setCopyOk("�R�s�[�Ɏ��s���܂���") // 失敗
      setTimeout(() => setCopyOk(null), 1500) // 消す
    }
  }

  const isValidEmail = (s: string) => /.+@.+\..+/.test(s.trim().toLowerCase()) // 簡易メール検証

  async function addMember(e: React.FormEvent) { // メンバー追加
    e.preventDefault() // 送信抑止
    const email = newEmail.trim().toLowerCase() // 正規化
    if (!isValidEmail(email)) { setError("���[���A�h���X�̌`��������������܂���"); return } // 検証
    setError(null) // エラー消去
    try {
      setLoading(true) // 読込ON
      throw new Error('�Ǘ�API������������Ă��邽�߁A���[�������͗��p�ł��܂���B���[�U�[ID�𒼐ڎw�肷������ɐ؂�ւ��邩�A���̋@�\�𖳌������Ă��������B') // 簡易版注記
      if (members.some(m => m.user_id === id)) { setError("���ɓo�^����Ă��܂�"); setLoading(false); return } // 重複
      const { error: insErr } = await supabase.from("trip_members").insert({ trip_id: tripId, user_id: id, role: newRole }) // 追加
      if (insErr) throw new Error(String((insErr as { message?: string } | null)?.message ?? "")) // エラー
      const { data: mData, error: mErr } = await supabase.from("trip_members").select("user_id, role").eq("trip_id", tripId) // 再取得
      if (mErr) throw new Error(String((mErr as { message?: string } | null)?.message ?? "")) // エラー
      setMembers(mData ?? []) // 反映
      setNewEmail("") // クリア
      setNewRole("viewer") // 既定
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "�ǉ��Ɏ��s���܂���") // 失敗
    } finally {
      setLoading(false) // 読込OFF
    }
  }

  async function updateRole(userId: string, role: "viewer" | "editor") { // ロール更新
    try {
      setError(null) // エラー消去
      const { error: upErr } = await supabase.from("trip_members").update({ role }).eq("trip_id", tripId).eq("user_id", userId) // 更新
      if (upErr) throw new Error(upErr.message) // 失敗
      setMembers(prev => prev.map(m => m.user_id === userId ? { ...m, role } : m)) // 楽観更新
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "�X�V�Ɏ��s���܂���") // エラー
    }
  }

  async function removeMember(userId: string) { // メンバー削除
    try {
      setError(null) // エラー消去
      const { error: delErr } = await supabase.from("trip_members").delete().eq("trip_id", tripId).eq("user_id", userId) // 削除
      if (delErr) throw new Error(delErr.message) // 失敗
      setMembers(prev => prev.filter(m => m.user_id !== userId)) // 反映
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "�폜�Ɏ��s���܂���") // エラー
    }
  }

  return ( // 描画
    <section className="mx-auto w-full max-w-2xl space-y-6 p-4"> {/* コンテナ */}
      <header className="space-y-1"> {/* ヘッダー */}
        <h1 className="text-2xl font-bold">���L�E�����o�[�Ǘ�</h1> {/* タイトル */}
        <p className="text-sm text-gray-600">tripId: {tripId}</p> {/* ID */}
      </header>

      {/* ���L�����N */} {/* 公開リンク */}
      <Card>
        <div className="mb-2 text-sm font-medium">���L�����N</div> {/* 見出し */}
        {publicUrl ? ( // リンクあり
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center"> {/* レイアウト */}
            <code className="flex-1 truncate rounded border bg-gray-50 px-2 py-1 text-xs">{publicUrl}</code> {/* URL */}
            <Button onClick={copyShareUrl} variant="outline" size="sm">�R�s�[</Button> {/* コピー */}
          </div>
        ) : ( // リンクなし
          <p className="text-sm text-gray-600">�L���ȋ��L�����N�͂���܂���B</p>
        )}
        {copyOk && <p className="mt-2 text-xs text-green-600">{copyOk}</p>} {/* コピー結果 */}
        <p className="mt-2 text-xs text-gray-500">���J�y�[�W: /share/[shareId]</p> {/* パス案内 */}
      </Card>

      {/* �����o�[�̒ǉ� */} {/* メンバー追加 */}
      <Card>
        <form onSubmit={addMember} className="grid gap-3"> {/* 送信で追加 */}
          <div className="text-sm font-medium">�����o�[�̒ǉ�</div> {/* 見出し */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3"> {/* 入力行 */}
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="user@example.com" className="w-full rounded-xl border px-3 py-2 text-sm" required /> {/* メール */}
            <select value={newRole} onChange={(e) => setNewRole(e.target.value as "viewer" | "editor")} className="rounded-xl border bg-white px-3 py-2 text-sm"> {/* ロール */}
              <option value="viewer">viewer�i�{���j</option>
              <option value="editor">editor�i�ҏW�j</option>
            </select>
            <div className="flex justify-end"> {/* 送信 */}
              <Button type="submit" disabled={loading}>�ǉ�</Button>
            </div>
          </div>
        </form>
      </Card>

      {/* �����o�[�ꗗ */} {/* メンバー一覧 */}
      <Card>
        <div className="border-b p-3 text-sm font-medium">�����o�[</div> {/* 見出し */}
        {loading ? ( // ロード中
          <div className="p-4 text-sm text-gray-500"> {/* スケルトン */}
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </div>
        ) : error ? ( // エラー
          <div className="p-4 text-sm text-red-600">{error}</div>
        ) : members.length === 0 ? ( // 空
          <div className="p-4 text-sm text-gray-500">�����o�[���o�^����Ă��܂���B</div>
        ) : ( // 一覧
          <ul className="divide-y"> {/* リスト */}
            {members.map((m) => (
              <li key={m.user_id} className="flex items-center justify-between p-3 text-sm"> {/* 行 */}
                <div className="min-w-0"> {/* 左 */}
                  <div className="truncate font-medium">{m.user_id}</div> {/* ユーザーID */}
                </div>
                <div className="flex items-center gap-2"> {/* 右 */}
                  <select value={m.role ?? "viewer"} onChange={(e) => updateRole(m.user_id, e.target.value as "viewer" | "editor")} className="rounded-lg border bg-white px-2 py-1 text-xs"> {/* ロール */}
                    <option value="viewer">viewer</option>
                    <option value="editor">editor</option>
                  </select>
                  <Button onClick={() => removeMember(m.user_id)} variant="outline" size="sm">�폜</Button> {/* 削除 */}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  )
}

