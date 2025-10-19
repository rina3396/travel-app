/** types/trips.ts */

//S-10 旅基本情報
export type Trip = {
    id: string
    title: string
    startDate?: string
    endDate?: string
    members?: { id: string; name: string }[]
}

//trips\[tripId]\days\page.tsx
//S-31 日別しおり
export type Day = {
    id: string
    date: string         // 例: "2025-10-19"
    tripId: string       // 紐づく旅のID
    title?: string       // 例: "1日目"
    note?: string        // 日全体のメモ
    activities: {
        id: string
        title: string
        startTime?: string // "09:00"
        location?: string
        order: number
    }[]
}

//S-32 アクティビティ
// types/trips.ts
export type Activity = {
    id: string
    tripId: string
    title: string
    startTime?: string
    endTime?: string
    location?: string
    note?: string
}


//S-40 予算
export type Participant = {
    id: string
    name: string
}

export type Expense = {
    id: string
    tripId: string
    date: string            // "2025-10-19"
    title: string
    category?: "meal" | "transport" | "lodging" | "ticket" | "other"
    amount: number          // JPY
    paidBy: string          // Participant.id
    splitWith: string[]     // 参加者ID。最小構成では全員を想定
}

//S-50 TODO・持ち物
export type Task = {
    id: string
    tripId: string
    title: string
    kind: "todo" | "packing" // TODO or 持ち物
    done: boolean
    createdAt: string        // ISO
    dueDate?: string         // 任意: 期限（ISO）
    note?: string            // 任意: メモ
}


