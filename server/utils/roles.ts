/** Normalize role names from DB/JWT (e.g. "Super Admin" → "super admin"). */
export function normalizeRoleName(name?: string | null): string {
  return name?.trim().toLowerCase() ?? "";
}

export function isSuperAdminRole(roleName?: string | null): boolean {
  return normalizeRoleName(roleName) === "super admin";
}

export function isAdminRole(roleName?: string | null): boolean {
  const role = normalizeRoleName(roleName);
  return role === "admin";
}

/** Super Admin or Admin. */
export function isAdminOrAboveRole(roleName?: string | null): boolean {
  return isSuperAdminRole(roleName) || isAdminRole(roleName);
}
