<script setup lang="ts">
type FieldOption = {
  value: string
  labelId: string
  labelEn?: string
}

type FieldCondition = {
  field: string
  eq?: unknown
  gt?: number
  contains?: string
}

type FieldConditions = {
  requiredIf?: FieldCondition
  showIf?: FieldCondition
}

type FormField = {
  key: string
  labelId: string
  labelEn?: string | null
  type: string
  required: boolean
  sortOrder: number
  options?: FieldOption[] | null
  conditions?: FieldConditions | null
  validation?: Record<string, unknown> | null
}

const props = defineProps<{
  open: boolean
  fields: FormField[]
  visitor?: Record<string, unknown> | null
  eventId: string
  submitting?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [payload: Record<string, unknown>]
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
})

const form = reactive<Record<string, unknown>>({})

function conditionMatches(condition: FieldCondition | undefined) {
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

function isVisible(field: FormField) {
  if (!field.conditions?.showIf) return true
  return conditionMatches(field.conditions.showIf)
}

function isRequired(field: FormField) {
  if (field.required) return true
  if (field.conditions?.requiredIf) {
    return conditionMatches(field.conditions.requiredIf)
  }
  return false
}

function defaultValue(field: FormField) {
  if (field.type === 'boolean') return false
  if (field.type === 'multiselect' || field.type === 'group') return []
  if (field.type === 'number') return field.key === 'partySize' ? 1 : null
  if (field.key === 'language') return 'id'
  return ''
}

function emptyGroupItem(field: FormField) {
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

function initForm() {
  const next: Record<string, unknown> = {}
  for (const field of props.fields) {
    const existing = props.visitor?.[field.key]
    next[field.key] = existing === undefined || existing === null
      ? defaultValue(field)
      : existing
  }
  Object.keys(form).forEach(key => delete form[key])
  Object.assign(form, next)
  syncGroupMembers()
}

function syncGroupMembers() {
  const groupField = props.fields.find(field => field.type === 'group')
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

watch(() => form.partySize, () => syncGroupMembers())

watch(
  () => [props.open, props.visitor, props.fields] as const,
  () => {
    if (props.open) initForm()
  },
  { immediate: true }
)

function setSelect(field: FormField, value: unknown) {
  // #region agent log
  fetch('http://127.0.0.1:7887/ingest/876787a5-7048-4aed-a76a-643efa54c98c', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '56df81' }, body: JSON.stringify({ sessionId: '56df81', runId: 'post-fix', hypothesisId: 'H1', location: 'VisitorFormModal.vue:setSelect', message: 'setSelect invoked', data: { fieldKey: field.key, valueType: typeof value }, timestamp: Date.now() }) }).catch(() => {})
  // #endregion
  if (value && typeof value === 'object' && 'value' in (value as Record<string, unknown>)) {
    form[field.key] = (value as { value: string }).value
    return
  }
  form[field.key] = value
}

function optionItems(field: FormField) {
  const items = (field.options ?? []).map(opt => ({
    label: opt.labelId,
    value: opt.value
  }))
  // #region agent log
  fetch('http://127.0.0.1:7887/ingest/876787a5-7048-4aed-a76a-643efa54c98c', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '56df81' }, body: JSON.stringify({ sessionId: '56df81', runId: 'post-fix', hypothesisId: 'H3', location: 'VisitorFormModal.vue:optionItems', message: 'optionItems invoked', data: { fieldKey: field.key, itemCount: items.length }, timestamp: Date.now() }) }).catch(() => {})
  // #endregion
  return items
}

function toggleMulti(field: FormField, value: string, checked: boolean | 'indeterminate') {
  const current = Array.isArray(form[field.key]) ? [...(form[field.key] as string[])] : []
  if (checked) {
    if (!current.includes(value)) current.push(value)
  } else {
    const index = current.indexOf(value)
    if (index >= 0) current.splice(index, 1)
  }
  form[field.key] = current
}

