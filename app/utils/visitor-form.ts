import type { FieldCondition, FormField } from '~/types/visitor-form'

function conditionMatches(condition: FieldCondition | undefined, form: Record<string, unknown>) {
  if (!condition) return false
  const raw = form[condition.field]

  if (condition.eq !== undefined) {
    return raw === condition.eq || String(raw) === String(condition.eq)
  }
  if (condition.gt !== undefined) {
    return Number(raw) > condition.gt
  }
  if (condition.contains !== undefined) {
    if (Array.isArray(raw)) {
      return raw.map(String).includes(condition.contains)
    }
    return String(raw ?? '').includes(condition.contains)
  }
  return false
}

export function isVisitorFieldVisible(field: FormField, form: Record<string, unknown>) {
  if (!field.conditions?.showIf) return true
  return conditionMatches(field.conditions.showIf, form)
}

export function isVisitorFieldRequired(field: FormField, form: Record<string, unknown>) {
  if (field.required) return true
  if (field.conditions?.requiredIf) {
    return conditionMatches(field.conditions.requiredIf, form)
  }
  return false
}

export function visitorFieldLabel(field: FormField, language: string) {
  if (language === 'en' && field.labelEn) return field.labelEn
  return field.labelId
}

function defaultValue(field: FormField) {
  if (field.type === 'boolean') return false
  if (field.type === 'multiselect' || field.type === 'group') return []
  if (field.type === 'number') return field.key === 'partySize' ? 1 : null
  if (field.key === 'language') return 'id'
  return ''
}

export function emptyGroupItem(field: FormField) {
  const itemFields = (field.validation?.itemFields as { key: string }[] | undefined) ?? [
    { key: 'name' },
    { key: 'position' }
  ]
  const item: Record<string, string> = {}
  for (const spec of itemFields) {
    item[spec.key] = ''
  }
  return item
}

export function syncGroupMembers(fields: FormField[], form: Record<string, unknown>) {
  const groupField = fields.find(field => field.type === 'group')
  if (!groupField) return
  const partySize = Number(form.partySize) || 1
  const expected = Math.max(partySize - 1, 0)
  const current = Array.isArray(form[groupField.key])
    ? [...(form[groupField.key] as Record<string, string>[])]
    : []
  while (current.length < expected) current.push(emptyGroupItem(groupField))
  if (current.length > expected) current.splice(expected)
  form[groupField.key] = current
}

export function createVisitorFormState(
  fields: FormField[],
  visitor?: Record<string, unknown> | null
) {
  const next: Record<string, unknown> = {}
  for (const field of fields) {
    const existing = visitor?.[field.key]
    next[field.key] = existing === undefined || existing === null
      ? defaultValue(field)
      : existing
  }
  syncGroupMembers(fields, next)
  return next
}
