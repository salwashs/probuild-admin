<script setup lang="ts">
import type { FormField } from '~/types/visitor-form'
import {
  isVisitorFieldRequired,
  isVisitorFieldVisible,
  visitorFieldLabel
} from '~/utils/visitor-form'

const form = defineModel<Record<string, unknown>>({ required: true })

const props = defineProps<{
  fields: FormField[]
  language?: string
  hideKeys?: string[]
}>()

const language = computed(() => props.language || String(form.value.language || 'id'))

function isHidden(field: FormField) {
  return props.hideKeys?.includes(field.key)
}

function isVisible(field: FormField) {
  return !isHidden(field) && isVisitorFieldVisible(field, form.value)
}

function isRequired(field: FormField) {
  return isVisitorFieldRequired(field, form.value)
}

function setSelect(field: FormField, value: unknown) {
  if (value && typeof value === 'object' && 'value' in (value as Record<string, unknown>)) {
    form.value[field.key] = (value as { value: string }).value
    return
  }
  form.value[field.key] = value
}

function optionItems(field: FormField) {
  return (field.options ?? []).map(opt => ({
    label: language.value === 'en' && opt.labelEn ? opt.labelEn : opt.labelId,
    value: opt.value
  }))
}

function toggleMulti(field: FormField, value: string, checked: boolean | 'indeterminate') {
  const current = Array.isArray(form.value[field.key])
    ? [...(form.value[field.key] as string[])]
    : []
  if (checked) {
    if (!current.includes(value)) current.push(value)
  } else {
    const index = current.indexOf(value)
    if (index >= 0) current.splice(index, 1)
  }
  form.value[field.key] = current
}

function isChecked(field: FormField, value: string) {
  return Array.isArray(form.value[field.key]) && (form.value[field.key] as string[]).includes(value)
}

function numberModel(field: FormField) {
  const value = form.value[field.key]
  if (value == null) return undefined
  return String(value)
}

function groupMembers(field: FormField) {
  return Array.isArray(form.value[field.key])
    ? (form.value[field.key] as Record<string, string>[])
    : []
}

function groupItemFields(field: FormField) {
  const itemFields = field.validation?.itemFields as { key: string }[] | undefined
  const defaults = [
    { key: 'name', labelId: 'Nama', labelEn: 'Name' },
    { key: 'position', labelId: 'Jabatan', labelEn: 'Position' }
  ]
  if (!itemFields?.length) return defaults
  return itemFields.map((spec) => {
    const fallback = defaults.find(item => item.key === spec.key)
    return {
      key: spec.key,
      labelId: fallback?.labelId || spec.key,
      labelEn: fallback?.labelEn || spec.key
    }
  })
}
</script>

<template>
  <div class="space-y-4">
    <template v-for="field in fields" :key="field.key">
      <UFormField
        v-if="isVisible(field)"
        :label="field.type === 'boolean' ? undefined : visitorFieldLabel(field, language)"
        :required="field.type === 'boolean' ? false : isRequired(field)"
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
          :model-value="numberModel(field)"
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
            :label="language === 'en' && opt.labelEn ? opt.labelEn : opt.labelId"
            :model-value="isChecked(field, opt.value)"
            @update:model-value="(checked) => toggleMulti(field, opt.value, checked)"
          />
        </div>

        <UCheckbox
          v-else-if="field.type === 'boolean'"
          :model-value="Boolean(form[field.key])"
          :label="visitorFieldLabel(field, language)"
          @update:model-value="form[field.key] = $event === true"
        />

        <div v-else-if="field.type === 'group'" class="space-y-3">
          <div
            v-for="(member, index) in groupMembers(field)"
            :key="index"
            class="rounded-lg border border-default p-3 space-y-2"
          >
            <p class="text-sm font-medium">
              {{ language === 'en' ? `Member ${index + 1}` : `Anggota ${index + 1}` }}
            </p>
            <UFormField
              v-for="spec in groupItemFields(field)"
              :key="spec.key"
              :label="language === 'en' && spec.labelEn ? spec.labelEn : spec.labelId"
              required
            >
              <UInput v-model="member[spec.key]" class="w-full" />
            </UFormField>
          </div>
          <p v-if="!groupMembers(field).length" class="text-sm text-muted">
            {{ language === 'en' ? 'No accompanying guests.' : 'Tidak ada anggota rombongan.' }}
          </p>
        </div>
      </UFormField>
    </template>
  </div>
</template>
