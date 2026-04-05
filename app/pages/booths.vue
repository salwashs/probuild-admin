<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/table-core'
import type { Row } from '@tanstack/table-core'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const toast = useToast()
const table = useTemplateRef('table')

const columnFilters = ref([{
    id: 'boothTypeName',
    value: ''
}])
const columnVisibility = ref()

// Fetch booth data
const defaultData = ref<any[]>([])
const { data, status, refresh } = await useFetch<any[]>('/api/booths', {
    lazy: true
})

// Fetch booth types for dropdown
const { data: boothTypes, refresh: refreshBoothTypes } = await useFetch<any[]>('/api/booth-types', {
    lazy: true
})

// Modal state
const showModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)

const emptyForm = {
    id: '',
    number: '' as string | number,
    boothTypeId: '',
    isBooked: false,
    isActive: true
}

const form = ref({ ...emptyForm })

function openCreateModal() {
    isEditing.value = false
    form.value = { ...emptyForm }
    showModal.value = true
}

function openEditModal(row: any) {
    isEditing.value = true
    form.value = {
        id: row.id,
        number: row.number,
        boothTypeId: row.boothTypeId,
        isBooked: row.isBooked,
        isActive: row.isActive
    }
    showModal.value = true
}

async function saveBooth() {
    if (form.value.number === '' || !form.value.boothTypeId) {
        toast.add({
            title: 'Validasi Gagal',
            description: 'Nomor booth dan tipe booth wajib diisi',
            color: 'error'
        })
        return
    }

    saving.value = true

    try {
        const payload = {
            ...form.value,
            number: Number(form.value.number),
        }

        if (isEditing.value) {
            await $fetch('/api/booths', { method: 'PUT', body: payload })
            toast.add({
                title: 'Booth Diperbarui',
                description: `Booth #${payload.number} berhasil diperbarui`,
                color: 'success'
            })
        } else {
            const { id, ...createPayload } = payload
            await $fetch('/api/booths', { method: 'POST', body: createPayload })
            toast.add({
                title: 'Booth Ditambahkan',
                description: `Booth #${payload.number} berhasil dibuat`,
                color: 'success'
            })
        }

        showModal.value = false
        refresh()
    } catch (err: any) {
        toast.add({
            title: 'Gagal Menyimpan',
            description: err?.data?.message || 'Terjadi kesalahan saat menyimpan booth',
            color: 'error'
        })
    } finally {
        saving.value = false
    }
}

function getRowItems(row: Row<any>) {
    return [
        {
            type: 'label',
            label: 'Actions'
        },
        {
            label: 'Edit Booth',
            icon: 'i-lucide-pencil',
            onSelect() {
                openEditModal(row.original)
            }
        },
        {
            label: row.original.isActive ? 'Nonaktifkan' : 'Aktifkan',
            icon: row.original.isActive ? 'i-lucide-eye-off' : 'i-lucide-eye',
            async onSelect() {
                try {
                    await $fetch('/api/booths', {
                        method: 'PUT',
                        body: {
                            id: row.original.id,
                            isActive: !row.original.isActive
                        }
                    })
                    toast.add({
                        title: row.original.isActive ? 'Booth Dinonaktifkan' : 'Booth Diaktifkan',
                        color: 'success'
                    })
                    refresh()
                } catch {
                    toast.add({ title: 'Gagal mengubah status', color: 'error' })
                }
            }
        },
        {
            type: 'separator'
        },
        {
            label: row.original.isBooked ? 'Set Tersedia' : 'Set Dipesan',
            icon: row.original.isBooked ? 'i-lucide-lock-open' : 'i-lucide-lock',
            async onSelect() {
                try {
                    await $fetch('/api/booths', {
                        method: 'PUT',
                        body: {
                            id: row.original.id,
                            isBooked: !row.original.isBooked
                        }
                    })
                    toast.add({
                        title: row.original.isBooked ? 'Booth disetel tersedia' : 'Booth disetel dipesan',
                        color: 'success'
                    })
                    refresh()
                } catch {
                    toast.add({ title: 'Gagal mengubah status booking', color: 'error' })
                }
            }
        }
    ]
}