function isChecked(field: FormField, value: string) {
  return Array.isArray(form[field.key]) && (form[field.key] as string[]).includes(value)
}

const title = computed(() => props.visitor ? 'Edit Visitor' : 'Tambah Visitor')

// #region agent log
fetch('http://127.0.0.1:7887/ingest/876787a5-7048-4aed-a76a-643efa54c98c', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '56df81' }, body: JSON.stringify({ sessionId: '56df81', runId: 'post-fix', hypothesisId: 'H1', location: 'VisitorFormModal.vue:setup', message: 'VisitorFormModal compiled and setup ran', data: { fieldCount: props.fields.length, hasOptionItems: typeof optionItems === 'function', hasSetSelect: typeof setSelect === 'function' }, timestamp: Date.now() }) }).catch(() => {})
// #endregion

function onSubmit() {
  emit('submit', { ...form, eventId: props.eventId })
}
</script>

<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">{{ title }}</h3>
            <UButton icon="i-lucide-x" color="neutral" variant="ghost" square @click="isOpen = false" />
          </div>
        </template>

        <form class="max-h-[70vh] space-y-4 overflow-y-auto pr-1" @submit.prevent="onSubmit">
          <template v-for="field in fields" :key="field.key">
            <UFormField
              v-if="isVisible(field) && field.key !== 'submittedAt'"
              :label="field.labelId"
              :required="isRequired(field)"
            >
              <UInput
                v-if="field.type === 'text' || field.type === 'tel' || field.type === 'email'"
                :model-value="String(form[field.key] ?? '')"
                :type="field.type === 'email' ? 'email' : 'text'"
                class="w-full"
                @update:model-value="form[field.key] = $event"
              />

              <UInput
                v-else-if="field.type === 'number'"
                :model-value="form[field.key] as number | string | null"
                type="number"
                class="w-full"
                @update:model-value="form[field.key] = $event === '' || $event == null ? null : Number($event)"
              />

              <UTextarea
                v-else-if="field.type === 'textarea'"
                :model-value="String(form[field.key] ?? '')"
                class="w-full"
                :rows="3"
                @update:model-value="form[field.key] = $event"
              />

              <USelect
                v-else-if="field.type === 'select'"
                :model-value="(form[field.key] as string) || undefined"
                :items="optionItems(field)"
                value-key="value"
                class="w-full"
                @update:model-value="setSelect(field, $event)"
              />

              <div v-else-if="field.type === 'multiselect'" class="flex flex-col gap-2">
                <UCheckbox
                  v-for="opt in field.options || []"
                  :key="opt.value"
                  :label="opt.labelId"
                  :model-value="isChecked(field, opt.value)"
                  @update:model-value="(checked) => toggleMulti(field, opt.value, checked)"
                />
              </div>

              <UCheckbox
                v-else-if="field.type === 'boolean'"
                :model-value="Boolean(form[field.key])"
                :label="field.labelId"
                @update:model-value="form[field.key] = $event === true"
              />

              <div v-else-if="field.type === 'group'" class="space-y-3">
                <div
                  v-for="(member, index) in (form[field.key] as Record<string, string>[])"
                  :key="index"
                  class="rounded-lg border border-default p-3 space-y-2"
                >
                  <p class="text-sm font-medium">Anggota {{ index + 1 }}</p>
                  <UFormField label="Nama" required>
                    <UInput v-model="member.name" class="w-full" />
                  </UFormField>
                  <UFormField label="Jabatan" required>
                    <UInput v-model="member.position" class="w-full" />
                  </UFormField>
                </div>
                <p v-if="!(form[field.key] as unknown[])?.length" class="text-sm text-muted">
                  Tidak ada anggota rombongan.
                </p>
              </div>
            </UFormField>
          </template>
        </form>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton label="Batal" color="neutral" variant="outline" @click="isOpen = false" />
            <UButton
              :label="visitor ? 'Simpan' : 'Tambah'"
              icon="i-lucide-check"
              :loading="submitting"
              @click="onSubmit"
            />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
