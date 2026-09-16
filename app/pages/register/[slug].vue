<script setup lang="ts">
import type { PublicEvent, RegistrationRecord } from '~/types/visitor-form'
import { createVisitorFormState, syncGroupMembers } from '~/utils/visitor-form'
import {
  getStoredRegistration,
  getVisitorDeviceId,
  storeRegistration
} from '~/utils/visitor-device'
import VisitorDynamicForm from '~/components/visitors/VisitorDynamicForm.vue'

definePageMeta({
  layout: 'public'
})

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const language = ref<'id' | 'en'>('id')
const form = ref<Record<string, unknown>>({})
const submitting = ref(false)
const checking = ref(true)
const submitError = ref('')
const fieldErrors = ref<Record<string, string[]>>({})
const existing = ref<RegistrationRecord | null>(null)
const success = ref<RegistrationRecord | null>(null)

const { data: event, error, status } = await useFetch<PublicEvent>(
  () => `/api/events/${slug.value}`,
  { watch: [slug] }
)

const copy = computed(() => language.value === 'en'
  ? {
      submit: 'Submit registration',
      submitting: 'Submitting...',
      alreadyTitle: 'You are already registered',
      alreadyBody: 'This device has already submitted visitor data. Duplicate scans are not allowed.',
      successTitle: 'Registration recorded',
      successBody: 'Please keep this registration ID. You do not need to scan the QR again.',
      closedTitle: 'Registration is closed',
      closedBody: 'This event is not accepting visitor registrations right now.',
      missing: 'Event not found.',
      onceHint: 'Each visitor may register only once from this device.',
      language: 'Language'
    }
  : {
      submit: 'Kirim pendaftaran',
      submitting: 'Mengirim...',
      alreadyTitle: 'Anda sudah terdaftar',
      alreadyBody: 'Perangkat ini sudah mengirim data visitor. Scan ulang tidak akan membuat data baru.',
      successTitle: 'Pendaftaran tercatat',
      successBody: 'Simpan ID registrasi ini. Anda tidak perlu scan QR lagi.',
      closedTitle: 'Pendaftaran ditutup',
      closedBody: 'Event ini sedang tidak menerima registrasi visitor.',
      missing: 'Event tidak ditemukan.',
      onceHint: 'Setiap visitor hanya dapat mendaftar sekali dari perangkat ini.',
      language: 'Bahasa'
    })

watch(event, (value) => {
  if (!value?.fields) return
  form.value = createVisitorFormState(value.fields)
  form.value.language = language.value
}, { immediate: true })

watch(language, (value) => {
  form.value.language = value
})

watch(() => form.value.partySize, () => {
  if (event.value?.fields) syncGroupMembers(event.value.fields, form.value)
})

async function loadRegistrationStatus() {
  checking.value = true
  try {
    const stored = getStoredRegistration(slug.value)
    if (stored) {
      existing.value = { registered: true, ...stored }
      return
    }

    const deviceId = getVisitorDeviceId()
    if (!deviceId) return

    const result = await $fetch<RegistrationRecord>(`/api/events/${slug.value}/registration`, {
      query: { deviceId }
    })
    if (result.registered) {
      existing.value = result
      storeRegistration(slug.value, {
        registrationId: result.registrationId || '',
        fullName: result.fullName,
        submittedAt: result.submittedAt
      })
    }
  } catch {
    // Keep the form available if status check fails; server still enforces one-scan.
  } finally {
    checking.value = false
  }
}

onMounted(loadRegistrationStatus)

const hideKeys = ['submittedAt', 'language']

const result = computed(() => success.value || existing.value)

