import * as React from "react"

type Variant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "link"

type Size = "sm" | "md" | "lg"

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  asChild?: boolean
}

const variantClass: Record<Variant, string> = {
  default: "bg-orange-500 text-white hover:bg-orange-600",
  secondary: "bg-gray-900 text-white hover:bg-black",
  outline:
    "border border-orange-500 bg-white text-orange-700 hover:bg-orange-500 hover:text-white hover:border-transparent active:bg-orange-600",
  ghost: "text-gray-700 hover:bg-gray-900 hover:text-white",
  link: "underline underline-offset-4 text-orange-700 hover:text-orange-800",
}

const sizeClass: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
}

export function Button({
  className = "",
  variant = "default",
  size = "md",
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const base = [
    "inline-flex items-center justify-center rounded-md font-medium",
    "transition ease-out duration-200 motion-reduce:transition-none",
    "shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none",
    "focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1",
    "disabled:opacity-50",
  ].join(" ")
  const cls = [base, variantClass[variant], sizeClass[size], className]
    .filter(Boolean)
    .join(" ")
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: [cls, (children as any).props?.className].filter(Boolean).join(" "),
    })
  }
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  )
}
