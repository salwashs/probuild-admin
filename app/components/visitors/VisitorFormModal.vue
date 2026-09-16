<script setup lang="ts">
import type { FormField } from '~/types/visitor-form'
import { createVisitorFormState, syncGroupMembers } from '~/utils/visitor-form'
import VisitorDynamicForm from '~/components/visitors/VisitorDynamicForm.vue'

const props = defineProps<{
  open: boolean
  fields: FormField[]
  visitor?: Record<string, unknown> | null
  eventId: string
  submitting?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'submit': [payload: Record<string, unknown>]
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value)
})

const form = ref<Record<string, unknown>>({})

function initForm() {
  form.value = createVisitorFormState(props.fields, props.visitor)
}

watch(() => form.value.partySize, () => {
  syncGroupMembers(props.fields, form.value)
})

watch(
  () => [props.open, props.visitor, props.fields] as const,
  () => {
    if (props.open) initForm()
  },
  { immediate: true }
)

const title = computed(() => props.visitor ? 'Edit Visitor' : 'Tambah Visitor')

function onSubmit() {
  emit('submit', { ...form.value, eventId: props.eventId })
}
</script>

<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">
              {{ title }}
            </h3>
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              square
              @click="isOpen = false"
            />
          </div>
        </template>

        <form class="max-h-[70vh] overflow-y-auto pr-1" @submit.prevent="onSubmit">
          <VisitorDynamicForm v-model="form" :fields="fields" :hide-keys="['submittedAt']" />
        </form>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              label="Batal"
              color="neutral"
              variant="outline"
              @click="isOpen = false"
            />
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
