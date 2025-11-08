// app/trips/new/page.tsx — 旅行の新規作成（ウィザード）
"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import type { CreateTripRequest } from "@/types/trips"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6

export default function TripNewPage() {
  const router = useRouter()

  // 入力値
  const [title, setTitle] = useState("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [participants, setParticipants] = useState<string[]>([])
  const [participantInput, setParticipantInput] = useState<string>("")
  const [budget, setBudget] = useState<string>("")
  const [currency, setCurrency] = useState<string>("JPY")
  const [isPublic, setIsPublic] = useState<boolean>(false)

  // 状態
  const [step, setStep] = useState<Step>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdTripId, setCreatedTripId] = useState<string | null>(null)

  // Supabase ブラウザクライアント
  const supabase = useMemo(
    () => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!),
    []
  )

  // 未認証なら /auth/login へ
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (mounted && !session) router.replace("/auth/login")
    })()
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/auth/login")
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [router, supabase])

  // 参加者メールのバリデーション
  const isValidEmail = (s: string) => /.+@.+\..+/.test(s.trim().toLowerCase())
  const addParticipant = () => {
    const email = participantInput.trim().toLowerCase()
    if (!email) return
    if (!isValidEmail(email)) { setError("メールアドレスの形式が正しくありません"); return }
    if (participants.includes(email)) { setParticipantInput(""); return }
    setParticipants((prev) => [...prev, email])
    setParticipantInput("")
  }
  const removeParticipant = (email: string) => setParticipants((prev) => prev.filter((e) => e !== email))

  // ステップごとの入力チェック
  const validateCurrentStep = (): string | null => {
    if (step === 0) {
      if (!title.trim()) return "タイトルを入力してください"
    }
    if (step === 1) {
      if (startDate && endDate) {
        const s = new Date(startDate)
        const e = new Date(endDate)
        if (s > e) return "開始日は終了日より前にしてください"
      }
    }
    if (step === 2) {
      if (participantInput && !isValidEmail(participantInput)) return "メールアドレスの形式が正しくありません"
    }
    if (step === 3) {
      if (budget) {
        const v = Number(budget)
        if (!Number.isFinite(v) || v < 0) return "予算は0以上の数値で入力してください"
      }
    }
    return null
  }

  const goNext = () => {
    const v = validateCurrentStep()
    if (v) { setError(v); return }
    setError(null)
    setStep((s) => (s < 6 ? (s + 1) as Step : s))
  }
  const goPrev = () => setStep((s) => (s > 0 ? (s - 1) as Step : s))

  const submitCreate = async () => {
    const v = validateCurrentStep()
    if (v) { setError(v); return }
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) { setError("未ログインです。先にログインしてください"); setLoading(false); return }

      const payload: CreateTripRequest = {
        title: title.trim(),
        startDate: startDate || null,
        endDate: endDate || null,
        participants: participants.length ? participants : undefined,
        budget: budget ? { amount: Number(budget), currency } : undefined,
        share: isPublic ? { public: true } : undefined,
      }

      const res = await fetch("/api/trips/new", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json() as { id?: string }
      const id = json?.id
      setCreatedTripId(id ?? null)
      if (id) router.replace(`/trips/${encodeURIComponent(id)}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "作成に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 p-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">新規作成</h1>
        <p className="text-sm text-gray-600">ステップ: {step}</p>
      </header>

      {error && <Card><div className="p-3 text-sm text-red-600">{error}</div></Card>}

      {/* Step 0: タイトル */}
      {step === 0 && (
        <Card>
          <div className="grid gap-2 p-3">
            <label className="text-xs text-gray-600">タイトル</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-xl border px-3 py-2 text-sm" placeholder="家族旅行 2025 年" />
          </div>
        </Card>
      )}

      {/* Step 1: 期間 */}
      {step === 1 && (
        <Card>
          <div className="grid grid-cols-2 gap-3 p-3">
            <div>
              <label className="text-xs text-gray-600">開始日</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-600">終了日</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm" />
            </div>
          </div>
        </Card>
      )}

      {/* Step 2: 参加者 */}
      {step === 2 && (
        <Card>
          <div className="grid gap-3 p-3">
            <div className="grid grid-cols-3 gap-2">
              <input type="email" value={participantInput} onChange={(e) => setParticipantInput(e.target.value)} className="col-span-2 rounded-xl border px-3 py-2 text-sm" placeholder="friend@example.com" />
              <Button onClick={addParticipant} type="button" variant="outline">追加</Button>
            </div>
            <ul className="flex flex-wrap gap-2">
              {participants.map((mail) => (
                <li key={mail} className="inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs">
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
          <div className="grid grid-cols-3 gap-3 p-3">
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
          <div className="flex items-center justify-between p-3">
            <div className="text-sm">公開リンクを有効にする（リンクを知っている人が閲覧可能）</div>
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          </div>
        </Card>
      )}

      {/* Step 5: 確認 */}
      {step === 5 && (
        <Card>
          <div className="grid gap-2 p-3 text-sm">
            <div>タイトル: {title || '未設定'}</div>
            <div>期間: {(startDate || '未設定')} - {(endDate || '未設定')}</div>
            <div>参加者: {participants.length ? participants.join(', ') : 'なし'}</div>
            <div>予算: {budget ? `${budget} ${currency}` : '未設定'}</div>
            <div>公開: {isPublic ? '有効' : '無効'}</div>
          </div>
        </Card>
      )}

      {/* Step 6: 完了 */}
      {step === 6 && (
        <Card>
          <div className="p-3 text-sm">作成が完了しました。{createdTripId ? `ID: ${createdTripId}` : ''}</div>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={goPrev} disabled={step === 0 || loading}>戻る</Button>
        {step < 5 && <Button onClick={goNext} disabled={loading}>次へ</Button>}
        {step === 5 && <Button onClick={submitCreate} disabled={loading}>作成</Button>}
      </div>
    </section>
  )
}

