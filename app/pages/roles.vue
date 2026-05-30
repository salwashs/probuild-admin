<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/table-core'

const UButton = resolveComponent('UButton')

const { isSuperAdmin } = useAuth()

const toast = useToast()
const table = useTemplateRef('table')

const columnFilters = ref([{
    id: 'name',
    value: ''
}])
const columnVisibility = ref()

// Fetch role data
const defaultData = ref<any[]>([])
const { data, status, refresh } = await useFetch<any[]>('/api/roles', {
    lazy: true
})

// Modal state
const isModalOpen = ref(false)
const isSubmitting = ref(false)

// Form state
const form = reactive({
    name: '',
    description: ''
})

function resetForm() {
    form.name = ''
    form.description = ''
}

async function submitRole() {
    if (!form.name) {
        toast.add({
            title: 'Validasi Gagal',
            description: 'Nama role wajib diisi.',
            color: 'error'
        })
        return
    }

    isSubmitting.value = true
    try {
        await $fetch('/api/roles', {
            method: 'POST',
            body: {
                name: form.name,
                description: form.description || null
            }
        })

        toast.add({
            title: 'Berhasil',
            description: `Role "${form.name}" berhasil ditambahkan.`,
            color: 'success'
        })

        resetForm()
        isModalOpen.value = false
        refresh()
    } catch (error: any) {
        toast.add({
            title: 'Gagal',
            description: error?.data?.message || 'Terjadi kesalahan saat menyimpan role.',
            color: 'error'
        })
    } finally {
        isSubmitting.value = false
    }
}

const columns: TableColumn<any>[] = [
    {
        id: 'number',
        header: 'No',
        cell: ({ row }) => row.index + 1
    },
    {
        accessorKey: 'name',
        header: 'Nama Role'
    },
    {
        accessorKey: 'description',
        header: 'Deskripsi',
        cell: ({ row }) => row.original.description || '-'
    },
    {
        id: 'userCount',
        header: 'Jumlah User',
        cell: ({ row }) => {
            const count = row.original._count?.users ?? 0
            return h('span', {}, `${count} user`)
        }
    },
    {
        accessorKey: 'createdAt',
        header: 'Tanggal Dibuat',
        cell: ({ row }) => {
            const date = new Date(row.original.createdAt)
            return date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })
        }
    }
]

const nameSearch = computed({
    get: (): string => {
        return (table.value?.tableApi?.getColumn('name')?.getFilterValue() as string) || ''
    },
    set: (value: string) => {
        table.value?.tableApi?.getColumn('name')?.setFilterValue(value || undefined)
    }
})

const pagination = ref({
    pageIndex: 0,
    pageSize: 10
})
</script>

<template>
    <UDashboardPanel id="roles">
        <template #header>
            <UDashboardNavbar title="Kelola Role">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>

                <template #right>
                    <UButton icon="i-lucide-refresh-cw" color="neutral" variant="ghost" @click="refresh()" />
                    <UButton v-if="isSuperAdmin" label="Tambah Role" icon="i-lucide-plus" @click="isModalOpen = true" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div class="flex flex-wrap items-center justify-between gap-1.5">
                <UInput v-model="nameSearch" class="max-w-sm" icon="i-lucide-search"
                    placeholder="Cari nama role..." />
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
                    Total {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} role(s).
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

    <!-- Modal Tambah Role -->
    <UModal v-model:open="isModalOpen">
        <template #content>
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold">Tambah Role Baru</h3>
                        <UButton icon="i-lucide-x" color="neutral" variant="ghost" square
                            @click="isModalOpen = false" />
                    </div>
                </template>

                <form @submit.prevent="submitRole" class="space-y-4">
                    <UFormField label="Nama Role" required>
                        <UInput v-model="form.name" placeholder="Masukkan nama role" class="w-full" />
                    </UFormField>

                    <UFormField label="Deskripsi">
                        <UTextarea v-model="form.description" placeholder="Masukkan deskripsi role (opsional)"
                            class="w-full" />
                    </UFormField>
                </form>

                <template #footer>
                    <div class="flex justify-end gap-2">
                        <UButton label="Batal" color="neutral" variant="outline" @click="isModalOpen = false" />
                        <UButton label="Simpan" icon="i-lucide-check" :loading="isSubmitting" @click="submitRole" />
                    </div>
                </template>
            </UCard>
        </template>
    </UModal>
</template>
