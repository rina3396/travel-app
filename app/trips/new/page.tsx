"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
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

  // 進行状態
  const [step, setStep] = useState<Step>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdTripId, setCreatedTripId] = useState<string | null>(null)

  // Supabase ブラウザクライアント
  const supabase = useMemo(
    () => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!),
    []
  )

  // 未ログイン時は /auth/login へ
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

  // ステップごとの軽い入力チェック
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
      if (participantInput && !isValidEmail(participantInput)) return "参加者のメール形式が正しくありません"
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

      const payload: any = { title: title.trim() }
      if (startDate) payload.startDate = startDate
      if (endDate) payload.endDate = endDate
      if (participants.length) payload.participants = participants
      if (budget) payload.budget = { amount: Number(budget), currency }
      if (isPublic) payload.share = { public: true }

      const res = await fetch("/api/trips/new", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || `HTTP ${res.status}`)
      }
      const { id } = await res.json()
      setCreatedTripId(id)
      setStep(6)
    } catch (e: any) {
      setError(e?.message ?? "作成に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const StepHeader = () => (
    <ol className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
      {[
        { n: 0, label: "タイトル" },
        { n: 1, label: "日付" },
        { n: 2, label: "参加者" },
        { n: 3, label: "予算" },
        { n: 4, label: "共有" },
        { n: 5, label: "確認" },
        { n: 6, label: "完了" },
      ].map(({ n, label }) => (
        <li key={n} className={`flex items-center gap-1 ${step === n ? "font-semibold text-gray-900" : ""}`}>
          <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${step >= n ? "bg-orange-500 text-white border-orange-500" : "bg-white"}`}>
            {n + 1}
          </span>
          <span>{label}</span>
          {n < 6 && <span className="mx-1">›</span>}
        </li>
      ))}
    </ol>
  )

  return (
    <section className="p-4 max-w-lg mx-auto space-y-5">
      <h1 className="text-lg font-semibold">旅の新規作成（ウィザード）</h1>
      <StepHeader />

      {step === 0 && (
        <Card title="タイトル" description="旅のタイトルを入力してください">
          <div className="space-y-3">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium">タイトル</span>
              <input type="text" placeholder="例）夏の温泉旅行" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder-gray-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200/60" required />
            </label>
            <div className="flex items-center justify-end gap-2">
              <Button onClick={goNext}>次へ</Button>
            </div>
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card title="日付" description="開始日と終了日を設定してください">
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium">開始日</span>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-200/60" />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium">終了日</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-200/60" />
              </label>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button onClick={goPrev} variant="outline">戻る</Button>
              <Button onClick={goNext}>次へ</Button>
            </div>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card title="参加者" description="メールアドレスを追加（任意）">
          <div className="space-y-3 text-sm">
            <label className="flex flex-col gap-2">
              <span className="font-medium">参加者メール</span>
              <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                <input type="email" placeholder="you@example.com" value={participantInput} onChange={(e) => setParticipantInput(e.target.value)} className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-200/60" />
                <Button onClick={addParticipant} type="button" variant="outline" size="sm" className="h-10 px-3">追加</Button>
              </div>
            </label>
            {!!participants.length && (
              <ul className="flex flex-wrap gap-2">
                {participants.map((email) => (
                  <li key={email} className="flex items-center gap-2 rounded border px-2 py-1">
                    <span className="font-mono">{email}</span>
                    <button onClick={() => removeParticipant(email)} className="text-xs text-red-600">削除</button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center justify-between gap-2">
              <Button onClick={goPrev} variant="outline">戻る</Button>
              <Button onClick={goNext}>次へ</Button>
            </div>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card title="予算" description="金額と通貨を設定（任意）">
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="font-medium">予算</span>
                <input type="number" min={0} step={100} value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-200/60" placeholder="例）30000" />
              </label>
              <label className="flex flex-col gap-2">
                <span className="font-medium">通貨</span>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-white text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-200/60">
                  <option value="JPY">JPY</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </label>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button onClick={goPrev} variant="outline">戻る</Button>
              <Button onClick={goNext}>次へ</Button>
            </div>
          </div>
        </Card>
      )}

      {step === 4 && (
        <Card title="共有" description="リンク共有の有効/無効を設定">
          <div className="space-y-3 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              <span>リンク共有を有効にする</span>
            </label>
            <div className="flex items-center justify-between gap-2">
              <Button onClick={goPrev} variant="outline">戻る</Button>
              <Button onClick={goNext}>次へ</Button>
            </div>
          </div>
        </Card>
      )}

      {step === 5 && (
        <Card title="確認" description="内容を確認して作成します">
          <div className="space-y-3 text-sm">
            <dl className="grid grid-cols-2 gap-2">
              <div className="flex justify-between gap-3">
                <dt className="text-gray-600">タイトル</dt>
                <dd className="text-gray-900">{title || "(未設定)"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-600">開始日</dt>
                <dd className="text-gray-900">{startDate || "(未設定)"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-600">終了日</dt>
                <dd className="text-gray-900">{endDate || "(未設定)"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-600">参加者</dt>
                <dd className="text-gray-900">{participants.length ? participants.join(", ") : "(なし)"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-600">予算</dt>
                <dd className="text-gray-900">{budget ? `${Number(budget).toLocaleString()} ${currency}` : "(未設定)"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-gray-600">共有設定</dt>
                <dd className="text-gray-900">{isPublic ? "リンク共有 有効" : "リンク共有 無効"}</dd>
              </div>
            </dl>
            <div className="flex items-center justify-between gap-2 pt-2">
              <Button onClick={goPrev} variant="outline">戻る</Button>
              <Button onClick={submitCreate} disabled={loading}>{loading ? "作成中…" : "作成する"}</Button>
            </div>
          </div>
        </Card>
      )}

      {step === 6 && (
        <div className="space-y-4 text-sm">
          <Card className="border-green-200 bg-green-50">
            <p className="font-medium text-green-800">作成が完了しました。</p>
            {createdTripId && <p className="mt-1">ID: <span className="font-mono">{createdTripId}</span></p>}
          </Card>
          <div className="flex items-center justify-end gap-2">
            <Button onClick={() => createdTripId ? router.push(`/trips/${encodeURIComponent(createdTripId)}`) : router.push("/trips")}>
              ダッシュボード
            </Button>
          </div>
        </div>
      )}

      {step === 6 && createdTripId && (
        <div className="space-y-3 text-sm">
          <p className="text-gray-700">各機能ページへ移動できます。</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Button className="w-full" variant="primary" onClick={() => router.push(`/trips/${encodeURIComponent(createdTripId)}/preview`)}>プレビュー</Button>
            <Button className="w-full" variant="outline" onClick={() => router.push(`/trips/${encodeURIComponent(createdTripId)}/days`)}>日程</Button>
            <Button className="w-full" variant="outline" onClick={() => router.push(`/trips/${encodeURIComponent(createdTripId)}/budget`)}>予算・費用</Button>
            <Button className="w-full" variant="outline" onClick={() => router.push(`/trips/${encodeURIComponent(createdTripId)}/tasks`)}>タスク</Button>
            <Button className="w-full" variant="outline" onClick={() => router.push(`/trips/${encodeURIComponent(createdTripId)}/share`)}>共有</Button>
            <Button className="w-full" variant="outline" onClick={() => router.push(`/trips/${encodeURIComponent(createdTripId)}/settings`)}>設定</Button>
          </div>
        </div>
      )}

      {error && (
        <Card className="border-rose-200 bg-rose-50 text-rose-700"><p className="text-sm">{error}</p></Card>
      )}
    </section>
  )
}
