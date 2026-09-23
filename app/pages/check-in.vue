<script setup lang="ts">
import QRCode from 'qrcode'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

type CheckInVisitor = {
  id: string
  registrationId: string
  fullName?: string | null
  email?: string | null
  phone?: string | null
  whatsapp?: string | null
  institution?: string | null
  position?: string | null
  checkedInAt?: string | Date | null
  event?: {
    id: string
    slug: string
    name: string
  }
}

type CheckInResult = {
  status: 'success' | 'already' | 'error'
  message: string
  visitor: CheckInVisitor | null
}

const config = useRuntimeConfig()
const toast = useToast()

const scannerId = 'check-in-qr-reader'
const scanner = ref<Html5Qrcode | null>(null)
const scanning = ref(false)
const starting = ref(false)
const processing = ref(false)
const manualId = ref('')
const result = ref<CheckInResult | null>(null)
const registerQrDataUrl = ref('')
const lookupQrDataUrl = ref('')
const showRegisterQr = ref(false)
const showLookupQr = ref(false)

const registerUrl = computed(() =>
  String(config.public.visitorRegisterUrl || '').trim()
)
const lookupUrl = computed(() =>
  String(config.public.visitorLookupUrl || '').trim()
)

async function buildQrDataUrl(url: string) {
  if (!url) return ''
  try {
    return await QRCode.toDataURL(url, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: 'M'
    })
  } catch {
    return ''
  }
}

onMounted(async () => {
  registerQrDataUrl.value = await buildQrDataUrl(registerUrl.value)
  lookupQrDataUrl.value = await buildQrDataUrl(lookupUrl.value)
})

onBeforeUnmount(async () => {
  await stopScanner()
})

async function startScanner() {
  if (starting.value || scanning.value) return
  starting.value = true
  result.value = null

  try {
    if (!scanner.value) {
      scanner.value = new Html5Qrcode(scannerId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false
      })
    }

    await scanner.value.start(
      { facingMode: 'environment' },
      {
        fps: 8,
        qrbox: { width: 240, height: 240 },
        aspectRatio: 1
      },
      async (decodedText) => {
        await handleDecoded(decodedText)
      },
      () => {}
    )
    scanning.value = true
  } catch (error: unknown) {
    const message
      = error instanceof Error
        ? error.message
        : 'Gagal membuka kamera. Izinkan akses kamera di browser.'
    toast.add({
      title: 'Kamera tidak tersedia',
      description: message,
      color: 'error'
    })
  } finally {
    starting.value = false
  }
}

async function stopScanner() {
  if (!scanner.value) return
  try {
    const state = scanner.value.getState()
    // 2 = SCANNING, 3 = PAUSED
    if (state === 2 || state === 3) {
      await scanner.value.stop()
    }
  } catch {
    // ignore stop errors
  }
  scanning.value = false
}

async function handleDecoded(raw: string) {
  if (processing.value) return
  const registrationId = raw.trim()
  if (!registrationId) return

  processing.value = true
  await stopScanner()

  try {
    await submitCheckIn(registrationId)
  } finally {
    processing.value = false
  }
}

async function submitManual() {
  const registrationId = manualId.value.trim()
  if (!registrationId) {
    toast.add({
      title: 'ID wajib diisi',
      description: 'Masukkan registration ID dari QR.',
      color: 'warning'
    })
    return
  }
  processing.value = true
  await stopScanner()
  try {
    await submitCheckIn(registrationId)
  } finally {
    processing.value = false
  }
}