async function onSubmit() {
  if (!event.value || submitting.value) return
  submitError.value = ''
  fieldErrors.value = {}
  submitting.value = true
  try {
    const deviceId = getVisitorDeviceId()
    const payload = {
      ...form.value,
      language: language.value,
      submittedAt: new Date().toISOString(),
      deviceId
    }
    const response = await $fetch<{ success: boolean, registrationId: string }>(
      `/api/events/${slug.value}/visitors`,
      { method: 'POST', body: payload }
    )
    const record = {
      registered: true,
      registrationId: response.registrationId,
      fullName: String(form.value.fullName || ''),
      submittedAt: payload.submittedAt
    }
    storeRegistration(slug.value, record)
    success.value = record
  } catch (err: unknown) {
    const errorData = err as {
      data?: {
        message?: string
        data?: {
          message?: string
          errors?: Record<string, string[]>
          registrationId?: string
        }
        errors?: Record<string, string[]>
      }
    }
    const nested = errorData?.data?.data
    const validationErrors = nested?.errors || errorData?.data?.errors
    if (validationErrors) fieldErrors.value = validationErrors

    const registrationId = nested?.registrationId
    if (registrationId) {
      const record = {
        registered: true,
        registrationId,
        fullName: String(form.value.fullName || ''),
        submittedAt: new Date().toISOString()
      }
      storeRegistration(slug.value, record)
      existing.value = record
      return
    }

    submitError.value = nested?.message || errorData?.data?.message || (
      language.value === 'en'
        ? 'Registration failed. Please check the form and try again.'
        : 'Pendaftaran gagal. Periksa isian form lalu coba lagi.'
    )
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-zinc-100 dark:from-gray-950 dark:via-gray-950 dark:to-black">
    <div class="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-medium text-primary">
            Registrasi Visitor
          </p>
          <h1 class="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {{ event?.name || 'Memuat event...' }}
          </h1>
          <p v-if="event?.description" class="mt-2 text-sm text-muted">
            {{ event.description }}
          </p>
        </div>
        <USelect
          v-model="language"
          :items="[{ label: 'Indonesia', value: 'id' }, { label: 'English', value: 'en' }]"
          value-key="value"
          class="w-36"
        />
      </div>

      <UCard class="shadow-sm">
        <div v-if="status === 'pending' || checking" class="py-12 text-center text-muted">
          Memuat formulir...
        </div>

        <div v-else-if="error || !event" class="py-8 text-center">
          <UIcon name="i-lucide-circle-x" class="mx-auto size-10 text-error" />
          <p class="mt-3 font-medium">
            {{ copy.missing }}
          </p>
        </div>

        <div v-else-if="!event.isActive" class="py-8 text-center">
          <UIcon name="i-lucide-lock" class="mx-auto size-10 text-muted" />
          <h2 class="mt-3 text-lg font-semibold">
            {{ copy.closedTitle }}
          </h2>
          <p class="mt-1 text-sm text-muted">
            {{ copy.closedBody }}
          </p>
        </div>

        <div v-else-if="result?.registered" class="py-8 text-center space-y-3">
          <div class="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10">
            <UIcon name="i-lucide-badge-check" class="size-8 text-primary" />
          </div>
          <h2 class="text-xl font-semibold">
            {{ success ? copy.successTitle : copy.alreadyTitle }}
          </h2>
          <p class="text-sm text-muted">
            {{ success ? copy.successBody : copy.alreadyBody }}
          </p>
          <div class="mx-auto max-w-sm rounded-xl border border-default bg-elevated/50 px-4 py-3">
            <p class="text-xs uppercase tracking-wide text-muted">
              ID Registrasi
            </p>
            <p class="mt-1 font-mono text-lg font-semibold">
              {{ result.registrationId }}
            </p>
            <p v-if="result.fullName" class="mt-1 text-sm text-muted">
              {{ result.fullName }}
            </p>
          </div>
        </div>

        <form v-else class="space-y-5" @submit.prevent="onSubmit">
          <UAlert
            color="neutral"
            variant="subtle"
            icon="i-lucide-scan-line"
            :description="copy.onceHint"
          />

          <VisitorDynamicForm
            v-model="form"
            :fields="event.fields"
            :language="language"
            :hide-keys="hideKeys"
          />

          <UAlert
            v-if="submitError"
            color="error"
            variant="subtle"
            :title="submitError"
            :description="Object.values(fieldErrors).flat().slice(0, 3).join(' ')"
          />

          <UButton
            type="submit"
            :label="submitting ? copy.submitting : copy.submit"
            icon="i-lucide-send"
            size="lg"
            block
            :loading="submitting"
          />
        </form>
      </UCard>
    </div>
  </div>
</template>