const boothTypeColor: Record<string, string> = {
    Standard: 'neutral',
    Premium: 'success',
    Silver: 'info',
    Elite: 'primary',
    Gold: 'warning',
    Platinum: 'error'
}

const columns: TableColumn<any>[] = [
    {
        id: 'number',
        accessorKey: 'number',
        header: ({ column }) => {
            const isSorted = column.getIsSorted()
            return h(UButton, {
                color: 'neutral',
                variant: 'ghost',
                label: 'No. Booth',
                icon: isSorted
                    ? isSorted === 'asc'
                        ? 'i-lucide-arrow-up-narrow-wide'
                        : 'i-lucide-arrow-down-wide-narrow'
                    : 'i-lucide-arrow-up-down',
                class: '-mx-2.5',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
            })
        },
        cell: ({ row }) => `#${row.original.number}`
    },
    {
        id: 'boothTypeName',
        accessorFn: (row) => row.boothType?.name,
        header: 'Tipe Booth',
        cell: ({ row }) => {
            const name = row.original.boothType?.name || '-'
            const color = boothTypeColor[name] || 'neutral'
            return h(UBadge, { color, variant: 'subtle' }, () => name)
        }
    },
    {
        id: 'size',
        header: 'Ukuran',
        cell: ({ row }) => row.original.boothType ? `${row.original.boothType.size} m²` : '-'
    },
    {
        id: 'price',
        header: 'Harga',
        cell: ({ row }) => {
            const price = row.original.boothType?.price
            if (price == null) return '-'
            return `Rp ${Number(price).toLocaleString('id-ID')}`
        }
    },
    {
        id: 'isBooked',
        accessorKey: 'isBooked',
        header: 'Status Booking',
        cell: ({ row }) => {
            const booked = row.original.isBooked
            return h(UBadge, {
                color: booked ? 'error' : 'success',
                variant: 'subtle'
            }, () => booked ? 'Dipesan' : 'Tersedia')
        }
    },
    {
        id: 'exhibitorInfo',
        header: 'Exhibitor',
        cell: ({ row }) => {
            const exhibitors = row.original.exhibitors
            if (!exhibitors || exhibitors.length === 0) return '-'
            return exhibitors[0].companyName
        }
    },
    {
        id: 'isActive',
        accessorKey: 'isActive',
        header: 'Aktif',
        cell: ({ row }) => {
            const active = row.original.isActive
            return h(UBadge, {
                color: active ? 'success' : 'neutral',
                variant: 'subtle'
            }, () => active ? 'Aktif' : 'Nonaktif')
        }
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            return h(
                'div',
                { class: 'text-right' },
                h(
                    UDropdownMenu,
                    {
                        content: {
                            align: 'end'
                        },
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

const nameSearch = computed({
    get: (): string => {
        return (table.value?.tableApi?.getColumn('boothTypeName')?.getFilterValue() as string) || ''
    },
    set: (value: string) => {
        table.value?.tableApi?.getColumn('boothTypeName')?.setFilterValue(value || undefined)
    }
})

const pagination = ref({
    pageIndex: 0,
    pageSize: 10
})

// Stats computed
const totalBooths = computed(() => data.value?.length ?? 0)
const bookedBooths = computed(() => data.value?.filter((b: any) => b.isBooked).length ?? 0)
const availableBooths = computed(() => data.value?.filter((b: any) => !b.isBooked && b.isActive).length ?? 0)

// Booth type select items
const boothTypeItems = computed(() => {
    if (!boothTypes.value) return []
    return boothTypes.value
        .filter((bt: any) => bt.isActive)
        .map((bt: any) => ({
            label: `${bt.name} (${bt.size} m²)`,
            value: bt.id
        }))
})
</script>

<template>
    <UDashboardPanel id="booths">
        <template #header>
            <UDashboardNavbar title="Kelola Booth">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>

                <template #right>
                    <UButton icon="i-lucide-refresh-cw" color="neutral" variant="ghost" @click="refresh()" />
                    <UButton label="Tambah Booth" icon="i-lucide-plus" color="primary" @click="openCreateModal()" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <!-- Stats cards -->
            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="rounded-lg border border-default bg-elevated/50 p-4">
                    <div class="text-sm text-muted">Total Booth</div>
                    <div class="text-2xl font-semibold mt-1">{{ totalBooths }}</div>
                </div>
                <div class="rounded-lg border border-default bg-elevated/50 p-4">
                    <div class="text-sm text-muted">Tersedia</div>
                    <div class="text-2xl font-semibold mt-1 text-green-500">{{ availableBooths }}</div>
                </div>
                <div class="rounded-lg border border-default bg-elevated/50 p-4">
                    <div class="text-sm text-muted">Dipesan</div>
                    <div class="text-2xl font-semibold mt-1 text-red-500">{{ bookedBooths }}</div>
                </div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-1.5">
                <UInput v-model="nameSearch" class="max-w-sm" icon="i-lucide-search"
                    placeholder="Cari tipe booth..." />

                <div class="flex flex-wrap items-center gap-1.5">
                    <UDropdownMenu :items="table?.tableApi
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
                        " :content="{ align: 'end' }">
                        <UButton label="Display" color="neutral" variant="outline"
                            trailing-icon="i-lucide-settings-2" />
                    </UDropdownMenu>
                </div>
            </div>

            <UTable ref="table" v-model:column-filters="columnFilters" v-model:column-visibility="columnVisibility"
                v-model:pagination="pagination" :pagination-options="{
                    getPaginationRowModel: getPaginationRowModel()
                }" class="shrink-0" :data="data || defaultData" :columns="columns" :loading="status === 'pending'" :ui="{
                    base: 'table-fixed border-separate border-spacing-0',
                    thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
                    tbody: '[&>tr]:last:[&>td]:border-b-0',
                    th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
                    td: 'border-b border-default',
                    separator: 'h-0'
                }" />

            <div class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto">
                <div class="text-sm text-muted">
                    Total {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} booth(s).
                </div>

                <div class="flex items-center gap-1.5">
                    <UPagination :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
                        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
                        :total="table?.tableApi?.getFilteredRowModel().rows.length"
                        @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)" />
                </div>
            </div>

            <!-- Create/Edit Modal -->
            <UModal v-model:open="showModal">
                <template #content>
                    <UCard>
                        <template #header>
                            <div class="flex items-center justify-between">
                                <h3 class="text-lg font-semibold">
                                    {{ isEditing ? 'Edit Booth' : 'Tambah Booth Baru' }}
                                </h3>
                            </div>
                        </template>

                        <div class="flex flex-col gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-1">Tipe Booth <span
                                        class="text-red-500">*</span></label>
                                <USelect v-model="form.boothTypeId" :items="boothTypeItems"
                                    placeholder="Pilih tipe booth" value-key="value" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium mb-1">Nomor Booth <span
                                        class="text-red-500">*</span></label>
                                <UInput v-model="form.number" type="number" placeholder="Contoh: 1" />
                            </div>

                            <div class="flex items-center gap-6">
                                <UCheckbox v-model="form.isActive" label="Aktif" />
                                <UCheckbox v-model="form.isBooked" label="Dipesan" />
                            </div>
                        </div>

                        <template #footer>
                            <div class="flex justify-end gap-2">
                                <UButton label="Batal" color="neutral" variant="outline"
                                    @click="showModal = false" />
                                <UButton :label="isEditing ? 'Simpan Perubahan' : 'Tambah Booth'" color="primary"
                                    :loading="saving" @click="saveBooth()" />
                            </div>
                        </template>
                    </UCard>
                </template>
            </UModal>
        </template>
    </UDashboardPanel>
</template>
