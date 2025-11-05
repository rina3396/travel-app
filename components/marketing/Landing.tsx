"use client"

import { motion } from "framer-motion"
import { Plane, CalendarCheck2, Wallet, ListTodo, Sparkles, ArrowRight, Users, Clock, Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/shadcn/ui/button"
import { Badge } from "@/components/shadcn/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/ui/card"

export default function Landing() {
  return (
    <div className="space-y-16">
      <Hero />
      <Stats />
      <Logos />
      <Features />
      <Showcase />
      <Testimonials />
      <FAQ />
      <CTA />
      <MiniCTA />
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-orange-100/60 to-transparent blur-2xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto max-w-2xl text-center"
      >
        <div className="mb-3 flex items-center justify-center gap-2">
          <Badge className="gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            新機能を継続追加中
          </Badge>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          旅の計画を、もっとかんたんに。
        </h1>
        <p className="mt-4 text-base text-gray-600 sm:text-lg">
          行き先のアイデア出しから日程・アクティビティの整理、予算やタスク管理まで。
          旅行づくりをスムーズに進めるオールインワンツールです。
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <Button asChild className="px-5">
            <Link href="/auth/login" aria-label="無料ではじめる" className="inline-flex items-center gap-1">
              無料ではじめる
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/guide" aria-label="デモを見る">デモを見る</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  )
}

function Stats() {
  const items = [
    { icon: Clock, label: '初期セットアップ', value: '5分' },
    { icon: Users, label: '共同編集', value: '複数人で共有' },
    { icon: Star, label: '使いやすさ', value: '直感操作' },
  ]
  return (
    <section className="mx-auto grid max-w-screen-lg grid-cols-1 gap-2 sm:grid-cols-3">
      {items.map((s, i) => (
        <motion.div key={s.label} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-xl border bg-white p-4 text-center shadow-sm">
          <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-md border bg-white">
            <s.icon className="h-4 w-4 text-orange-600" />
          </div>
          <div className="text-sm text-gray-600">{s.label}</div>
          <div className="text-base font-semibold">{s.value}</div>
        </motion.div>
      ))}
    </section>
  )
}

function Logos() {
  return (
    <section className="mx-auto max-w-screen-lg">
      <div className="flex flex-wrap items-center justify-center gap-4 text-gray-400">
        <span className="text-xs">Trusted by teams:</span>
        <div className="h-6 w-20 rounded bg-gray-100" />
        <div className="h-6 w-20 rounded bg-gray-100" />
        <div className="h-6 w-20 rounded bg-gray-100" />
        <div className="h-6 w-20 rounded bg-gray-100" />
      </div>
    </section>
  )
}

function Features() {
  const items = [
    {
      icon: CalendarCheck2,
      title: "行程づくり",
      desc: "日ごとの予定を直感的に整理",
      points: ["ドラッグ&ドロップで並び替え", "開始・終了時刻の入力に対応", "日付ごとのメモで補足"],
    },
    {
      icon: ListTodo,
      title: "アクティビティ管理",
      desc: "行きたい場所ややりたいことを集約",
      points: ["候補をストックして比較検討", "URLやメモを添えて保存", "チェックで採用/保留を切替"],
    },
    {
      icon: Wallet,
      title: "予算・タスク",
      desc: "費用とやることをひと目で把握",
      points: ["カテゴリ別に費用を管理", "支払い状況をトラッキング", "出発前の準備タスクを整理"],
    },
  ]

  return (
    <section aria-label="機能紹介" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, idx) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: 0.05 * idx, duration: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="mb-2 flex items-center gap-2 text-gray-900">
                <item.icon className="h-4 w-4" />
                <CardTitle>{item.title}</CardTitle>
              </div>
              <CardDescription>{item.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                {item.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </section>
  )
}

function Showcase() {
  return (
    <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-orange-50 to-white p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center sm:flex-row sm:text-left"
      >
        <div className="flex size-12 items-center justify-center rounded-xl border bg-white shadow-sm">
          <Plane className="h-6 w-6 text-orange-600" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">迷わず作れる画面設計</h3>
          <p className="text-sm text-gray-600">
            旅の工程・アクティビティ・費用・タスクが一か所にまとまり、
            進行状況がひと目で分かります。
          </p>
        </div>
        <div className="mt-2 shrink-0 sm:mt-0">
          <Button variant="outline" asChild>
            <Link href="/trips/new" className="inline-flex items-center gap-1">
              新規作成
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </section>
  )
}

function CTA() {
  return (
    <section className="rounded-2xl border bg-white p-6 text-center shadow-sm">
      <motion.h2
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="text-xl font-semibold"
      >
        今すぐ試してみませんか？
      </motion.h2>
      <p className="mt-2 text-sm text-gray-600">メールだけで簡単にサインインできます。</p>
      <div className="mt-4 flex items-center justify-center gap-3">
        <Button asChild className="px-5">
          <Link href="/auth/login">無料ではじめる</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/guide">まずは使い方を見る</Link>
        </Button>
      </div>
    </section>
  )
}

function Testimonials() {
  const items = [
    { name: 'Aさん', quote: '計画づくりが本当に楽になりました。出発前のタスク漏れもゼロに。' },
    { name: 'Bさん', quote: '複数人での編集がスムーズで、全員の予定が揃いやすいです。' },
  ]
  return (
    <section className="mx-auto grid max-w-screen-lg grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((t, i) => (
        <motion.div key={t.name} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-800">“{t.quote}”</p>
          <div className="mt-2 text-xs text-gray-500">{t.name}</div>
        </motion.div>
      ))}
    </section>
  )
}

function FAQ() {
  const faqs = [
    {
      q: 'アカウントがなくても試せますか？',
      a: 'ログイン後にご利用いただけます。メール認証のみで登録でき、すぐに体験可能です。',
    },
    {
      q: '共同編集はできますか？',
      a: '旅のプラン共有リンクを使って複数人での閲覧・編集が可能です。',
    },
    {
      q: '料金はかかりますか？',
      a: '現状は無料でお使いいただけます（将来的に有料プランを検討中です）。',
    },
  ]
  return (
    <section className="mx-auto max-w-screen-md">
      <h2 className="mb-3 text-center text-xl font-semibold">FAQ</h2>
      <div className="space-y-2">
        {faqs.map((f) => (
          <details key={f.q} className="rounded-lg border bg-white p-4 shadow-sm open:shadow-md">
            <summary className="cursor-pointer text-sm font-medium text-gray-900">{f.q}</summary>
            <p className="mt-2 text-sm text-gray-600">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function MiniCTA() {
  return (
    <section className="mt-2">
      <div className="mx-auto flex max-w-screen-md items-center justify-between gap-3 rounded-lg border bg-white/80 p-3 text-xs shadow-sm">
        <div className="text-gray-700">
          まずはサクッと旅のプランを作成してみましょう。
        </div>
        <div className="shrink-0">
          <Button asChild size="sm" variant="outline">
            <Link href="/trips/new">新規作成</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
