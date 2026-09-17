# Visitor RSVP API — ProBuild INTIM 2026

Spesifikasi endpoint untuk pendaftaran visitor ProBuild INTIM 2026.

> **Implementasi:** Endpoint ini tersedia sebagai `POST /api/visitor-rsvp` (alias event `probuild-intim-2026`).  
> Dokumentasi lengkap sistem visitor dinamis: [visitor-event-api.md](./visitor-event-api.md).

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
| `email` | string | yes | valid email; unique per event | Email |
| `fullName` | string | yes | min 3 chars | Nama lengkap |
| `whatsapp` | string | yes | 8–16 digits; unique per event | Nomor WhatsApp |
| `institution` | string | yes | min 2 chars | Nama perusahaan/instansi. Kirim `"umum"` jika visitor umum (bukan dari instansi). Jika dari instansi, wajib isi nama nyata. |
| `position` | string | no | min 2 chars jika diisi | Jabatan (opsional) |

---

## Example request — visitor dari instansi

```json
{
  "email": "budi@contoh.com",
  "fullName": "Budi Santoso",
  "whatsapp": "085705852676",
  "institution": "PT Contoh Konstruksi",
  "position": "Direktur Utama"
}
```

## Example request — visitor umum

```json
{
  "email": "ani@email.com",
  "fullName": "Ani Wijaya",
  "whatsapp": "081234567890",
  "institution": "umum"
}
```

Pada form frontend: jika visitor memilih "umum", field nama instansi boleh dikosongkan di UI, tetapi **body API harus mengirim** `"institution": "umum"`.

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

Setelah `201`, frontend eksternal harus menampilkan **QR code** yang isinya string `registrationId` (contoh `RSVP-2026-00042`). QR ini dipakai untuk registrasi ulang / check-in di pintu acara.

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

Digunakan jika email atau WhatsApp sudah terdaftar untuk event yang sama:

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

## QR & check-in (kontrak frontend eksternal)

1. **QR link pendaftaran** — encode URL halaman form di site eksternal (mis. konstruksi-expo). Admin menampilkan QR yang sama dari env `NUXT_PUBLIC_VISITOR_REGISTER_URL`.
2. **QR setelah submit** — encode `registrationId` dari response 201 (teks mentah, bukan URL).
3. Admin scan QR di halaman Check-in → `POST /api/visitors/check-in` dengan `{ "registrationId": "..." }` (lihat [visitor-event-api.md](./visitor-event-api.md)).

---

## Backend notes

- Endpoint aktif: `POST /api/visitor-rsvp` — tanpa auth, terikat event `probuild-intim-2026`.
- Alternatif generik: `POST /api/events/probuild-intim-2026/visitors` (body sama).
- `registrationId` unik digenerate otomatis (`RSVP-2026-00001`, …).
- Unique per event: `email`, `whatsapp`.
- CORS: izinkan origin frontend production.
- Manajemen visitor & check-in admin: lihat [visitor-event-api.md](./visitor-event-api.md).

---

## Database schema

Skema aktual memakai tabel `Events`, `EventFormFields`, dan `Visitors` (payload JSON).  
Detail lengkap: [visitor-event-api.md#database-schema](./visitor-event-api.md#database-schema).
