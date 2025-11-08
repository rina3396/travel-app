export default function TripSectionLayout({ children }: { children: React.ReactNode }) { // トリップ配下セクションの共通レイアウト
  return ( // コンポーネントの描画
    <section className="space-y-4 p-4"> {/* 余白付きのセクション */}
      {children} {/* 子要素を表示 */}
    </section>
  )
}
