<script setup lang="ts">
import EventQrPanel from '~/components/visitors/EventQrPanel.vue'

type EventRecord = {
  id: string
  slug: string
  name: string
  isActive: boolean
}

const selectedEventId = ref('')

const { data: events } = await useFetch<EventRecord[]>('/api/events', {
  lazy: true
})

watch(events, (list) => {
  if (!selectedEventId.value && list?.length) {
    const active = list.find(item => item.isActive) || list[0]
    if (active) selectedEventId.value = active.id
  }
}, { immediate: true })

const selectedEvent = computed(() =>
  events.value?.find(item => item.id === selectedEventId.value) || null
)

const eventOptions = computed(() =>
  (events.value || []).map(item => ({
    label: item.name,
    value: item.id
  }))
)
</script>

<template>
  <UDashboardPanel id="qr-registrasi">
    <template #header>
      <UDashboardNavbar title="QR Registrasi">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="mx-auto flex w-full max-w-xl flex-col items-center gap-6 py-4">
        <div class="w-full space-y-2 text-center">
          <h2 class="text-xl font-semibold">
            QR statis visitor
          </h2>
          <p class="text-sm text-muted">
            Tampilkan atau cetak QR ini di lokasi event. Visitor cukup scan sekali, mengisi data sesuai field visitor, lalu data tersimpan tanpa duplikat.
          </p>
        </div>

        <USelect
          v-model="selectedEventId"
          :items="eventOptions"
          value-key="value"
          placeholder="Pilih event"
          class="w-full max-w-sm"
        />

        <EventQrPanel
          v-if="selectedEvent"
          :slug="selectedEvent.slug"
          :event-name="selectedEvent.name"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
