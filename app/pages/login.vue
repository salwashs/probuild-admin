<script setup lang="ts">
definePageMeta({
  layout: 'login'
})

const toast = useToast()

const form = reactive({
  email: '',
  password: ''
})
const showPassword = ref(false)
const isLoading = ref(false)

async function handleLogin() {
  if (!form.email || !form.password) {
    toast.add({
      title: 'Validasi Gagal',
      description: 'Email dan password wajib diisi.',
      color: 'error'
    })
    return
  }

  isLoading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: form.email,
        password: form.password
      }
    })

    // Fetch user info into auth state
    const { fetchUser } = useAuth()
    await fetchUser()

    toast.add({
      title: 'Login Berhasil',
      description: 'Selamat datang kembali!',
      color: 'success'
    })

    await navigateTo('/')
  } catch (error: any) {
    toast.add({
      title: 'Login Gagal',
      description: error?.data?.message || 'Email atau password salah.',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black relative overflow-hidden">
    <!-- Background decorative elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
    </div>

    <div class="relative z-10 w-full max-w-md px-4">
      <!-- Logo & Title -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 ring-1 ring-primary/25 mb-4">
          <UIcon name="i-lucide-shield-check" class="size-8 text-primary" />
        </div>
        <h1 class="text-3xl font-bold text-white tracking-tight">Probuild Admin</h1>
        <p class="text-gray-400 mt-2">Masuk ke dashboard admin</p>
      </div>

      <!-- Login Card -->
      <div class="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <UFormField label="Email">
            <UInput
              v-model="form.email"
              type="email"
              placeholder="admin@probuild.com"
              icon="i-lucide-mail"
              size="lg"
              class="w-full"
              autofocus
            />
          </UFormField>

          <UFormField label="Password">
            <UInput
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Masukkan password"
              icon="i-lucide-lock"
              size="lg"
              class="w-full"
            >
              <template #trailing>
                <UButton
                  :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  square
                  @click="showPassword = !showPassword"
                />
              </template>
            </UInput>
          </UFormField>

          <UButton
            type="submit"
            label="Masuk"
            icon="i-lucide-log-in"
            size="lg"
            block
            :loading="isLoading"
            class="mt-6"
          />
        </form>
      </div>

      <p class="text-center text-gray-600 text-sm mt-6">
        &copy; {{ new Date().getFullYear() }} Probuild. All rights reserved.
      </p>
    </div>
  </div>
</template>
