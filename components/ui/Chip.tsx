import type { ReactNode, ButtonHTMLAttributes } from "react"

type Props = {
  children: ReactNode
  selected?: boolean
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

export default function Chip({ children, selected = false, className = "", ...rest }: Props) {
  const base = "rounded-2xl border px-3 py-1.5 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1"
  const style = selected ? "bg-orange-50 border-orange-500 text-orange-700" : "hover:bg-orange-50"
  return (
    <button className={[base, style, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </button>
  )
}

