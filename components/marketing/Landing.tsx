"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/shadcn/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card"
import {
  Check,
  Calendar,
  Map,
  Plane,
  Users,
  Wallet,
  ArrowRight,
  Smartphone,
  Shield,
  Star,
  Send,
  Sun,
} from "lucide-react"

export default function Landing() {
  const [email, setEmail] = useState("")

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-white via-orange-50/50 to-white text-gray-900">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto max-w-6xl px-4">
          <nav className="flex h-14 items-center justify-between">
            <button
              className="flex items-center gap-2"
              onClick={() => scrollTo("hero")}
              aria-label="りょこうアプリ"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-orange-500 text-white font-bold">旅</span>
              <span className="font-semibold">りょこうアプリ</span>
            </button>
            <div className="hidden items-center gap-6 md:flex">
              <button onClick={() => scrollTo("features")} className="text-sm hover:text-orange-600">機能</button>
              <button onClick={() => scrollTo("screenshots")} className="text-sm hover:text-orange-600">画面</button>
              <button onClick={() => scrollTo("pricing")} className="text-sm hover:text-orange-600">料金</button>
              <button onClick={() => scrollTo("faq")} className="text-sm hover:text-orange-600">FAQ</button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => alert("デモにサインイン（実装例）")}>ログイン</Button>
              <Button className="rounded-2xl" onClick={() => scrollTo("cta")}>無料ではじめる</Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section id="hero" className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl"
              >
                旅の計画、<span className="text-orange-600">これ一つ</span>で。
              </motion.h1>
              <p className="mt-5 text-base text-gray-600 md:text-lg">
                りょこうアプリは、旅の計画から当日のしおり共有、予算管理までをシンプルにまとめるツールです。チームでも、家族でも、ひとり旅でも。
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="inline-flex items-center gap-2 rounded-2xl" onClick={() => scrollTo("cta")}>
                  今すぐ無料で試す <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="rounded-2xl" onClick={() => scrollTo("features")}>
                  機能を見る
                </Button>
              </div>
              <div className="mt-6 flex items-center gap-3 text-sm text-gray-500">
                <Shield className="h-4 w-4" />
                <span>メール登録のみ。いつでも解約できます。</span>
              </div>
              <div className="mt-4 flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
                <span className="ml-2 text-sm text-gray-600">たくさんの旅人に支持されています</span>
              </div>
            </div>

            {/* Mock */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative mx-auto w-full max-w-md"
            >
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-orange-200/50 blur-3xl" />
              <PhoneMock />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Logos / Social proof */}
      <section className="py-10">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-center text-sm text-gray-500">イベント・旅行好きのコミュニティでも活用中</p>
          <div className="mt-4 grid grid-cols-2 gap-6 opacity-70 md:grid-cols-4">
            {['TRIPFANS', 'WEEKENDER', 'GLOBE', 'NOMADERS'].map((brand) => (
              <div
                key={brand}
                className="flex items-center justify-center rounded-xl border bg-white py-3 text-xs font-semibold tracking-widest"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold md:text-3xl">旅に必要な機能をひとまとめ</h2>
          <p className="mt-3 text-center text-gray-600">計画づくりから当日の動線まで。迷わず、抜け漏れなく。</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Feature icon={<Calendar className="h-5 w-5" />} title="しおり作成" desc="日程・時間・アクティビティをドラッグ＆ドロップで直感編集" />
            <Feature icon={<Map className="h-5 w-5" />} title="地図と連動" desc="スポットの追加・距離の確認・エリアごとの最適ルート" />
            <Feature icon={<Users className="h-5 w-5" />} title="メンバー共有" desc="URL共有でしおりを共同編集。コメント・タスク割り当ても可能" />
            <Feature icon={<Wallet className="h-5 w-5" />} title="予算・清算" desc="支出をカテゴリ別に管理。立替精算をワンタップで集計" />
            <Feature icon={<Plane className="h-5 w-5" />} title="予約整理" desc="フライト/ホテル/レンタカーの予約情報を自動でひとまとめ" />
            <Feature icon={<Sun className="h-5 w-5" />} title="オフライン対応" desc="電波が弱い場所でもしおり閲覧はそのまま" />
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-orange-50/60 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold md:text-3xl">3 ステップでスタート</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Step n={1} title="タイトルを決める" desc="旅の名前・日程・メンバーを登録" />
            <Step n={2} title="行き先を入れる" desc="スポットや予約情報を貼り付けるだけ" />
            <Step n={3} title="しおりを共有" desc="URLを送ると全員のスマホに同期" />
          </div>
        </div>
      </section>

      {/* Screenshots */}
      <section id="screenshots" className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold md:text-3xl">画面イメージ</h2>
          <p className="mt-3 text-center text-gray-600">実際の UI に近いダミー画像を配置しています。ご自身のスクリーンショットに差し替えてください。</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex aspect-[4/3] items-center justify-center rounded-xl border bg-gradient-to-br from-white to-orange-50 text-sm text-gray-400"
              >
                スクリーンショット {i + 1}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-b from-white to-orange-50/60 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold md:text-3xl">ユーザーの声</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Testimony name="アヤ" role="週末トラベラー" text="当日の移動がスムーズに。写真とメモもまとまって最高の旅行記になりました。" />
            <Testimony name="カズ" role="幹事" text="参加者が増えても清算が一瞬。LINEにリンクを送るだけで共有完了です。" />
            <Testimony name="ミホ" role="一人旅" text="地図としおりが連動して迷わない。オフラインでも見られて安心でした。" />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold md:text-3xl">料金プラン</h2>
          <p className="mt-3 text-center text-gray-600">まずは無料で体験。必要に応じて拡張できます。</p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <PriceCard
              name="Free"
              price="¥0"
              note="個人・小規模向け"
              features={["3 つの旅まで保存", "メンバー共有（最大 3 名）", "基本機能"]}
              cta="無料登録"
              highlight={false}
            />
            <PriceCard
              name="Pro"
              price="¥480/月"
              note="いちばん人気"
              features={["無制限の旅", "メンバー共有（最大 10 名）", "予算・清算の自動集計", "オフラインモード"]}
              cta="Pro を試す"
              highlight
            />
            <PriceCard
              name="Team"
              price="¥980/月"
              note="チーム・サークル向け"
              features={["メンバー無制限", "役割と権限管理", "CSV エクスポート", "優先サポート"]}
              cta="問い合わせ"
              highlight={false}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="bg-orange-50/70 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <Card className="border-orange-200">
            <CardHeader>
              <CardTitle className="text-center text-2xl md:text-3xl">3 分で準備完了。まずはメールだけ。</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  alert(`登録メール: ${email}`)
                }}
                className="mt-2 flex flex-col items-center gap-3 sm:flex-row"
              >
                <div className="w-full">
                  <input
                    value={email}
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="メールアドレス"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200/60"
                    required
                  />
                </div>
                <Button type="submit" className="inline-flex h-11 items-center gap-2 rounded-2xl">
                  はじめる <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="mt-3 text-center text-xs text-gray-500">登録は 1 分。クレジットカード不要。</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-2xl font-bold md:text-3xl">よくある質問</h2>
          <div className="mt-6 space-y-3">
            <details className="rounded-lg border bg-white p-3">
              <summary className="cursor-pointer text-sm font-medium text-gray-900">無料プランの制限は？</summary>
              <p className="mt-1 text-sm text-gray-600">旅の保存は 3 件まで、メンバーは最大 3 名です。しおり作成・共有など主要機能はすべてお試しいただけます。</p>
            </details>
            <details className="rounded-lg border bg-white p-3">
              <summary className="cursor-pointer text-sm font-medium text-gray-900">いつでも解約できますか？</summary>
              <p className="mt-1 text-sm text-gray-600">はい。アプリ内の「設定」からワンクリックで解約できます。残り期間はそのままご利用いただけます。</p>
            </details>
            <details className="rounded-lg border bg-white p-3">
              <summary className="cursor-pointer text-sm font-medium text-gray-900">データは安全ですか？</summary>
              <p className="mt-1 text-sm text-gray-600">通信は HTTPS で保護され、主要データは暗号化して保存します。共有範囲も細かく制御可能です。</p>
            </details>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/70 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-orange-500 text-white font-bold">旅</span>
                <span className="font-semibold">りょこうアプリ</span>
              </div>
              <p className="mt-3 text-sm text-gray-600">旅の計画から清算まで、これ一つで完結。</p>
            </div>
            <div>
              <p className="font-semibold">製品</p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li><button onClick={() => scrollTo("features")} className="hover:text-orange-600">機能</button></li>
                <li><button onClick={() => scrollTo("pricing")} className="hover:text-orange-600">料金</button></li>
                <li><a className="hover:text-orange-600" href="#">セキュリティ</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">サポート</p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li><a className="hover:text-orange-600" href="#">ヘルプセンター</a></li>
                <li><a className="hover:text-orange-600" href="#">お問い合わせ</a></li>
                <li><a className="hover:text-orange-600" href="#">利用規約</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">フォロー</p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li><a className="hover:text-orange-600" href="#">X（旧Twitter）</a></li>
                <li><a className="hover:text-orange-600" href="#">Instagram</a></li>
                <li><a className="hover:text-orange-600" href="#">Blog</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 text-xs text-gray-500">© {new Date().getFullYear()} Ryoko Inc. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{desc}</p>
      </CardContent>
    </Card>
  )
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 font-bold text-white">{n}</div>
        <p className="font-semibold">{title}</p>
      </div>
      <p className="mt-2 text-sm text-gray-600">{desc}</p>
    </div>
  )
}

