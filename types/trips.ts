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

// 共通プリミティブ
export type UUID = string
export type ISODate = string // YYYY-MM-DD
export type ISODateTime = string // ISO8601

// 一覧・詳細表示向け（UIドメイン）
export type TripSummary = {
    id: UUID
    title: string | null
    startDate: ISODate | null
    endDate: ISODate | null
}

export type TripIndex = {
    id: UUID
    title: string
    description?: string | null
    startDate?: ISODate | null
    endDate?: ISODate | null
    currencyCode?: string
}

// 予算
export type Budget = {
    id?: UUID
    tripId: UUID
    amount: number
    currency: string
    updatedAt?: ISODateTime
}

// メンバー/共有
export type MemberRole = "owner" | "editor" | "viewer"
export type TripMember = {
    tripId: UUID
    userId: UUID
    role: MemberRole
    addedAt?: ISODateTime
}

export type ShareLink = {
    id: UUID
    tripId: UUID
    isEnabled: boolean
    expiresAt?: ISODateTime | null
    createdAt: ISODateTime
}

// 作成ウィザード用の状態
export type NewTripWizardState = {
    title: string
    startDate?: ISODate | ""
    endDate?: ISODate | ""
    participants: string[] // emails
    budgetAmount?: number | ""
    currency?: string
    isPublic?: boolean
}

// API リクエスト/レスポンス（UI <-> API）
export type CreateTripRequest = {
    title: string
    // APIの互換用に snake/camel 両方許容
    start_date?: ISODate | null
    end_date?: ISODate | null
    startDate?: ISODate | null
    endDate?: ISODate | null
    participants?: string[]
    budget?: { amount: number; currency: string }
    share?: { public?: boolean }
}

export type CreateTripResponse = {
    id: UUID
    warning?: string
}

export type CreateActivityRequest = {
    title: string
    startTime?: string | null
    endTime?: string | null
    location?: string | null
    note?: string | null
}

export type UpdateActivityRequest = Partial<CreateActivityRequest> & {
    dayId?: UUID | null
    orderNo?: number
}

export type AssignDayRequest = {
    activityId: UUID
    date: ISODate
}

export type ReorderActivitiesRequest = {
    date: ISODate
    orders: { activityId: UUID; orderNo: number }[]
}

export type CreateExpenseRequest = {
    date: ISODate
    title: string
    category?: "meal" | "transport" | "lodging" | "ticket" | "other"
    amount: number
}

export type CreateTaskRequest = {
    title: string
    kind: Task["kind"]
}

export type UpdateTaskRequest = Partial<CreateTaskRequest> & {
  done?: boolean
  sortOrder?: number
}

// ===== DBスキーマに沿ったsnake_case型（画面の直接fetchでも使うことがあるため） =====
export type DbTripSummary = {
  id: UUID
  title: string | null
  start_date: ISODate | null
  end_date: ISODate | null
}

export type DbTripDetail = {
  id: UUID
  title: string
  start_date?: ISODate | null
  end_date?: ISODate | null
}

export type DbActivity = {
  id: UUID
  title: string
  start_time: string | null
  end_time: string | null
  location: string | null
  day_id?: UUID | null
}

export type DbExpense = {
  id: UUID
  date: ISODate
  title: string
  category: string | null
  amount: number
  paid_by: UUID | null
}

export type DbTask = {
  id: UUID
  title: string
  kind: 'todo' | 'packing'
  done: boolean
}

export type DbShareLink = {
  id: UUID
  is_enabled: boolean
  expires_at: ISODateTime | null
}

export type DbMember = {
  user_id: UUID
  role: 'viewer' | 'editor' | 'owner' | null
}
