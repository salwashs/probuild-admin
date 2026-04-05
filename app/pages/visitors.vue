<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { upperFirst } from 'scule'
import { getPaginationRowModel } from '@tanstack/table-core'
import type { Row } from '@tanstack/table-core'

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const toast = useToast()
const table = useTemplateRef('table')

const columnFilters = ref([{
    id: 'fullName',
    value: ''
}])
const columnVisibility = ref()

// Fetch visitor data
const defaultData = ref<any[]>([])
const { data, status, refresh } = await useFetch<any[]>('/api/visitors', {
    lazy: true
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
                navigator.clipboard.writeText(row.original.phone || '')
                toast.add({
                    title: 'Copied to clipboard',
                    description: 'WhatsApp Number copied to clipboard'
                })
            }
        }
    ]
}

const columns: TableColumn<any>[] = [
    {
        id: 'number',
        header: 'No',
        cell: ({ row }) => row.index + 1
    },
    {
        accessorKey: 'fullName',
        header: 'Nama Lengkap'
    },
    {
        accessorKey: 'phone',
        header: 'Nomor WhatsApp'
    },
    {
        accessorKey: 'company',
        header: 'Nama Perusahaan'
    },
    {
        accessorKey: 'position',
        header: 'Jabatan',
        cell: ({ row }) => row.original.position || '-'
    },
    {
        accessorKey: 'email',
        header: 'EMAIL'
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
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div class="flex flex-wrap items-center justify-between gap-1.5">
                <UInput v-model="fullNameSearch" class="max-w-sm" icon="i-lucide-search"
                    placeholder="Cari nama visitor..." />

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
                    Total {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} visitor(s).
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