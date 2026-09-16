const DEVICE_KEY = 'probuild.visitor.deviceId'
const REGISTRATION_PREFIX = 'probuild.visitor.registration.'

export type StoredRegistration = {
  registrationId: string
  fullName?: string | null
  submittedAt?: string | null
}

function canUseStorage() {
  return import.meta.client && typeof localStorage !== 'undefined'
}

export function getVisitorDeviceId(): string {
  if (!canUseStorage()) return ''

  let id = localStorage.getItem(DEVICE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_KEY, id)
  }
  return id
}

export function getStoredRegistration(slug: string): StoredRegistration | null {
  if (!canUseStorage()) return null
  const raw = localStorage.getItem(`${REGISTRATION_PREFIX}${slug}`)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredRegistration
    if (!parsed?.registrationId) return null
    return parsed
  } catch {
    return null
  }
}

export function storeRegistration(slug: string, data: StoredRegistration) {
  if (!canUseStorage()) return
  localStorage.setItem(`${REGISTRATION_PREFIX}${slug}`, JSON.stringify(data))
}
