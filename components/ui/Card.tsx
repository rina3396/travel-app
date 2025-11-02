import type { ReactNode } from "react"

type Props = {
  children: ReactNode
  className?: string
  title?: string
  description?: string
}

export default function Card({ children, className = "", title, description }: Props) {
  return (
    <section
      className={[
        // modern card: smaller radius, lighter border, smooth shadow on hover
        "rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
        className,
      ].filter(Boolean).join(" ")}
    >
      {(title || description) && (
        <header className="mb-3">
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          {description && <p className="text-xs text-gray-600">{description}</p>}
        </header>
      )}
      {children}
    </section>
  )
}
