import * as React from "react"

type Variant = "default" | "secondary" | "outline"

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant
}

const variantClass: Record<Variant, string> = {
  default: "bg-orange-100 text-orange-800",
  secondary: "bg-gray-100 text-gray-800",
  outline: "border border-gray-200 text-gray-700",
}

export function Badge({ variant = "default", className = "", ...props }: BadgeProps) {
  const base = "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium"
  return <span className={[base, variantClass[variant], className].join(" ")} {...props} />
}

