"use client"

import { usePathname } from "next/navigation"
import BackButton from "@/components/ui/BackButton"

type Props = {
  className?: string
  href?: string
  /** 表示するパスの条件（既定: /trips/ 配下で表示） */
  matchPath?: (pathname: string | null) => boolean
}

export default function FloatingBackButton({ className = "", href = "/trips", matchPath }: Props) {
  const pathname = usePathname()
  const shouldShow = (matchPath ?? ((p: string | null) => !!p && p.startsWith("/trips/")))(pathname)
  if (!shouldShow) return null

  // 画面左下に固定。セーフエリアを考慮しつつ、
  // 大きな画面ではコンテナ（max-w-screen-lg）の左余白に沿うようにオフセット。
  return (
    <div
      className={[
        "pointer-events-none fixed z-40",
        "left-4 sm:left-6",
        "bottom-4 sm:bottom-6",
        // lg 以上では (100vw - 1024px)/2 + 1rem に寄せる
        "lg:left-[calc((100vw-1024px)/2+1rem)]",
        className,
      ].filter(Boolean).join(" ")}
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)" }}
      aria-hidden={true}
    >
      <div className="pointer-events-auto">
        <BackButton href={href} />
      </div>
    </div>
  )
}
