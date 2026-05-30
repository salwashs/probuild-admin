<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const { user, logout } = useAuth()

const displayUser = computed(() => ({
  name: user.value?.name || user.value?.email || 'User',
  avatar: {
    src: '',
    alt: user.value?.name || 'User'
  }
}))

const items = computed<DropdownMenuItem[][]>(() => ([[{
  type: 'label',
  label: user.value?.email || '',
  icon: 'i-lucide-user'
}], [{
  label: 'Log out',
  icon: 'i-lucide-log-out',
  onSelect() {
    logout()
  }
}]]))
</script>

<template>
  <UDropdownMenu :items="items" :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }">
    <UButton v-bind="{
      label: collapsed ? undefined : displayUser?.name,
      trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
    }" color="neutral" variant="ghost" block :square="collapsed" class="data-[state=open]:bg-elevated" :ui="{
      trailingIcon: 'text-dimmed'
    }">
      <template #leading>
        <UIcon name="i-lucide-circle-user" class="size-5 shrink-0" />
      </template>
    </UButton>
  </UDropdownMenu>
</template>
