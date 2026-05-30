interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  role: {
    id: string;
    name: string;
  };
}

export const useAuth = () => {
  const user = useState<AuthUser | null>("auth-user", () => null);
  const isLoggedIn = computed(() => !!user.value);
  const isSuperAdmin = computed(
    () => user.value?.role?.name === "super admin"
  );
  const isAdmin = computed(() => user.value?.role?.name === "admin");
  const isAdminOrAbove = computed(
    () => isSuperAdmin.value || isAdmin.value
  );

  async function fetchUser() {
    try {
      const data = await $fetch<AuthUser>("/api/auth/me");
      user.value = data;
      return data;
    } catch {
      user.value = null;
      return null;
    }
  }

  async function logout() {
    try {
      await $fetch("/api/auth/logout", { method: "POST" });
    } finally {
      user.value = null;
      await navigateTo("/login");
    }
  }

  function isRole(roleName: string) {
    return user.value?.role?.name === roleName;
  }

  return {
    user,
    isLoggedIn,
    isSuperAdmin,
    isAdmin,
    isAdminOrAbove,
    fetchUser,
    logout,
    isRole,
  };
};
