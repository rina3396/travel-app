// app/loading.tsx // ルート配下のローディングUI
import Skeleton from "@/components/ui/Skeleton" // ローディング用のスケルトンコンポーネント
import Card from "@/components/ui/Card" // カードUIコンポーネント

export default function Loading() { // ローディング表示コンポーネント
  return ( // コンテンツの描画
    <section className="space-y-6 p-4"> {/* 余白とパディングを設定したセクション */}
      <header className="space-y-2"> {/* ヘッダー領域（行間を確保） */}
        <Skeleton className="h-7 w-40" /> {/* タイトル用スケルトン */}
        <Skeleton className="h-4 w-64" /> {/* サブタイトル用スケルトン */}
      </header>

      <Card> {/* 1枚目のカード */}
        <div className="grid gap-2"> {/* 要素間の間隔を持つグリッド */}
          <Skeleton className="h-4 w-1/3" /> {/* 短いテキスト行 */}
          <Skeleton className="h-4 w-2/3" /> {/* やや長いテキスト行 */}
          <Skeleton className="h-4 w-1/2" /> {/* 中程度のテキスト行 */}
        </div>
      </Card>

      <Card> {/* 2枚目のカード */}
        <div className="grid gap-2"> {/* 要素間の間隔を持つグリッド */}
          <Skeleton className="h-4 w-1/4" /> {/* 短いテキスト行 */}
          <Skeleton className="h-4 w-3/5" /> {/* やや長いテキスト行 */}
          <Skeleton className="h-4 w-1/3" /> {/* 中程度のテキスト行 */}
        </div>
      </Card>

      <Card> {/* 3枚目のカード */}
        <div className="grid gap-2"> {/* 要素間の間隔を持つグリッド */}
          <Skeleton className="h-4 w-1/2" /> {/* 中程度のテキスト行 */}
          <Skeleton className="h-4 w-2/5" /> {/* やや短いテキスト行 */}
          <Skeleton className="h-4 w-1/4" /> {/* 短いテキスト行 */}
        </div>
      </Card>
    </section>
  )
}

