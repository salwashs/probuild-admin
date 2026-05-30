<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/table-core'
import type { Row } from '@tanstack/table-core'

const UBadge = resolveComponent('UBadge')

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const toast = useToast()
const table = useTemplateRef('table')

const columnFilters = ref([{
    id: 'companyName',
    value: ''
}])
const columnVisibility = ref()
const rowSelection = ref({})

// Stable default array to prevent infinite loop on lazy fetch
const defaultData = ref<any[]>([])

const { data, status, refresh } = await useFetch<any[]>('/api/exhibitors', {
    lazy: true
})

function getRowItems(row: Row<any>) {
    return [
        {
            type: 'label',
            label: 'Actions'
        },
        {
            label: 'Copy Email',
            icon: 'i-lucide-copy',
            onSelect() {
                navigator.clipboard.writeText(row.original.email || '')
                toast.add({
                    title: 'Copied to clipboard',
                    description: 'Email copied to clipboard'
                })
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Delete Exhibitor',
            icon: 'i-lucide-trash',
            color: 'error',
            onSelect() {
                // To be implemented
                toast.add({
                    title: 'Exhibitor Delete',
                    description: 'Feature not fully implemented yet.'
                })
            }
        }
    ]
}

const columns: TableColumn<any>[] = [
    {
        id: 'select',
        header: ({ table }) =>
            h(UCheckbox, {
                'modelValue': table.getIsSomePageRowsSelected()
                    ? 'indeterminate'
                    : table.getIsAllPageRowsSelected(),
                'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
                    table.toggleAllPageRowsSelected(!!value),
                'ariaLabel': 'Select all'
            }),
        cell: ({ row }) =>
            h(UCheckbox, {
                'modelValue': row.getIsSelected(),
                'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
                'ariaLabel': 'Select row'
            })
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
        accessorKey: 'companyName',
        header: 'Nama Perusahaan'
    },
    {
        accessorKey: 'picName',
        header: 'Nama PIC'
    },
    {
        accessorKey: 'email',
        header: 'Email'
    },
    {
        accessorKey: 'phone',
        header: 'Nomor Telepon'
    },
    {
        accessorKey: 'productType',
        header: 'Jenis Produk'
    },
    {
        id: 'boothType',
        accessorFn: (row) => row.boothType?.name,
        header: 'Tipe Booth',
        cell: ({ row }) => row.original.boothType?.name || '-'
    },
    // {
    //     id: 'boothNumber',
    //     accessorFn: (row) => row.booths?.number,
    //     header: ({ column }) => {
    //         const isSorted = column.getIsSorted()

    //         return h(UButton, {
    //             color: 'neutral',
    //             variant: 'ghost',
    //             label: 'Nomor Booth',
    //             icon: isSorted
    //                 ? isSorted === 'asc'
    //                     ? 'i-lucide-arrow-up-narrow-wide'
    //                     : 'i-lucide-arrow-down-wide-narrow'
    //                 : 'i-lucide-arrow-up-down',
    //             class: '-mx-2.5',
    //             onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
    //         })
    //     },
    //     cell: ({ row }) => {
    //         const boothNumber = row.original.booth?.number
    //         if (boothNumber) {
    //             return h('span', {}, `#${boothNumber}`)
    //         }
    //         return h(UBadge, { color: 'warning', variant: 'subtle' }, () => 'Belum diassign')
    //     }
    // },
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

const companyNameSearch = computed({
    get: (): string => {
        return (table.value?.tableApi?.getColumn('companyName')?.getFilterValue() as string) || ''
    },
    set: (value: string) => {
        table.value?.tableApi?.getColumn('companyName')?.setFilterValue(value || undefined)
    }
})

const pagination = ref({
    pageIndex: 0,
    pageSize: 10
})
</script>

<template>
    <UDashboardPanel id="exhibitors">
        <template #header>
            <UDashboardNavbar title="Exhibitors">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>

                <template #right>
                    <UButton icon="i-lucide-refresh-cw" color="neutral" variant="ghost" @click="refresh()" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div class="flex flex-wrap items-center justify-between gap-1.5">
                <UInput v-model="companyNameSearch" class="max-w-sm" icon="i-lucide-search"
                    placeholder="Cari nama perusahaan..." />

                <div class="flex flex-wrap items-center gap-1.5">
                    <UButton v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length" label="Hapus Pilihan"
                        color="error" variant="subtle" icon="i-lucide-trash">
                        <template #trailing>
                            <UKbd>
                                {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
                            </UKbd>
                        </template>
                    </UButton>

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
                        <!-- <UButton label="Display" color="neutral" variant="outline"
                            trailing-icon="i-lucide-settings-2" /> -->
                    </UDropdownMenu>
                </div>
            </div>

            <UTable ref="table" v-model:column-filters="columnFilters" v-model:column-visibility="columnVisibility"
                v-model:row-selection="rowSelection" v-model:pagination="pagination" :pagination-options="{
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
                    {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
                    {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} baris dipilih.
                </div>

                <div class="flex items-center gap-1.5">
                    <UPagination :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
                        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
                        :total="table?.tableApi?.getFilteredRowModel().rows.length"
                        @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)" />
                </div>
            </div>
        </template>
    </UDashboardPanel>
</template>