async function submitCheckIn(registrationId: string) {
  try {
    const data = await $fetch<{
      success: boolean
      message: string
      visitor: CheckInVisitor
    }>('/api/visitors/check-in', {
      method: 'POST',
      body: { registrationId }
    })

    result.value = {
      status: 'success',
      message: data.message || 'Check-in berhasil.',
      visitor: data.visitor
    }
    manualId.value = ''
    toast.add({
      title: 'Check-in berhasil',
      description: data.visitor.fullName || registrationId,
      color: 'success'
    })
  } catch (error: unknown) {
    const err = error as {
      statusCode?: number
      status?: number
      data?: {
        message?: string
        success?: boolean
        visitor?: CheckInVisitor
        data?: {
          message?: string
          visitor?: CheckInVisitor
        }
      }
      message?: string
    }

    const status = err.statusCode || err.status
    const payload = err.data?.data || err.data

    if (status === 409) {
      const visitor = payload?.visitor || null
      result.value = {
        status: 'already',
        message: payload?.message || 'Visitor sudah check-in.',
        visitor
      }
      toast.add({
        title: 'Sudah check-in',
        description: visitor?.fullName || registrationId,
        color: 'warning'
      })
      return
    }

    result.value = {
      status: 'error',
      message: payload?.message || err.message || 'Check-in gagal.',
      visitor: null
    }
    toast.add({
      title: 'Check-in gagal',
      description: result.value.message,
      color: 'error'
    })
  }
}

async function scanAgain() {
  result.value = null
  await startScanner()
}

function formatCheckedIn(value: string | Date | null | undefined) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}
</script>

