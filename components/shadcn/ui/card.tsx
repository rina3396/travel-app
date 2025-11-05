import * as React from "react"

export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const base = "rounded-xl border border-gray-100 bg-white shadow-sm"
  return <div className={[base, className].join(" ")} {...props} />
}

export function CardHeader({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["p-5", className].join(" ")} {...props} />
}

export function CardTitle({ className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={["text-base font-semibold", className].join(" ")} {...props} />
}

export function CardDescription({ className = "", ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={["text-xs text-gray-600", className].join(" ")} {...props} />
}

export function CardContent({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["px-5 pb-5", className].join(" ")} {...props} />
}

