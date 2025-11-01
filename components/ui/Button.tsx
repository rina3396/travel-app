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
  const { children, variant = "primary", size = "md", className = "", ...rest } = props as any

  const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 disabled:opacity-50"
  const variants: Record<Variant, string> = {
    primary: "bg-orange-500 text-white hover:bg-orange-600",
    outline: "border border-orange-500 text-orange-700 hover:bg-orange-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-gray-700 hover:bg-gray-50",
  }
  const sizes: Record<Size, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
  }
  const cls = [base, variants[variant], sizes[size], className].filter(Boolean).join(" ")

  if ("href" in props && props.href) {
    const { href, ...aRest } = rest
    return (
      <Link href={props.href} className={cls} {...(aRest as any)}>
        {children}
      </Link>
    )
  }

  return (
    <button className={cls} {...(rest as any)}>
      {children}
    </button>
  )
}