function Testimony({ name, role, text }: { name: string; role: string; text: string }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-amber-300 font-bold text-white">{name[0]}</div>
          <div>
            <p className="leading-tight font-semibold">{name}</p>
            <p className="text-xs text-gray-500">{role}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-700">{text}</p>
      </CardContent>
    </Card>
  )
}

function PriceCard({ name, price, note, features, cta, highlight }: { name: string; price: string; note: string; features: string[]; cta: string; highlight?: boolean }) {
  return (
    <Card className={`rounded-2xl ${highlight ? "border-orange-400 shadow-lg shadow-orange-100" : ""}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{name}</span>
          {highlight && <span className="rounded-full bg-orange-500/10 px-2 py-1 text-xs text-orange-600">おすすめ</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-extrabold">
          {price}
          <span className="text-sm font-normal text-gray-500"> / 月</span>
        </div>
        <p className="mt-1 text-xs text-gray-500">{note}</p>
        <ul className="mt-4 space-y-2 text-sm">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 text-emerald-600" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <Button className="mt-5 w-full rounded-2xl">{cta}</Button>
      </CardContent>
    </Card>
  )
}

function PhoneMock() {
  return (
    <div className="relative mx-auto h-[560px] w-[300px] rounded-[2rem] border bg-white shadow-2xl">
      <div className="absolute inset-x-20 -top-1 mx-auto h-6 rounded-b-2xl bg-gray-900" />
      <div className="p-4">
        <div className="rounded-xl bg-gradient-to-br from-orange-100 to-white p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">沖縄 3 泊 4 日</div>
            <div className="text-xs text-gray-500">2025/11/22 - 25</div>
          </div>
          <div className="mt-3 rounded-xl border bg-white p-3">
            <div className="flex items-center gap-2 text-sm font-semibold"><Calendar className="h-4 w-4"/> Day 1</div>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-center gap-2"><Map className="h-4 w-4"/> 那覇空港 → 国際通り</li>
              <li className="flex items-center gap-2"><Users className="h-4 w-4"/> チェックイン & 夕食</li>
              <li className="flex items-center gap-2"><Wallet className="h-4 w-4"/> 夕食 ¥3,200</li>
            </ul>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            {["しおり", "地図", "支出"].map((t) => (
              <div key={t} className="rounded-lg border bg-white/70 py-2 text-center">{t}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 mx-auto flex w-[60%] items-center justify-center gap-8 text-gray-400">
        <div className="h-1.5 w-14 rounded-full bg-gray-200" />
        <Smartphone className="h-5 w-5" />
      </div>
    </div>
  )
}
