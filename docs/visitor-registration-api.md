# Visitor RSVP API — ProBuild INTIM 2026

Spesifikasi endpoint untuk konfirmasi kehadiran tamu undangan resmi.

**Base URL (production):** `https://admin.probuildintim.com/api`  
**Base URL (development):** `/api` (proxy Vite → admin)

---

## Endpoint

### Create RSVP

```http
POST /visitor-rsvp
Content-Type: application/json
Accept: application/json
```

#### Request body

| Field | Type | Required | Validation | Description |
|---|---|---|---|---|
| `fullName` | string | yes | min 3 chars | Nama lengkap beserta gelar |
| `position` | string | yes | min 2 chars | Jabatan |
| `institution` | string | yes | min 2 chars | Nama lembaga/perusahaan |
| `institutionAddress` | string | yes | min 5 chars | Alamat instansi (kota & provinsi) |
| `identityNumber` | string | yes | exactly 16 digits | Nomor KTP |
| `whatsapp` | string | yes | 8–16 digits | Nomor WhatsApp |
| `email` | string | yes | valid email | Email |
| `partySize` | integer | yes | 1–10 | Jumlah rombongan (termasuk diri sendiri) |
| `groupMembers` | array | conditional | required if `partySize > 1`; length = `partySize - 1` | Anggota rombongan |
| `groupMembers[].name` | string | yes* | min 2 chars | Nama anggota |
| `groupMembers[].position` | string | yes* | min 2 chars | Jabatan anggota |
| `attendanceStatus` | enum | yes | see below | Konfirmasi kehadiran |
| `delegateName` | string | conditional | required if `attendanceStatus = diwakilkan` | Nama perwakilan |
| `delegatePosition` | string | conditional | required if `attendanceStatus = diwakilkan` | Jabatan perwakilan |
| `eventRoles` | string[] | yes | min 1 item | Rencana peran dalam acara |
| `eventRolesOther` | string | conditional | required if `eventRoles` contains `lainnya` | Keterangan peran lainnya |
| `specialNeeds` | string[] | yes | min 1 item | Kebutuhan khusus |
| `notes` | string | no | max 2000 chars | Catatan untuk panitia |
| `termsAccepted` | boolean | yes | must be `true` | Persetujuan ketentuan acara |
| `language` | enum | yes | `id` \| `en` | Bahasa form saat submit |
| `submittedAt` | string (ISO 8601) | no | — | Timestamp client (opsional) |

#### Enum: `attendanceStatus`

| Value | Label (ID) |
|---|---|
| `hadir` | Hadir |
| `diwakilkan` | Diwakilkan |
| `berhalangan` | Berhalangan hadir |

#### Enum: `eventRoles`

| Value | Label (ID) |
|---|---|
| `pembuka_sambutan` | Pembuka Sambutan |
| `narasumber` | Narasumber |
| `peninjau_stand` | Peninjau Stand |
| `tamu_undangan` | Tamu Undangan |
| `lainnya` | Lainnya |

#### Enum: `specialNeeds`

| Value | Label (ID) |
|---|---|
| `kursi_roda` | Kursi roda |
| `akses_prioritas` | Akses prioritas |
| `meja_khusus` | Meja khusus |
| `penerjemah` | Penerjemah |
| `tidak_ada` | Tidak ada |

---

## Example request

```json
{
  "fullName": "Ir. Budi Santoso, M.T.",
  "position": "Direktur Utama",
  "institution": "PT Contoh Konstruksi",
  "institutionAddress": "Makassar, Sulawesi Selatan",
  "identityNumber": "7371012345670001",
  "whatsapp": "085705852676",
  "email": "budi@contoh.com",
  "partySize": 2,
  "groupMembers": [
    { "name": "Ani Wijaya", "position": "Staf Protokol" }
  ],
  "attendanceStatus": "diwakilkan",
  "delegateName": "Dr. Ahmad",
  "delegatePosition": "Wakil Direktur",
  "eventRoles": ["tamu_undangan"],
  "eventRolesOther": null,
  "specialNeeds": ["tidak_ada"],
  "notes": "",
  "termsAccepted": true,
  "language": "id",
  "submittedAt": "2026-08-31T14:30:00+08:00"
}
```

---

## Responses

### 201 Created

```json
{
  "success": true,
  "message": "Konfirmasi kehadiran tercatat.",
  "registrationId": "RSVP-2026-00042"
}
```

### 422 Unprocessable Entity

```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": {
    "email": ["Format email tidak valid"],
    "identityNumber": ["Nomor KTP harus 16 digit"]
  }
}
```

### 409 Conflict (optional)

Digunakan jika backend membatasi 1 RSVP per email/KTP:

```json
{
  "success": false,
  "message": "Konfirmasi untuk email ini sudah tercatat."
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Terjadi kesalahan server."
}
```

---

## Backend notes

- Simpan `registrationId` unik untuk referensi panitia dan bukti konfirmasi.
- Rekomendasi: kirim notifikasi WhatsApp/email ke tamu setelah `201` (integrasi terpisah).
- CORS: izinkan origin frontend production (`https://probuildintim.com` atau domain Hostinger).
- Rate limiting disarankan (mis. 5 request/menit per IP).
- Auth opsional untuk admin export; endpoint public POST tanpa token untuk form tamu.

---

## Database schema (suggested)

**Table: `visitor_rsvps`**

| Column | Type |
|---|---|
| id | UUID / auto increment |
| registration_id | string unique |
| full_name | string |
| position | string |
| institution | string |
| institution_address | text |
| identity_number | string (indexed) |
| whatsapp | string |
| email | string (indexed) |
| party_size | smallint |
| group_members | JSON |
| attendance_status | enum |
| delegate_name | string nullable |
| delegate_position | string nullable |
| event_roles | JSON |
| event_roles_other | string nullable |
| special_needs | JSON |
| notes | text nullable |
| language | char(2) |
| created_at | timestamp |
