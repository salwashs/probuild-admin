<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { Row } from '@tanstack/table-core'
import VisitorFormModal from '~/components/visitors/VisitorFormModal.vue'

type FieldOption = {
  value: string
  labelId: string
  labelEn?: string
}

type FormField = {
  key: string
  labelId: string
  labelEn?: string | null
  type: string
  required: boolean
  sortOrder: number
  showInTable: boolean
  options?: FieldOption[] | null
  conditions?: Record<string, unknown> | null
  validation?: Record<string, unknown> | null
}

type EventRecord = {
  id: string
  slug: string
  name: string
  isActive: boolean
  fields: FormField[]
}

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const toast = useToast()
const table = useTemplateRef('table')

const selectedEventId = ref('')
const isFormOpen = ref(false)
const isDeleteOpen = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const editingVisitor = ref<Record<string, unknown> | null>(null)
const deletingVisitor = ref<Record<string, unknown> | null>(null)

const columnFilters = ref([{
  id: 'fullName',
  value: ''
}])
const columnVisibility = ref()

const defaultData = ref<any[]>([])

const { data: events } = await useFetch<EventRecord[]>('/api/events', {
  lazy: true
})

watch(events, (list) => {
  if (!selectedEventId.value && list?.length) {
    const active = list.find(item => item.isActive) || list[0]
    selectedEventId.value = active.id
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

const { data, status, refresh } = await useFetch<any[]>('/api/visitors', {
  query: computed(() => ({
    eventId: selectedEventId.value || undefined
  })),
  lazy: true,
  watch: [selectedEventId]
})

function formatCell(field: FormField, value: unknown) {
  if (value == null || value === '') return '-'
  if (field.type === 'select') {
    const opt = field.options?.find(item => item.value === value)
    return opt?.labelId || String(value)
  }
  if (field.type === 'multiselect' && Array.isArray(value)) {
    return value
      .map((item) => field.options?.find(opt => opt.value === item)?.labelId || String(item))
      .join(', ') || '-'
  }
  if (field.type === 'boolean') return value ? 'Ya' : 'Tidak'
  if (field.type === 'group' && Array.isArray(value)) {
    return value.length ? `${value.length} orang` : '-'
  }
  return String(value)
}

const columns = computed<TableColumn<any>[]>(() => {
  const fieldCols: TableColumn<any>[] = (selectedEvent.value?.fields || [])
    .filter(field => field.showInTable)
    .map(field => ({
      accessorKey: field.key,
      header: field.labelId,
      cell: ({ row }: { row: Row<any> }) => formatCell(field, row.original[field.key])
    }))

  return [
    {
      id: 'number',
      header: 'No',
      cell: ({ row }) => row.index + 1
    },
    {
      accessorKey: 'registrationId',
      header: 'ID Registrasi',
      cell: ({ row }) => row.original.registrationId || '-'
    },
    {
      accessorKey: 'createdAt',
      header: 'Tanggal',
      cell: ({ row }) => {
        if (!row.original.createdAt) return '-'
        return new Intl.DateTimeFormat('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(new Date(row.original.createdAt))
      }
    },
    {
      accessorKey: 'checkedInAt',
      header: 'Check-in',
      cell: ({ row }) => {
        if (!row.original.checkedInAt) {
          return h('span', { class: 'text-muted' }, 'Belum')
        }
        return new Intl.DateTimeFormat('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(new Date(row.original.checkedInAt))
      }
    },
    ...fieldCols,
    {
      id: 'actions',
      cell: ({ row }) => {
        return h(
          'div',
          { class: 'text-right' },
          h(
            UDropdownMenu,
            {
              content: { align: 'end' },
              items: getRowItems(row)
            },
            () =>
              h(UButton, {
                icon: 'i-lucide-ellipsis-vertical',
                color: 'neutral',
                variant: 'ghost',
                class: 'ml-auto'
              })
          )
        )
      }
    }
  ]
})

function getRowItems(row: Row<any>) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },
    {
      label: 'Copy WhatsApp',
      icon: 'i-lucide-copy',
      onSelect() {
        navigator.clipboard.writeText(row.original.phone || row.original.whatsapp || '')
        toast.add({
          title: 'Copied to clipboard',
          description: 'WhatsApp Number copied to clipboard'
        })
      }
    },
    {
      label: 'Edit',
      icon: 'i-lucide-pencil',
      onSelect() {
        editingVisitor.value = row.original
        isFormOpen.value = true
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Hapus',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect() {
        deletingVisitor.value = row.original
        isDeleteOpen.value = true
      }
    }
  ]
}

function openCreate() {
  editingVisitor.value = null
  isFormOpen.value = true
}

async function submitVisitor(payload: Record<string, unknown>) {
  isSubmitting.value = true
  try {
    const isEdit = Boolean(editingVisitor.value?.id)
    await $fetch('/api/visitors', {
      method: isEdit ? 'PUT' : 'POST',
      body: isEdit
        ? { ...payload, id: editingVisitor.value!.id }
        : payload
    })
    toast.add({
      title: 'Berhasil',
      description: isEdit ? 'Visitor berhasil diperbarui.' : 'Visitor berhasil ditambahkan.',
      color: 'success'
    })
    isFormOpen.value = false
    editingVisitor.value = null
    refresh()
  } catch (error: any) {
    const validationErrors = error?.data?.data?.errors || error?.data?.errors
    const firstError = validationErrors
      ? Object.values(validationErrors).flat()[0]
      : null
    toast.add({
      title: 'Gagal',
      description: firstError || error?.data?.message || 'Terjadi kesalahan saat menyimpan visitor.',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

async function confirmDelete() {
  if (!deletingVisitor.value?.id) return
  isDeleting.value = true
  try {
    await $fetch('/api/visitors', {
      method: 'DELETE',
      body: { id: deletingVisitor.value.id }
    })
    toast.add({
      title: 'Berhasil',
      description: 'Visitor berhasil dihapus.',
      color: 'success'
    })
    isDeleteOpen.value = false
    deletingVisitor.value = null
    refresh()
  } catch (error: any) {
    toast.add({
      title: 'Gagal',
      description: error?.data?.message || 'Terjadi kesalahan saat menghapus visitor.',
      color: 'error'
    })
  } finally {
    isDeleting.value = false
  }
}

const fullNameSearch = computed({
  get: (): string => {
    return (table.value?.tableApi?.getColumn('fullName')?.getFilterValue() as string) || ''
  },
  set: (value: string) => {
    table.value?.tableApi?.getColumn('fullName')?.setFilterValue(value || undefined)
  }
})

const pagination = ref({
  pageIndex: 0,
  pageSize: 10
})
</script>

<template>
  <UDashboardPanel id="visitors">
    <template #header>
      <UDashboardNavbar title="Visitors">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-refresh-cw" color="neutral" variant="ghost" @click="refresh()" />
          <UButton
            icon="i-lucide-plus"
            label="Tambah"
            :disabled="!selectedEventId"
            @click="openCreate"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <div class="flex flex-wrap items-center gap-2">
          <USelect
            v-model="selectedEventId"
            :items="eventOptions"
            value-key="value"
            placeholder="Pilih event"
            class="w-56"
          />
          <UInput
            v-model="fullNameSearch"
            class="max-w-sm"
            icon="i-lucide-search"
            placeholder="Cari nama visitor..."
          />
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          <UDropdownMenu
            :items="table?.tableApi
              ?.getAllColumns()
              .filter((column: any) => column.getCanHide())
              .map((column: any) => ({
                label: upperFirst(column.id),
                type: 'checkbox' as const,
                checked: column.getIsVisible(),
                onUpdateChecked(checked: boolean) {
                  table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                },
                onSelect(e?: Event) {
                  e?.preventDefault()
                }
              }))
            "
            :content="{ align: 'end' }"
          />
        </div>
      </div>

      <UTable
        ref="table"
        v-model:column-filters="columnFilters"
        v-model:column-visibility="columnVisibility"
        v-model:pagination="pagination"
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel()
        }"
        class="shrink-0"
        :data="data || defaultData"
        :columns="columns"
        :loading="status === 'pending'"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default',
          separator: 'h-0'
        }"
      />

      <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
        <div class="text-sm text-muted">
          Total {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} visitor(s).
        </div>

        <div class="flex items-center gap-1.5">
          <UPagination
            :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <VisitorFormModal
    v-if="selectedEvent"
    v-model:open="isFormOpen"
    :fields="selectedEvent.fields"
    :event-id="selectedEvent.id"
    :visitor="editingVisitor"
    :submitting="isSubmitting"
    @submit="submitVisitor"
  />

  <UModal v-model:open="isDeleteOpen">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Hapus visitor</h3>
        </template>
        <p class="text-sm text-muted">
          Hapus {{ deletingVisitor?.fullName || 'visitor ini' }}? Tindakan ini tidak dapat dibatalkan.
        </p>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton label="Batal" color="neutral" variant="outline" @click="isDeleteOpen = false" />
            <UButton
              label="Hapus"
              color="error"
              icon="i-lucide-trash"
              :loading="isDeleting"
              @click="confirmDelete"
            />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
