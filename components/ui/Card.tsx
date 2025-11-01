import type { ReactNode } from "react"

type Props = {
  children: ReactNode
  className?: string
  title?: string
  description?: string
}

export default function Card({ children, className = "", title, description }: Props) {
  return (
    <section className={["rounded-2xl border bg-white p-4 shadow-sm", className].filter(Boolean).join(" ")}> 
      {(title || description) && (
        <header className="mb-2">
          {title && <h2 className="text-base font-medium">{title}</h2>}
          {description && <p className="text-xs text-gray-600">{description}</p>}
        </header>
      )}
      {children}
    </section>
  )
}

