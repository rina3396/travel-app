// app/trips/new/page.tsx // 旅の新規作成ウィザード（クライアント）
"use client" // クライアントコンポーネント

import { useEffect, useMemo, useState } from "react" // Reactフック
import { useRouter } from "next/navigation" // ルーター
import { createBrowserClient } from "@supabase/ssr" // Supabaseブラウザ
import type { CreateTripRequest } from "@/types/trips" // 型
import Card from "@/components/ui/Card" // カード
import Button from "@/components/ui/Button" // ボタン

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 // ステップ型

export default function TripNewPage() { // ページ本体
  const router = useRouter() // ルーター

  // 入力値 // 各ステップの入力状態
  const [title, setTitle] = useState("") // タイトル
  const [startDate, setStartDate] = useState<string>("") // 開始日
  const [endDate, setEndDate] = useState<string>("") // 終了日
  const [participants, setParticipants] = useState<string[]>([]) // 参加者メール
  const [participantInput, setParticipantInput] = useState<string>("") // 参加者入力
  const [budget, setBudget] = useState<string>("") // 予算
  const [currency, setCurrency] = useState<string>("JPY") // 通貨
  const [isPublic, setIsPublic] = useState<boolean>(false) // 公開フラグ

  // 進行 // ステップ・ロードなど
  const [step, setStep] = useState<Step>(0) // 現在ステップ
  const [loading, setLoading] = useState(false) // 通信中
  const [error, setError] = useState<string | null>(null) // エラー
  const [createdTripId, setCreatedTripId] = useState<string | null>(null) // 作成結果

  // Supabase ブラウザクライアント
  const supabase = useMemo(
    () => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), // 環境変数から初期化
    [] // 初回のみ
  )

  // 認証未ログインなら /auth/login へ
  useEffect(() => { // ガード
    let mounted = true // マウントフラグ
    ;(async () => { // 即時非同期
      const { data: { session } } = await supabase.auth.getSession() // セッション取得
      if (mounted && !session) router.replace("/auth/login") // 未ログインは遷移
    })()
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => { // 変更監視
      if (!session) router.replace("/auth/login") // 未ログインは遷移
    })
    return () => { mounted = false; sub.subscription.unsubscribe() } // クリーンアップ
  }, [router, supabase])

  // 参加者メールのバリデーション
  const isValidEmail = (s: string) => /.+@.+\..+/.test(s.trim().toLowerCase()) // 簡易
  const addParticipant = () => { // 追加
    const email = participantInput.trim().toLowerCase() // 正規化
    if (!email) return // 空は無視
    if (!isValidEmail(email)) { setError("���[���A�h���X�̌`��������������܂���"); return } // 検証
    if (participants.includes(email)) { setParticipantInput(""); return } // 重複は無視
    setParticipants((prev) => [...prev, email]) // 追加
    setParticipantInput("") // クリア
  }
  const removeParticipant = (email: string) => setParticipants((prev) => prev.filter((e) => e !== email)) // 削除

  // ステップごとの入力チェック
  const validateCurrentStep = (): string | null => { // 検証
    if (step === 0) {
      if (!title.trim()) return "�^�C�g������͂��Ă�������" // タイトル必須
    }
    if (step === 1) {
      if (startDate && endDate) {
        const s = new Date(startDate)
        const e = new Date(endDate)
        if (s > e) return "�J�n���͏I�������O�ɂ��Ă�������" // 期間の整合性
      }
    }
    if (step === 2) {
      if (participantInput && !isValidEmail(participantInput)) return "�Q���҂̃��[���`��������������܂���" // 参加者入力検証
    }
    if (step === 3) {
      if (budget) {
        const v = Number(budget)
        if (!Number.isFinite(v) || v < 0) return "�\�Z��0�ȏ�̐��l�œ��͂��Ă�������" // 予算輸入
      }
    }
    return null // OK
  }

  const goNext = () => { // 次へ
    const v = validateCurrentStep() // 検証
    if (v) { setError(v); return } // エラー
    setError(null) // クリア
    setStep((s) => (s < 6 ? (s + 1) as Step : s)) // 前進
  }
  const goPrev = () => setStep((s) => (s > 0 ? (s - 1) as Step : s)) // 前へ

  const submitCreate = async () => { // 作成送信
    const v = validateCurrentStep() // 検証
    if (v) { setError(v); return } // エラー
    setLoading(true) // 読込ON
    setError(null) // クリア
    try {
      const { data: { session } } = await supabase.auth.getSession() // セッション
      const token = session?.access_token // トークン
      if (!token) { setError("�����O�C���ł��B��Ƀ��O�C�����Ă�������"); setLoading(false); return } // 未ログイン

      const payload: CreateTripRequest = { // リクエスト
        title: title.trim(), // タイトル
        startDate: startDate || null, // 開始
        endDate: endDate || null, // 終了
        participants: participants.length ? participants : undefined, // 参加者
        budget: budget ? { amount: Number(budget), currency } : undefined, // 予算
        share: isPublic ? { public: true } : undefined, // 公開
      }

      const res = await fetch("/api/trips/new", { // API
        method: "POST", // POST
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, // ヘッダ
        body: JSON.stringify(payload), // 本文
      })
      if (!res.ok) throw new Error(await res.text()) // エラー
      const json = await res.json() as { id?: string } // 結果
      const id = json?.id // ID
      setCreatedTripId(id ?? null) // 保持
      if (id) router.replace(`/trips/${encodeURIComponent(id)}`) // 詳細へ
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "�쐬�Ɏ��s���܂���") // 失敗
    } finally {
      setLoading(false) // 読込OFF
    }
  }

  return ( // 描画
    <section className="mx-auto w-full max-w-2xl space-y-6 p-4"> {/* コンテナ */}
      <header className="space-y-1"> {/* ヘッダー */}
        <h1 className="text-2xl font-bold">�V�K�쐬</h1> {/* タイトル */}
        <p className="text-sm text-gray-600">ステップ: {step}</p> {/* 現在のステップ */}
      </header>

      {error && <Card><div className="p-3 text-sm text-red-600">{error}</div></Card>} {/* エラー */}

      {/* Step 0: タイトル */}
      {step === 0 && (
        <Card>
          <div className="grid gap-2 p-3"> {/* 入力 */}
            <label className="text-xs text-gray-600">�^�C�g��</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl border px-3 py-2 text-sm" placeholder="沖縄旅 2025 夏" />
          </div>
        </Card>
      )}

      {/* Step 1: 期間 */}
      {step === 1 && (
        <Card>
          <div className="grid grid-cols-2 gap-3 p-3"> {/* 期間入力 */}
            <div>
              <label className="text-xs text-gray-600">�J�n��</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-600">�I����</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" />
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: 参加者 */}
      {step === 2 && (
        <Card>
          <div className="grid gap-3 p-3"> {/* 入力 */}
            <div className="grid grid-cols-3 gap-2"> {/* メール入力 */}
              <input type="email" value={participantInput} onChange={(e) => setParticipantInput(e.target.value)} className="col-span-2 rounded-xl border px-3 py-2 text-sm" placeholder="friend@example.com" />
              <Button onClick={addParticipant} type="button" variant="outline">追加</Button>
            </div>
            <ul className="flex flex-wrap gap-2"> {/* 参加者一覧 */}
              {participants.map((mail) => (
                <li key={mail} className="inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs"> {/* ピル */}
                  <span className="truncate max-w-48">{mail}</span>
                  <Button size="xs" variant="outline" onClick={() => removeParticipant(mail)}>削除</Button>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* Step 3: 予算 */}
      {step === 3 && (
        <Card>
          <div className="grid grid-cols-3 gap-3 p-3"> {/* 入力 */}
            <div className="col-span-2">
              <label className="text-xs text-gray-600">予算</label>
              <input value={budget} onChange={(e) => setBudget(e.target.value)} type="number" min={0} className="w-full rounded-xl border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-600">通貨</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-xl border bg-white px-3 py-2 text-sm">
                <option value="JPY">JPY</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Step 4: 公開設定 */}
      {step === 4 && (
        <Card>
          <div className="flex items-center justify-between p-3"> {/* トグル */}
            <div className="text-sm">公開リンクを作成（誰でも閲覧可）</div>
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          </div>
        </Card>
      )}

      {/* Step 5: 確認 */}
      {step === 5 && (
        <Card>
          <div className="grid gap-2 p-3 text-sm"> {/* 概要 */}
            <div>タイトル: {title || '（未設定）'}</div>
            <div>期間: {(startDate || '未設定')} - {(endDate || '未設定')}</div>
            <div>参加者: {participants.length ? participants.join(', ') : '（なし）'}</div>
            <div>予算: {budget ? `${budget} ${currency}` : '（未設定）'}</div>
            <div>公開: {isPublic ? 'はい' : 'いいえ'}</div>
          </div>
        </Card>
      )}

      {/* Step 6: 完了 */}
      {step === 6 && (
        <Card>
          <div className="p-3 text-sm">作成完了。{createdTripId ? `ID: ${createdTripId}` : ''}</div>
        </Card>
      )}

      <div className="flex items-center justify-between"> {/* ナビゲーション */}
        <Button variant="outline" onClick={goPrev} disabled={step === 0 || loading}>戻る</Button>
        {step < 5 && <Button onClick={goNext} disabled={loading}>次へ</Button>}
        {step === 5 && <Button onClick={submitCreate} disabled={loading}>作成</Button>}
      </div>
    </section>
  )
}

