// app/loading.tsx
import Skeleton from "@/components/ui/Skeleton"
import Card from "@/components/ui/Card"

export default function Loading() {
  return (
    <section className="space-y-6 p-4">
      <header className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </header>

      <Card>
        <div className="grid gap-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </Card>

      <Card>
        <div className="grid gap-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </Card>

      <Card>
        <div className="grid gap-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </Card>
    </section>
  )
}

