// app/trips/loading.tsx
import Skeleton from "@/components/ui/Skeleton"

export default function TripsLoading() {
  return (
    <section className="mx-auto w-full max-w-2xl space-y-6 p-4">
      <header className="flex items-center justify-between">
        <Skeleton className="h-7 w-28" />
        <div className="hidden sm:block" />
      </header>

      <ul className="grid grid-cols-1 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <li key={i} className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="mt-2 h-3 w-1/3" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

