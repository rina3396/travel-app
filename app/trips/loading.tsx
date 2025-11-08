// app/trips/loading.tsx // トリップ一覧のローディングUI
import Skeleton from "@/components/ui/Skeleton" // スケルトンコンポーネント

export default function TripsLoading() { // ローディングコンポーネント
  return ( // 描画
    <section className="mx-auto w-full max-w-2xl space-y-6 p-4"> {/* 幅と余白調整 */}
      <header className="flex items-center justify-between"> {/* ヘッダー行 */}
        <Skeleton className="h-7 w-28" /> {/* タイトルスケルトン */}
        <div className="hidden sm:block" /> {/* レイアウト調整の空要素 */}
      </header>

      <ul className="grid grid-cols-1 gap-3"> {/* リストグリッド */}
        {Array.from({ length: 4 }).map((_, i) => ( // 4件のプレースホルダー
          <li key={i} className="rounded-2xl border bg-white p-4"> {/* アイテム */}
            <div className="flex items-center justify-between gap-3"> {/* 行 */}
              <div className="min-w-0 flex-1"> {/* タイトル/補足の領域 */}
                <Skeleton className="h-5 w-2/3" /> {/* タイトル */}
                <Skeleton className="mt-2 h-3 w-1/3" /> {/* 補足 */}
              </div>
              <Skeleton className="h-8 w-20" /> {/* 右側のボタン想定 */}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

