export type FieldOption = {
  value: string
  labelId: string
  labelEn?: string
}

export type FieldCondition = {
  field: string
  eq?: unknown
  gt?: number
  contains?: string
}

export type FieldConditions = {
  requiredIf?: FieldCondition
  showIf?: FieldCondition
}

export type FormField = {
  key: string
  labelId: string
  labelEn?: string | null
  type: string
  required: boolean
  sortOrder: number
  showInTable?: boolean
  options?: FieldOption[] | null
  conditions?: FieldConditions | null
  validation?: Record<string, unknown> | null
}

export type PublicEvent = {
  slug: string
  name: string
  description: string | null
  isActive: boolean
  startsAt: string | null
  endsAt: string | null
  fields: FormField[]
}

export type RegistrationRecord = {
  registered: boolean
  registrationId?: string
  fullName?: string | null
  submittedAt?: string | null
}
