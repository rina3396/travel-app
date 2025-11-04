import Link from "next/link"
import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react"

type Variant = "primary" | "outline" | "danger" | "ghost"
type Size = "sm" | "md"

type CommonProps = {
  children: ReactNode
  variant?: Variant
  size?: Size
  className?: string
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }
type LinkProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

export default function Button(props: ButtonProps | LinkProps) {
  const { children, variant = "primary", size = "md", className = "" } = props

  // Add subtle micro-interactions: lift on hover, press on active, shadow transition
  const base = [
    "inline-flex items-center justify-center rounded-md font-medium",
    // transitions and motion preferences
    "transition ease-out duration-200 motion-reduce:transition-none",
    // color/focus states
    "transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1",
    // movement + shadow
    "shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm",
    // slightly compress on press (reduced motion users won't see transform)
    "active:scale-[0.98] motion-reduce:transform-none",
    // disabled visuals
    "disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none",
  ].join(" ")
  const variants: Record<Variant, string> = {
    primary: "bg-orange-500 text-white hover:bg-orange-600",
    // Outline: invert on hover to avoid double-line look and emphasize intent
    // - default: white bg + orange border/text
    // - hover: solid orange bg + white text, border becomes transparent to prevent double lines
    outline: "border border-orange-500 bg-white text-orange-700 hover:bg-orange-500 hover:text-white hover:border-transparent active:bg-orange-600",
    danger: "bg-red-600 text-white hover:bg-red-700",
    // Ghost: invert to dark bg with white text on hover (no border)
    ghost: "text-gray-700 hover:bg-gray-900 hover:text-white",
  }
  const sizes: Record<Size, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
  }
  const cls = [base, variants[variant], sizes[size], className].filter(Boolean).join(" ")

  if ("href" in props && props.href) {
    const { href, ...aRest } = props
    return (
      <Link href={href} className={cls} {...aRest}>
        {children}
      </Link>
    )
  }

  const { ...btnRest } = props
  return (
    <button className={cls} {...btnRest}>
      {children}
    </button>
  )
}

