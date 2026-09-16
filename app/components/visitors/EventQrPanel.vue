<script setup lang="ts">
const props = defineProps<{
  slug: string
  eventName?: string
  size?: number
}>()

const toast = useToast()
const config = useRuntimeConfig()

const dataUrl = ref('')
const generating = ref(false)

const registerUrl = computed(() => {
  const configured = String(config.public.siteUrl || '').replace(/\/$/, '')
  const origin = configured || (import.meta.client ? window.location.origin : '')
  return origin ? `${origin}/register/${props.slug}` : ''
})

async function generateQr() {
  if (!import.meta.client || !registerUrl.value) {
    dataUrl.value = ''
    return
  }
  generating.value = true
  try {
    const QRCode = (await import('qrcode')).default
    dataUrl.value = await QRCode.toDataURL(registerUrl.value, {
      width: props.size || 360,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#052E16',
        light: '#ffffff'
      }
    })
  } finally {
    generating.value = false
  }
}

watch(registerUrl, generateQr, { immediate: true })

function copyLink() {
  navigator.clipboard.writeText(registerUrl.value)
  toast.add({
    title: 'Tautan disalin',
    description: 'URL registrasi visitor sudah ada di clipboard.',
    color: 'success'
  })
}

function downloadPng() {
  if (!dataUrl.value) return
  const link = document.createElement('a')
  link.href = dataUrl.value
  link.download = `qr-registrasi-${props.slug}.png`
  link.click()
}

function printQr() {
  if (!dataUrl.value) return
  const popup = window.open('', '_blank', 'width=480,height=640')
  if (!popup) return
  const title = props.eventName || 'QR Registrasi Visitor'
  popup.document.write(`<!doctype html>
<html>
  <head>
    <title>${title}</title>
    <style>
      body { font-family: sans-serif; text-align: center; padding: 32px; }
      img { width: 320px; height: 320px; }
      p { word-break: break-all; color: #444; }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    <p>Scan untuk registrasi visitor</p>
    <img src="${dataUrl.value}" alt="QR Registrasi" />
    <p>${registerUrl.value}</p>
  </body>
</html>`)
  popup.document.close()
  popup.focus()
  popup.print()
}
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div class="rounded-2xl border border-default bg-white p-4 shadow-sm">
      <img
        v-if="dataUrl"
        :src="dataUrl"
        :alt="`QR registrasi ${eventName || slug}`"
        class="size-64"
      >
      <div v-else class="flex size-64 items-center justify-center text-muted">
        {{ generating ? 'Menyiapkan QR...' : 'QR belum tersedia' }}
      </div>
    </div>

    <div class="w-full max-w-md text-center space-y-2">
      <p class="text-sm text-muted">
        QR ini statis. Visitor cukup scan, mengisi formulir, dan hanya dapat mendaftar sekali dari perangkat yang sama.
      </p>
      <p class="break-all text-xs text-muted">
        {{ registerUrl }}
      </p>
    </div>

    <div class="flex flex-wrap justify-center gap-2">
      <UButton
        icon="i-lucide-copy"
        label="Salin tautan"
        color="neutral"
        variant="outline"
        @click="copyLink"
      />
      <UButton
        icon="i-lucide-download"
        label="Unduh PNG"
        color="neutral"
        variant="outline"
        :disabled="!dataUrl"
        @click="downloadPng"
      />
      <UButton
        icon="i-lucide-printer"
        label="Cetak"
        color="neutral"
        variant="outline"
        :disabled="!dataUrl"
        @click="printQr"
      />
      <UButton
        icon="i-lucide-external-link"
        label="Buka form"
        :to="`/register/${slug}`"
        target="_blank"
        color="primary"
        variant="soft"
      />
    </div>
  </div>
</template>
