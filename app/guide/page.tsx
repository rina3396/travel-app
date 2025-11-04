// app/guide/page.tsx
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import BackButton from "@/components/ui/BackButton"

export default function GuidePage() {
  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 p-4">
      <div>
        <BackButton label="戻る" />
      </div>
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">使い方</h1>
        <p className="text-sm text-gray-600">このアプリの操作方法をまとめています。</p>
      </header>

      <Card title="はじめに" description="旅を作成してダッシュボードから各機能へ移動します。">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">新規作成ボタンから、旅のしおりを作成できます。</div>
          <Button href="/trips/new">新規作成</Button>
        </div>
      </Card>

      <Card title="旅の一覧" description="作成済みの旅を確認できます。">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">旅の一覧ボタンから、作成した旅のしおりを開くことができます。</div>
          <Button href="/trips" variant="outline">旅の一覧</Button>
        </div>
      </Card>

      <Card title="主な機能" description="ダッシュボードから各ページに移動して編集します。">
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>日程: 日付ごとの予定を管理します。</li>
          <li>アクティビティ: 立ち寄り先や予定を追加します。</li>
          <li>予算・費用: 支出を登録し合計を確認します。</li>
          <li>TODO・持ち物: 準備や荷物のチェックリストです。</li>
          <li>共有: 旅のリンクを共有します。</li>
          <li>プレビュー: 作成した旅のしおり閲覧、出力ができます。</li>
        </ul>
      </Card>

      {/* <footer className="pt-2 text-center text-xs text-gray-500">このガイドは随時更新されます。</footer> */}
    </section>
  )
}
