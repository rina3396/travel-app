// app/guide/page.tsx — ガイドページ
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
        <h1 className="text-2xl font-bold">使い方ガイド</h1>
        <p className="text-sm text-gray-600">このアプリの基本的な使い方を紹介します。</p>
      </header>

      <Card title="新規旅行を作成" description="まずは旅行を作成しましょう。">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">タイトルや期間を入力して旅行を作成できます。</div>
          <Button href="/trips/new">新規作成</Button>
        </div>
      </Card>

      <Card title="旅行一覧" description="作成した旅行を一覧で確認できます。">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">詳細の確認や編集もここから行えます。</div>
          <Button href="/trips" variant="outline">一覧を見る</Button>
        </div>
      </Card>

      <Card title="主な機能" description="ダッシュボードから次の機能にアクセスできます。">
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li>日程: 旅行の日付ごとに予定を管理します。</li>
          <li>アクティビティ: 観光や食事などの予定を追加します。</li>
          <li>費用・予算: 支出を記録し、予算内に収めます。</li>
          <li>TODO・タスク: やることをチェックリストで管理します。</li>
          <li>設定: 旅行名や参加者などを変更します。</li>
          <li>プレビュー／共有: 旅行プランをプレビューし、共有します。</li>
        </ul>
      </Card>

      {/* <footer className="pt-2 text-center text-xs text-gray-500">このガイドは随時更新されます。</footer> */}
    </section>
  )
}

