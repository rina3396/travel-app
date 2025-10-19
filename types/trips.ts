// types/trips.ts
export type Trip = {
    id: string
    title: string
    start_date?: string
    end_date?: string
    destination?: string
    description?: string
}

export type Day = {
    id: string
    date: string
    tripId: string
    title?: string
    note?: string
    activities: Activity[]
}

export type Activity = {
    id: string
    tripId: string
    title: string
    startTime?: string
    endTime?: string
    location?: string
    note?: string
    // 任意: day 紐づけ済みにするなら
    dayId?: string
    order_no?: number
}

export type Participant = {
    id: string
    name: string
}

export type Expense = {
    id: string
    tripId: string
    date: string
    title: string
    category?: "meal" | "transport" | "lodging" | "ticket" | "other"
    amount: number
    paidBy: string
    splitWith: string[]
}

export type Task = {
    id: string
    tripId: string
    title: string
    kind: "todo" | "packing"
    done: boolean
    createdAt: string
    dueDate?: string
    note?: string
}
