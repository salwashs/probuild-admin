<script setup lang="ts">
interface DashboardStats {
  visitors: number
  exhibitors: number
  availableBooths: number
}

const { data: stats, status } = await useFetch<DashboardStats>('/api/dashboard/stats')

const cards = computed(() => {
  if (!stats.value) return []

  return [
    {
      title: 'Visitor Terdaftar',
      icon: 'i-lucide-users',
      value: stats.value.visitors,
      color: 'primary' as const,
      description: 'Total visitor yang telah mendaftar'
    },
    {
      title: 'Exhibitor Terdaftar',
      icon: 'i-lucide-building-2',
      value: stats.value.exhibitors,
      color: 'secondary' as const,
      description: 'Total exhibitor yang telah mendaftar'
    },
    {
      title: 'Booth Tersedia',
      icon: 'i-lucide-layout-grid',
      value: stats.value.availableBooths,
      color: 'success' as const,
      description: 'Jumlah booth yang masih tersedia'
    }
  ]
})
</script>

<template>
  <UPageGrid class="lg:grid-cols-3 gap-4 sm:gap-6">
    <UPageCard
      v-for="(card, index) in cards"
      :key="index"
      :icon="card.icon"
      :title="card.title"
      variant="subtle"
      :ui="{
        container: 'gap-y-2',
        wrapper: 'items-start',
        leading: 'p-2.5 rounded-full bg-primary/10 ring ring-inset ring-primary/25 flex-col',
        title: 'font-normal text-muted text-xs uppercase tracking-wide',
        description: 'text-sm text-muted'
      }"
      class="hover:shadow-lg transition-shadow duration-200"
    >
      <div class="flex items-center gap-3">
        <span class="text-3xl font-bold text-highlighted">
          {{ card.value.toLocaleString('id-ID') }}
        </span>
      </div>

      <template #description>
        <span class="text-sm text-muted">{{ card.description }}</span>
      </template>
    </UPageCard>
  </UPageGrid>
</template>
