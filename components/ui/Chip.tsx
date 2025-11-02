import type { ReactNode, ButtonHTMLAttributes } from "react"

type Props = {
  children: ReactNode
  selected?: boolean
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

export default function Chip({ children, selected = false, className = "", ...rest }: Props) {
  const base = [
    "inline-flex items-center gap-1 rounded-2xl border px-3 py-1.5 text-xs",
    // motion + focus
    "transition ease-out duration-200 motion-reduce:transition-none",
    "focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1",
    // subtle lift
    "shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm motion-reduce:transform-none",
  ].join(" ")
  // Invert colors when selected (solid) and on hover for unselected (outline -> solid)
  const style = selected
    ? "border-orange-500 bg-orange-500 text-white active:bg-orange-600"
    : "border-orange-500 bg-white text-orange-700 hover:bg-orange-500 hover:text-white hover:border-transparent active:bg-orange-600"
  return (
    <button className={[base, style, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </button>
  )
}
