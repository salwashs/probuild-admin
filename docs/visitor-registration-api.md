# Visitor RSVP API — ProBuild INTIM 2026

Spesifikasi endpoint untuk pendaftaran visitor ProBuild INTIM 2026.

> **Implementasi:** Endpoint ini tersedia sebagai `POST /api/visitor-rsvp` (alias event `probuild-intim-2026`).  
> Dokumentasi lengkap sistem visitor dinamis: [visitor-event-api.md](./visitor-event-api.md).  
> Definisi field: `prisma/intim-2026-fields.ts`.

**Base URL (production):** `https://admin.probuildintim.com/api`  
**Base URL (development):** `/api` (proxy Vite → admin lokal)

---

## Endpoint

### Create RSVP

```http
POST /visitor-rsvp
Content-Type: application/json
Accept: application/json
```

#### Request body — wajib (form expo `/registrasi`)

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| `email` | string | yes | valid email; unique per event | Email |
| `fullName` | string | yes | min 3 chars | Nama lengkap |
| `whatsapp` | string | yes | 8–16 digits; unique per event | Nomor WhatsApp |
| `institution` | string | yes | min 2 chars | Nama perusahaan/instansi. Kirim `"umum"` jika visitor umum. |
| `domisili` | string | yes | min 2 chars | Domisili (kota/kabupaten). Di skema admin opsional agar data lama aman. |
| `termsAccepted` | boolean | yes | must be `true` | Persetujuan ketentuan |
| `language` | enum | yes | `id` \| `en` | Bahasa form |

#### Request body — opsional

| Field | Type | Required | Description |
|---|---|---|---|
| `position` | string | no | Jabatan (min 2 jika diisi) |
| `institutionAddress` | string | no | Alamat instansi |
| `identityNumber` | string | no | KTP 16 digit; unique jika diisi |
| `partySize` | number | no | Jumlah rombongan 1–10 |
| `groupMembers` | array | no | Anggota rombongan (jika partySize > 1) |
| `attendanceStatus` | enum | no | `hadir` \| `diwakilkan` \| `berhalangan` |
| `delegateName` / `delegatePosition` | string | no | Wajib jika `attendanceStatus = diwakilkan` |
| `eventRoles` / `eventRolesOther` | array / string | no | Peran acara |
| `specialNeeds` | array | no | Kebutuhan khusus |
| `notes` | string | no | Catatan panitia |
| `submittedAt` | string | no | ISO timestamp klien |

Field opsional yang kosong **tidak perlu dikirim**; validasi melewati field tersebut.

---

## Example request — form expo (minimal)

```json
{
  "email": "budi@contoh.com",
  "fullName": "Budi Santoso",
  "whatsapp": "085705852676",
  "institution": "PT Contoh Konstruksi",
  "domisili": "Surabaya",
  "position": "Direktur Utama",
  "termsAccepted": true,
  "language": "id"
}
```

## Example request — visitor umum

```json
{
  "email": "ani@email.com",
  "fullName": "Ani Wijaya",
  "whatsapp": "081234567890",
  "institution": "umum",
  "domisili": "Jakarta Selatan",
  "termsAccepted": true,
  "language": "id"
}
```

Pada form: jika visitor memilih "umum", UI mengosongkan nama instansi, tetapi body API mengirim `"institution": "umum"`.

---

## Responses

### 201 Created

```json
{
  "success": true,
  "message": "Konfirmasi kehadiran tercatat.",
  "registrationId": "RSVP-2026-00042",
  "emailSent": true
}
```

Setelah `201`, frontend menampilkan **QR code** berisi string `registrationId` untuk check-in, plus tombol unduh PDF. Jika SMTP terkonfigurasi, email berisi QR juga dikirim ke alamat visitor (`emailSent: true/false`).

### Email QR (SMTP)

Env di server admin (contoh Hostinger):

```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=noreply@probuildintim.com
SMTP_PASS=...
SMTP_FROM="ProBuild INTIM <noreply@probuildintim.com>"
```

Tanpa env lengkap, RSVP tetap `201` dengan `emailSent: false`. Kegagalan kirim email tidak membatalkan registrasi.

### 422 Unprocessable Entity

```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": {
    "email": ["Format email tidak valid"],
    "whatsapp": ["Format tidak valid"]
  }
}
```

### 409 Conflict

Email atau WhatsApp sudah terdaftar untuk event yang sama:

```json
{
  "success": false,
  "message": "Konfirmasi untuk email ini sudah tercatat."
}
```

---

## QR & check-in

1. **QR link pendaftaran** — URL form (mis. `http://localhost:5173/registrasi` lokal / production domain).
2. **QR setelah submit** — encode `registrationId` (teks mentah).
3. Admin check-in → `POST /api/visitors/check-in` dengan `{ "registrationId": "..." }`.

---

## Backend notes

- `POST /api/visitor-rsvp` — tanpa auth, event `probuild-intim-2026`.
- Alternatif: `POST /api/events/probuild-intim-2026/visitors`.
- Sync definisi field (tanpa hapus Visitors): `pnpm prisma:sync-intim` atau `npx tsx prisma/sync-intim-fields.ts`. Hanya mengganti `EventFormFields`; data `Visitors` dihitung sebelum/sesudah dan harus sama.
- Unique per event: `email`, `whatsapp` (dan `identityNumber` jika diisi).
