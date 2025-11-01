// app/trips/new/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"

// 0: 基本情報, 1: 日付, 2: 参加者, 3: 予算, 4: 共有設定, 5: 確認, 6: 完了
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6

export default function TripNewPage() {
    const router = useRouter()

    // フォーム状態
    const [title, setTitle] = useState("")
    const [startDate, setStartDate] = useState<string>("")
    const [endDate, setEndDate] = useState<string>("")
    const [participants, setParticipants] = useState<string[]>([])
    const [participantInput, setParticipantInput] = useState<string>("")
    const [budget, setBudget] = useState<string>("") // 金額は任意
    const [currency, setCurrency] = useState<string>("JPY")
    const [isPublic, setIsPublic] = useState<boolean>(false)

    // 進行制御
    const [step, setStep] = useState<Step>(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [createdTripId, setCreatedTripId] = useState<string | null>(null)

    // Supabase ブラウザクライアント
    const supabase = useMemo(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ), [])

    // マウント時にセッション確認（未ログインは /auth/login へ）
    useEffect(() => {
        let mounted = true
        ;(async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (mounted && !session) router.replace("/auth/login")
        })()
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) router.replace("/auth/login")
        })
        return () => {
            mounted = false
            sub.subscription.unsubscribe()
        }
    }, [router, supabase])

    // 参加者の簡易メール検証
    const isValidEmail = (s: string) => /.+@.+\..+/.test(s.trim().toLowerCase())
    const addParticipant = () => {
        const email = participantInput.trim().toLowerCase()
        if (!email) return
        if (!isValidEmail(email)) { setError("メールアドレスの形式が正しくありません"); return }
        if (participants.includes(email)) { setParticipantInput(""); return }
        setParticipants((prev) => [...prev, email])
        setParticipantInput("")
    }
    const removeParticipant = (email: string) => {
        setParticipants((prev) => prev.filter((e) => e !== email))
    }

    // 入力検証（ステップごと）
    const validateCurrentStep = (): string | null => {
        if (step === 0) {
            if (!title.trim()) return "タイトルを入力してください"
        }
        if (step === 1) {
            if (startDate && endDate) {
                const s = new Date(startDate)
                const e = new Date(endDate)
                if (s > e) return "開始日は終了日以前にしてください"
            }
        }
        if (step === 2) {
            // 参加者は任意。入力中の追加忘れを軽く注意（エラーにはしない）
            if (participantInput && !isValidEmail(participantInput)) return "参加者のメール形式が正しくありません"
        }
        if (step === 3) {
            if (budget) {
                const v = Number(budget)
                if (!Number.isFinite(v) || v < 0) return "予算は0以上の数値で入力してください"
            }
        }
        if (step === 4) {
            // 共有設定は任意（バリデーションなし）
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
            if (!token) {
                setError("未ログインです。先にログインしてください")
                setLoading(false)
                return
            }
            // API 側は title / startDate / endDate のみを利用（他は将来拡張用）
            const payload: any = { title: title.trim() }
            if (startDate) payload.startDate = startDate
            if (endDate) payload.endDate = endDate
            // 追加情報（APIが無視しても問題ない）：
            if (participants.length) payload.participants = participants
            if (budget) payload.budget = { amount: Number(budget), currency }
            payload.share = { public: isPublic }

            const res = await fetch("/api/trips/new", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data?.error || `HTTP ${res.status}`)
            }
            const { id } = await res.json()
            setCreatedTripId(id)
            setStep(6) // 完了
        } catch (e: any) {
            setError(e?.message ?? "作成に失敗しました")
        } finally {
            setLoading(false)
        }
    }

    const StepHeader = () => (
        <ol className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
            {[
                { n: 0, label: "基本情報" },
                { n: 1, label: "日付" },
                { n: 2, label: "参加者" },
                { n: 3, label: "予算" },
                { n: 4, label: "共有設定" },
                { n: 5, label: "確認" },
                { n: 6, label: "完了" },
            ].map(({ n, label }) => (
                <li key={n} className={`flex items-center gap-1 ${step === n ? "font-semibold text-gray-900" : ""}`}>
                    <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${step >= n ? "bg-blue-600 text-white border-blue-600" : "bg-white"}`}>
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

            {/* 基本情報 */}
            {step === 0 && (
                <div className="space-y-3">
                    <label className="flex flex-col gap-2 text-sm">
                        <span className="font-medium">タイトル</span>
                        <input
                            type="text"
                            placeholder="例: 春の京都 2泊3日"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border rounded-md px-3 py-2"
                            required
                        />
                    </label>
                    <div className="flex items-center justify-end gap-3">
                        <button onClick={goNext} className="px-4 py-2 rounded-md bg-blue-600 text-white">次へ</button>
                    </div>
                </div>
            )}

            {/* 日付 */}
            {step === 1 && (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="flex flex-col gap-2 text-sm">
                            <span className="font-medium">開始日（任意）</span>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full border rounded-md px-3 py-2" />
                        </label>
                        <label className="flex flex-col gap-2 text-sm">
                            <span className="font-medium">終了日（任意）</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border rounded-md px-3 py-2" />
                        </label>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <button onClick={goPrev} className="px-4 py-2 rounded-md border">戻る</button>
                        <button onClick={goNext} className="px-4 py-2 rounded-md bg-blue-600 text-white">次へ</button>
                    </div>
                </div>
            )}

            {/* 参加者 */}
            {step === 2 && (
                <div className="space-y-3 text-sm">
                    <label className="flex flex-col gap-2">
                        <span className="font-medium">参加者メール（任意・複数可）</span>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={participantInput}
                                onChange={(e) => setParticipantInput(e.target.value)}
                                className="w-full border rounded-md px-3 py-2"
                            />
                            <button onClick={addParticipant} type="button" className="px-3 rounded-md border">追加</button>
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
                    <div className="flex items-center justify-between gap-3">
                        <button onClick={goPrev} className="px-4 py-2 rounded-md border">戻る</button>
                        <button onClick={goNext} className="px-4 py-2 rounded-md bg-blue-600 text-white">次へ</button>
                    </div>
                </div>
            )}

            {/* 予算 */}
            {step === 3 && (
                <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="flex flex-col gap-2 sm:col-span-2">
                            <span className="font-medium">予算（任意）</span>
                            <input
                                type="number"
                                min={0}
                                step={100}
                                placeholder="例: 100000"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                className="w-full border rounded-md px-3 py-2"
                            />
                        </label>
                        <label className="flex flex-col gap-2">
                            <span className="font-medium">通貨</span>
                            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full border rounded-md px-3 py-2">
                                <option value="JPY">JPY</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select>
                        </label>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <button onClick={goPrev} className="px-4 py-2 rounded-md border">戻る</button>
                        <button onClick={goNext} className="px-4 py-2 rounded-md bg-blue-600 text-white">次へ</button>
                    </div>
                </div>
            )}

            {/* 共有設定 */}
            {step === 4 && (
                <div className="space-y-3 text-sm">
                    <label className="inline-flex items-center gap-2">
                        <input type="checkbox" className="h-4 w-4" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                        <span>この旅をリンク共有で閲覧可能にする（将来の設定）</span>
                    </label>
                    <p className="text-gray-600">※ 現在は作成後に共有ページで調整できます。</p>
                    <div className="flex items-center justify-between gap-3">
                        <button onClick={goPrev} className="px-4 py-2 rounded-md border">戻る</button>
                        <button onClick={goNext} className="px-4 py-2 rounded-md bg-blue-600 text-white">次へ</button>
                    </div>
                </div>
            )}

            {/* 確認 */}
            {step === 5 && (
                <div className="space-y-4 text-sm">
                    <div className="rounded border p-3">
                        <p className="font-medium mb-2">内容の確認</p>
                        <dl className="space-y-1">
                            <div className="flex justify-between gap-3">
                                <dt className="text-gray-600">タイトル</dt>
                                <dd className="text-gray-900">{title || "(未入力)"}</dd>
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
                                <dd className="text-gray-900">{participants.length ? participants.join(", ") : "(未追加)"}</dd>
                            </div>
                            <div className="flex justify-between gap-3">
                                <dt className="text-gray-600">予算</dt>
                                <dd className="text-gray-900">{budget ? `${Number(budget).toLocaleString()} ${currency}` : "(未設定)"}</dd>
                            </div>
                            <div className="flex justify-between gap-3">
                                <dt className="text-gray-600">共有設定</dt>
                                <dd className="text-gray-900">{isPublic ? "リンク共有: 有効" : "リンク共有: 無効"}</dd>
                            </div>
                        </dl>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <button onClick={goPrev} className="px-4 py-2 rounded-md border">戻る</button>
                        <button onClick={submitCreate} disabled={loading} className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50">
                            {loading ? "作成中…" : "作成する"}
                        </button>
                    </div>
                </div>
            )}

            {/* 完了 */}
            {step === 6 && (
                <div className="space-y-4 text-sm">
                    <div className="rounded border p-3 bg-green-50 border-green-200">
                        <p className="font-medium text-green-800">旅を作成しました。</p>
                        {createdTripId && (
                            <p className="mt-1">ID: <span className="font-mono">{createdTripId}</span></p>
                        )}
                    </div>
                    <div className="flex items-center justify-end gap-3">
                        {createdTripId ? (
                            <button onClick={() => router.push(`/trips/${encodeURIComponent(createdTripId)}`)} className="px-4 py-2 rounded-md bg-blue-600 text-white">この旅を開く</button>
                        ) : (
                            <button onClick={() => router.push("/trips")} className="px-4 py-2 rounded-md bg-blue-600 text-white">一覧へ戻る</button>
                        )}
                    </div>
                </div>
            )}

            {step === 6 && createdTripId && (
                <div className="space-y-3 text-sm">
                    <p className="text-gray-700">各詳細ページへ移動：</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <button
                            className="px-3 py-2 rounded-md border hover:bg-gray-50"
                            onClick={() => router.push(`/trips/${encodeURIComponent(createdTripId)}`)}
                        >ダッシュボード</button>
                        <button
                            className="px-3 py-2 rounded-md border hover:bg-gray-50"
                            onClick={() => router.push(`/trips/${encodeURIComponent(createdTripId)}/preview`)}
                        >プレビュー</button>
                                <button
                                    className="px-3 py-2 rounded-md border hover:bg-gray-50"
                                    onClick={() => router.push(`/trips/${encodeURIComponent(createdTripId)}/days`)}
                                >日別スケジュール</button>
                        <button
                            className="px-3 py-2 rounded-md border hover:bg-gray-50"
                            onClick={() => router.push(`/trips/${encodeURIComponent(createdTripId)}/activities`)}
                        >アクティビティ</button>
                        <button
                            className="px-3 py-2 rounded-md border hover:bg-gray-50"
                            onClick={() => router.push(`/trips/${encodeURIComponent(createdTripId)}/budget`)}
                        >予算・費用</button>
                        <button
                            className="px-3 py-2 rounded-md border hover:bg-gray-50"
                            onClick={() => router.push(`/trips/${encodeURIComponent(createdTripId)}/tasks`)}
                        >タスク</button>
                        <button
                            className="px-3 py-2 rounded-md border hover:bg-gray-50"
                            onClick={() => router.push(`/trips/${encodeURIComponent(createdTripId)}/share`)}
                        >共有</button>
                        <button
                            className="px-3 py-2 rounded-md border hover:bg-gray-50"
                            onClick={() => router.push(`/trips/${encodeURIComponent(createdTripId)}/settings`)}
                        >設定</button>
                    </div>
                </div>
            )}

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </section>
    )
}