<template>
  <UDashboardPanel id="check-in">
    <template #header>
      <UDashboardNavbar title="Check-in Visitor">
        <template #right>
          <div class="flex flex-wrap items-center gap-2">
            <UButton
              v-if="lookupUrl"
              color="neutral"
              variant="outline"
              icon="i-lucide-search"
              label="QR Cek Registrasi"
              @click="showLookupQr = true"
            />
            <UButton
              v-if="registerUrl"
              color="neutral"
              variant="outline"
              icon="i-lucide-user-plus"
              label="QR Registrasi"
              @click="showRegisterQr = true"
            />
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="mx-auto flex w-full max-w-lg flex-col gap-4 p-4 sm:p-6">
        <p class="text-sm text-muted">
          Scan QR peserta (isi <code>registrationId</code>) untuk registrasi ulang di pintu acara.
        </p>

        <div class="overflow-hidden rounded-xl border border-default bg-elevated">
          <div
            :id="scannerId"
            class="min-h-64 w-full bg-black/90"
          />
          <div class="flex flex-wrap gap-2 p-3">
            <UButton
              v-if="!scanning"
              :loading="starting"
              icon="i-lucide-camera"
              label="Mulai Scan"
              block
              class="sm:flex-1"
              @click="startScanner"
            />
            <UButton
              v-else
              color="neutral"
              variant="outline"
              icon="i-lucide-camera-off"
              label="Stop"
              block
              class="sm:flex-1"
              @click="stopScanner"
            />
          </div>
        </div>

        <div class="flex gap-2">
          <UInput
            v-model="manualId"
            class="flex-1"
            placeholder="Atau ketik RSVP-2026-00001"
            :disabled="processing"
            @keyup.enter="submitManual"
          />
          <UButton
            :loading="processing"
            label="Cek"
            @click="submitManual"
          />
        </div>

        <div
          v-if="result"
          class="rounded-xl border p-4"
          :class="{
            'border-success/40 bg-success/10': result.status === 'success',
            'border-warning/40 bg-warning/10': result.status === 'already',
            'border-error/40 bg-error/10': result.status === 'error'
          }"
        >
          <div class="mb-2 flex items-start justify-between gap-2">
            <div>
              <p class="font-semibold">
                {{ result.message }}
              </p>
              <p
                v-if="result.visitor?.event?.name"
                class="text-xs text-muted"
              >
                {{ result.visitor.event.name }}
              </p>
            </div>
            <UBadge
              :color="result.status === 'success' ? 'success' : result.status === 'already' ? 'warning' : 'error'"
              variant="subtle"
            >
              {{ result.status === 'success' ? 'OK' : result.status === 'already' ? 'Sudah' : 'Gagal' }}
            </UBadge>
          </div>

          <dl
            v-if="result.visitor"
            class="grid gap-2 text-sm"
          >
            <div class="flex justify-between gap-3">
              <dt class="text-muted">
                ID
              </dt>
              <dd class="font-medium text-right">
                {{ result.visitor.registrationId }}
              </dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-muted">
                Nama
              </dt>
              <dd class="font-medium text-right">
                {{ result.visitor.fullName || '-' }}
              </dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-muted">
                Email
              </dt>
              <dd class="font-medium text-right break-all">
                {{ result.visitor.email || '-' }}
              </dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-muted">
                WhatsApp
              </dt>
              <dd class="font-medium text-right">
                {{ result.visitor.phone || result.visitor.whatsapp || '-' }}
              </dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-muted">
                Instansi
              </dt>
              <dd class="font-medium text-right">
                {{ result.visitor.institution || '-' }}
              </dd>
            </div>
            <div
              v-if="result.visitor.position"
              class="flex justify-between gap-3"
            >
              <dt class="text-muted">
                Jabatan
              </dt>
              <dd class="font-medium text-right">
                {{ result.visitor.position }}
              </dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-muted">
                Check-in
              </dt>
              <dd class="font-medium text-right">
                {{ formatCheckedIn(result.visitor.checkedInAt) }}
              </dd>
            </div>
          </dl>

          <UButton
            class="mt-4"
            block
            color="neutral"
            variant="outline"
            icon="i-lucide-scan-line"
            label="Scan lagi"
            @click="scanAgain"
          />
        </div>
      </div>

      <UModal v-model:open="showLookupQr">
        <template #content>
          <div class="flex flex-col items-center gap-4 p-6 text-center">
            <h3 class="text-lg font-semibold">
              QR Cek Registrasi
            </h3>
            <p
              v-if="lookupUrl"
              class="break-all text-xs text-muted"
            >
              {{ lookupUrl }}
            </p>
            <img
              v-if="lookupQrDataUrl"
              :src="lookupQrDataUrl"
              alt="QR cek registrasi visitor"
              class="h-64 w-64 rounded-lg bg-white p-2"
            >
            <p
              v-else
              class="text-sm text-muted"
            >
              Set env <code>NUXT_PUBLIC_VISITOR_LOOKUP_URL</code> ke URL
              <code>/cek-registrasi</code>.
            </p>
            <p class="text-sm text-muted">
              Visitor scan → isi email atau WhatsApp → jika sudah daftar, QR check-in muncul; jika belum, diarahkan ke form registrasi.
            </p>
            <UButton
              color="neutral"
              variant="outline"
              label="Tutup"
              @click="showLookupQr = false"
            />
          </div>
        </template>
      </UModal>

      <UModal v-model:open="showRegisterQr">
        <template #content>
          <div class="flex flex-col items-center gap-4 p-6 text-center">
            <h3 class="text-lg font-semibold">
              QR Registrasi
            </h3>
            <p
              v-if="registerUrl"
              class="break-all text-xs text-muted"
            >
              {{ registerUrl }}
            </p>
            <img
              v-if="registerQrDataUrl"
              :src="registerQrDataUrl"
              alt="QR registrasi visitor"
              class="h-64 w-64 rounded-lg bg-white p-2"
            >
            <p
              v-else
              class="text-sm text-muted"
            >
              Set env <code>NUXT_PUBLIC_VISITOR_REGISTER_URL</code> ke URL
              <code>/registrasi</code>.
            </p>
            <p class="text-sm text-muted">
              Visitor scan QR ini untuk membuka form pendaftaran lengkap.
            </p>
            <UButton
              color="neutral"
              variant="outline"
              label="Tutup"
              @click="showRegisterQr = false"
            />
          </div>
        </template>
      </UModal>
    </template>
  </UDashboardPanel>
</template>
