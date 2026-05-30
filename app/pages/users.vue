<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { getPaginationRowModel } from '@tanstack/table-core'

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const { isAdminOrAbove, isSuperAdmin } = useAuth()

const toast = useToast()
const table = useTemplateRef('table')

const columnFilters = ref([{
    id: 'name',
    value: ''
}])
const columnVisibility = ref()

// Fetch user data
const defaultData = ref<any[]>([])
const { data, status, refresh } = await useFetch<any[]>('/api/users', {
    lazy: true
})

// Fetch roles for the dropdown
const { data: roles } = await useFetch<any[]>('/api/roles', {
    lazy: true
})

// Modal state
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const showPassword = ref(false)

// Form state
const form = reactive({
    name: '',
    email: '',
    password: '',
    roleId: ''
})

function resetForm() {
    form.name = ''
    form.email = ''
    form.password = ''
    form.roleId = ''
    showPassword.value = false
}

async function submitUser() {
    if (!form.email || !form.password || !form.roleId) {
        toast.add({
            title: 'Validasi Gagal',
            description: 'Email, password, dan role wajib diisi.',
            color: 'error'
        })
        return
    }

    isSubmitting.value = true
    try {
        await $fetch('/api/users', {
            method: 'POST',
            body: {
                name: form.name || null,
                email: form.email,
                password: form.password,
                roleId: form.roleId
            }
        })

        toast.add({
            title: 'Berhasil',
            description: `User "${form.email}" berhasil ditambahkan.`,
            color: 'success'
        })

        resetForm()
        isModalOpen.value = false
        refresh()
    } catch (error: any) {
        toast.add({
            title: 'Gagal',
            description: error?.data?.message || 'Terjadi kesalahan saat menyimpan user.',
            color: 'error'
        })
    } finally {
        isSubmitting.value = false
    }
}

function getRowItems(row: any) {
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
        accessorKey: 'name',
        header: 'Nama',
        cell: ({ row }) => row.original.name || '-'
    },
    {
        accessorKey: 'email',
        header: 'Email'
    },
    {
        id: 'role',
        accessorFn: (row) => row.role?.name,
        header: 'Role',
        cell: ({ row }) => {
            const roleName = row.original.role?.name
            return roleName
                ? h(UBadge, { color: 'primary', variant: 'subtle' }, () => roleName)
                : '-'
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

// Computed role options for select dropdown
const roleOptions = computed(() => {
    return (roles.value || [])
        .filter((role: any) => {
            // Admin cannot select super admin role
            if (!isSuperAdmin.value && role.name.toLowerCase() === 'super admin') {
                return false
            }
            return true
        })
        .map((role: any) => ({
            label: role.name,
            value: role.id
        }))
})
</script>

<template>
    <UDashboardPanel id="users">
        <template #header>
            <UDashboardNavbar title="Kelola User">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>

                <template #right>
                    <UButton icon="i-lucide-refresh-cw" color="neutral" variant="ghost" @click="refresh()" />
                    <UButton v-if="isAdminOrAbove" label="Tambah User" icon="i-lucide-plus" @click="isModalOpen = true" />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div class="flex flex-wrap items-center justify-between gap-1.5">
                <UInput v-model="nameSearch" class="max-w-sm" icon="i-lucide-search"
                    placeholder="Cari nama user..." />
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
                    Total {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} user(s).
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

    <!-- Modal Tambah User -->
    <UModal v-model:open="isModalOpen">
        <template #content>
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold">Tambah User Baru</h3>
                        <UButton icon="i-lucide-x" color="neutral" variant="ghost" square
                            @click="isModalOpen = false" />
                    </div>
                </template>

                <form @submit.prevent="submitUser" class="space-y-4">
                    <UFormField label="Nama">
                        <UInput v-model="form.name" placeholder="Masukkan nama (opsional)" class="w-full" />
                    </UFormField>

                    <UFormField label="Email" required>
                        <UInput v-model="form.email" type="email" placeholder="Masukkan email" class="w-full" />
                    </UFormField>

                    <UFormField label="Password" required>
                        <UInput v-model="form.password" :type="showPassword ? 'text' : 'password'"
                            placeholder="Masukkan password" class="w-full">
                            <template #trailing>
                                <UButton :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" color="neutral"
                                    variant="ghost" size="sm" square @click="showPassword = !showPassword" />
                            </template>
                        </UInput>
                    </UFormField>

                    <UFormField label="Role" required>
                        <USelect v-model="form.roleId" :items="roleOptions" placeholder="Pilih role" class="w-full"
                            value-key="value" />
                    </UFormField>
                </form>

                <template #footer>
                    <div class="flex justify-end gap-2">
                        <UButton label="Batal" color="neutral" variant="outline" @click="isModalOpen = false" />
                        <UButton label="Simpan" icon="i-lucide-check" :loading="isSubmitting" @click="submitUser" />
                    </div>
                </template>
            </UCard>
        </template>
    </UModal>
</template>
