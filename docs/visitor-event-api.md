# Visitor & Event API — ProBuild Admin

Dokumentasi API untuk registrasi visitor **dinamis per event**. Setiap event memiliki skema form sendiri (`EventFormFields`); validasi mengikuti definisi field di database.

**Base URL (production):** `https://admin.probuildintim.com/api`  
**Base URL (development):** `/api` (proxy Vite → admin)

---

## Ringkasan endpoint

| Method | Path | Auth | Keterangan |
|---|---|---|---|
| `POST` | `/visitor-rsvp` | Publik | RSVP ProBuild INTIM 2026 (shortcut) |
| `POST` | `/events/:slug/visitors` | Publik | Registrasi visitor untuk event aktif |
| `GET` | `/events` | Admin | Daftar event + skema form |
| `POST` | `/events` | Admin | Buat event baru (+ fields opsional) |
| `PUT` | `/events` | Admin | Ubah event (+ replace fields opsional) |
| `GET` | `/visitors?eventId=` | Admin | Daftar visitor (payload di-flatten) |
| `POST` | `/visitors` | Admin | Tambah visitor manual |
| `PUT` | `/visitors` | Admin | Edit visitor |
| `DELETE` | `/visitors` | Admin | Hapus visitor |

Spesifikasi field form **ProBuild INTIM 2026** (RSVP tamu undangan): lihat [visitor-registration-api.md](./visitor-registration-api.md).

---

## Autentikasi

### Endpoint publik (tanpa token)

- `POST /api/visitor-rsvp`
- `POST /api/events/:slug/visitors`
- `POST /api/exhibitors` *(resource terpisah)*

### Endpoint admin

Semua endpoint lain memerlukan cookie HTTP-only `auth_token` dari login admin.

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@probuildintim.com",
  "password": "password"
}
```

Response berisi data user; cookie `auth_token` diset otomatis (7 hari).

---

## Arsitektur data

```text
Events (1) ──< EventFormFields (skema form per event)
    │
    └──< Visitors (payload JSON + kolom index)
```

- **`Events`**: metadata event (`slug`, `registrationPrefix`, `visitorSeq`, …).
- **`EventFormFields`**: definisi field form (type, validasi, kondisi, opsi enum).
- **`Visitors`**: jawaban form disimpan di `payload` (JSON). Kolom `fullName`, `email`, `phone`, `identityNumber` diisi otomatis dari field yang punya `indexAs`.

`registrationId` digenerate otomatis: `{registrationPrefix}-{seq 5 digit}`, contoh `RSVP-2026-00042`.

---

## Endpoint publik

### POST /visitor-rsvp

Shortcut untuk event **ProBuild INTIM 2026** (`slug: probuild-intim-2026`). Body dan validasi sama dengan [visitor-registration-api.md](./visitor-registration-api.md).

```http
POST /visitor-rsvp
Content-Type: application/json
Accept: application/json
```

**Request body:** field form event INTIM 2026 (camelCase), tanpa `eventId`.

**201 Created**

```json
{
  "success": true,
  "message": "Konfirmasi kehadiran tercatat.",
  "registrationId": "RSVP-2026-00001"
}
```

**404 Not Found** — event tidak ada atau tidak aktif.

**422 / 409 / 500** — lihat [Error responses](#error-responses).

---

### POST /events/:slug/visitors

Registrasi publik untuk **event mana pun** yang aktif. Body mengikuti skema `EventFormFields` event tersebut.

```http
POST /events/probuild-intim-2026/visitors
Content-Type: application/json
Accept: application/json
```

**Path parameter**

| Name | Type | Description |
|---|---|---|
| `slug` | string | Slug unik event, mis. `probuild-intim-2026` |

**Request body:** object dengan key = `EventFormFields.key` (camelCase). Field wajib/kondisional mengikuti definisi event.

**201 Created** — sama dengan `/visitor-rsvp`.

**400 Bad Request** — event tidak aktif.

**404 Not Found** — slug tidak ditemukan.

---

## Endpoint admin — Events

### GET /events

Mengembalikan semua event beserta array `fields` (urut `sortOrder`).

```http
GET /events
Cookie: auth_token=...
```

**200 OK** — array event:

```json
[
  {
    "id": "uuid",
    "slug": "probuild-intim-2026",
    "name": "ProBuild INTIM 2026",
    "description": "Konfirmasi kehadiran tamu undangan resmi ProBuild INTIM 2026",
    "registrationPrefix": "RSVP-2026",
    "visitorSeq": 42,
    "isActive": true,
    "startsAt": null,
    "endsAt": null,
    "createdAt": "2026-08-31T07:00:00.000Z",
    "updatedAt": "2026-08-31T07:00:00.000Z",
    "fields": [
      {
        "id": "uuid",
        "eventId": "uuid",
        "key": "fullName",
        "labelId": "Nama lengkap beserta gelar",
        "labelEn": "Full name with title",
        "type": "text",
        "required": true,
        "sortOrder": 1,
        "showInTable": true,
        "indexAs": "fullName",
        "uniquePerEvent": false,
        "validation": { "minLength": 3, "maxLength": 255 },
        "options": null,
        "conditions": null,
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  }
]
```

---

### POST /events

Membuat event baru. Opsional sekaligus mendefinisikan skema form.

```http
POST /events
Content-Type: application/json
Cookie: auth_token=...
```

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `slug` | string | yes | Identifier unik URL-friendly |
| `name` | string | yes | Nama tampilan event |
| `registrationPrefix` | string | yes | Prefix ID registrasi, mis. `RSVP-2026` |
| `description` | string | no | Deskripsi event |
| `isActive` | boolean | no | Default `true` |
| `startsAt` | string (ISO 8601) | no | Mulai event |
| `endsAt` | string (ISO 8601) | no | Akhir event |
| `fields` | array | no | Definisi `EventFormFields` (lihat [Skema field](#skema-eventformfields)) |

**201 Created** — object event + `fields`.

**409 Conflict** — `slug` sudah dipakai.

---

### PUT /events

Memperbarui metadata event. Jika `fields` dikirim sebagai array, **semua field lama dihapus** dan diganti dengan array baru.

```http
PUT /events
Content-Type: application/json
Cookie: auth_token=...
```

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | UUID event |
| `slug` | string | no | |
| `name` | string | no | |
| `description` | string | no | |
| `registrationPrefix` | string | no | |
| `isActive` | boolean | no | |
| `startsAt` | string \| null | no | |
| `endsAt` | string \| null | no | |
| `fields` | array | no | Replace penuh skema form |

**200 OK** — event terbaru + `fields`.

---

## Endpoint admin — Visitors

### GET /visitors

```http
GET /visitors?eventId={uuid}
Cookie: auth_token=...
```

**Query parameter**

| Name | Type | Required | Description |
|---|---|---|---|
| `eventId` | string | no | Filter per event; jika kosong, semua visitor |

**200 OK** — array visitor dengan **payload di-flatten** ke root object:

```json
[
  {
    "id": "uuid",
    "eventId": "uuid",
    "registrationId": "RSVP-2026-00001",
    "fullName": "Ir. Budi Santoso, M.T.",
    "email": "budi@contoh.com",
    "phone": "085705852676",
    "identityNumber": "7371012345670001",
    "language": "id",
    "submittedAt": "2026-08-31T06:30:00.000Z",
    "createdAt": "2026-08-31T07:00:00.000Z",
    "updatedAt": "2026-08-31T07:00:00.000Z",
    "position": "Direktur Utama",
    "institution": "PT Contoh Konstruksi",
    "attendanceStatus": "hadir",
    "partySize": 1,
    "eventRoles": ["tamu_undangan"],
    "specialNeeds": ["tidak_ada"],
    "termsAccepted": true
  }
]
```

Field tambahan di root = isi `payload` sesuai key form event.

---

### POST /visitors

Tambah visitor dari panel admin (validasi sama dengan form publik).

```http
POST /visitors
Content-Type: application/json
Cookie: auth_token=...
```

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `eventId` | string | yes | UUID event |
| `...` | — | — | Semua field form event (key camelCase) |

**201 Created** — object visitor (flattened), termasuk `registrationId` baru.

---

### PUT /visitors

```http
PUT /visitors
Content-Type: application/json
Cookie: auth_token=...
```

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | UUID visitor |
| `...` | — | — | Field form yang ingin diubah (validasi ulang penuh) |

**200 OK** — visitor terbaru (flattened).

**404 Not Found** — visitor atau event tidak ditemukan.

---

### DELETE /visitors

```http
DELETE /visitors
Content-Type: application/json
Cookie: auth_token=...
```

**Request body**

```json
{
  "id": "uuid-visitor"
}
```

**200 OK**

```json
{
  "success": true,
  "message": "Visitor berhasil dihapus.",
  "id": "uuid-visitor"
}
```

---

## Skema EventFormFields

Digunakan di `GET /events`, `POST /events`, `PUT /events`, dan sebagai acuan validasi visitor.

| Property | Type | Description |
|---|---|---|
| `key` | string | Identifier field (camelCase), unik per event |
| `labelId` | string | Label bahasa Indonesia |
| `labelEn` | string | Label bahasa Inggris (opsional) |
| `type` | enum | `text`, `email`, `tel`, `number`, `textarea`, `select`, `multiselect`, `boolean`, `group` |
| `required` | boolean | Wajib diisi (jika tidak ada kondisi) |
| `sortOrder` | number | Urutan tampilan form |
| `showInTable` | boolean | Tampilkan di tabel admin |
| `indexAs` | string \| null | Salin ke kolom visitor: `fullName`, `email`, `phone`, `identityNumber` |
| `uniquePerEvent` | boolean | Cek duplikat per event (409) |
| `validation` | object | Aturan validasi (lihat bawah) |
| `options` | array | Opsi enum untuk `select` / `multiselect` |
| `conditions` | object | Field kondisional (`requiredIf`, `showIf`) |

### `validation` object

| Key | Type | Keterangan |
|---|---|---|
| `minLength` | number | Panjang minimum string |
| `maxLength` | number | Panjang maksimum string |
| `exactLength` | number | Panjang tepat (mis. KTP 16 digit) |
| `pattern` | string | Regex |
| `min` / `max` | number | Batas angka |
| `minItems` | number | Minimum item array (`multiselect`) |
| `mustBe` | boolean | Nilai boolean wajib (mis. `termsAccepted: true`) |
| `itemFields` | array | Sub-field untuk `group` |
| `lengthEqualsField` | string | Panjang array = nilai field lain |
| `offset` | number | Offset untuk `lengthEqualsField` (mis. `partySize - 1`) |

### `options` item

```json
{ "value": "hadir", "labelId": "Hadir", "labelEn": "Attending" }
```

### `conditions` object

```json
{
  "requiredIf": { "field": "partySize", "gt": 1 },
  "showIf": { "field": "attendanceStatus", "eq": "diwakilkan" }
}
```

Operator kondisi: `eq`, `gt`, `contains` (untuk array).

---

## Error responses

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Autentikasi diperlukan."
}
```

### 422 Unprocessable Entity

```json
{
  "statusCode": 422,
  "message": "Validasi gagal",
  "data": {
    "success": false,
    "message": "Validasi gagal",
    "errors": {
      "identityNumber": ["Nomor KTP harus 16 digit"],
      "email": ["Format email tidak valid"]
    }
  }
}
```

### 409 Conflict

Duplikat field dengan `uniquePerEvent: true` (email / KTP per event):

```json
{
  "statusCode": 409,
  "message": "Konfirmasi untuk email ini sudah tercatat.",
  "data": {
    "success": false,
    "message": "Konfirmasi untuk email ini sudah tercatat."
  }
}
```

### 500 Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Terjadi kesalahan server.",
  "data": {
    "success": false,
    "message": "Terjadi kesalahan server."
  }
}
```

---

## Database schema

### `Events`

| Column | Type |
|---|---|
| id | UUID |
| slug | string (unique) |
| name | string |
| description | text (nullable) |
| registrationPrefix | string |
| visitorSeq | int (default 0) |
| isActive | boolean |
| startsAt | datetime (nullable) |
| endsAt | datetime (nullable) |
| createdAt / updatedAt | timestamp |

### `EventFormFields`

| Column | Type |
|---|---|
| id | UUID |
| eventId | UUID (FK → Events) |
| key | string |
| labelId / labelEn | string |
| type | string |
| required | boolean |
| sortOrder | int |
| showInTable | boolean |
| indexAs | string (nullable) |
| uniquePerEvent | boolean |
| validation / options / conditions | JSON (nullable) |
| createdAt / updatedAt | timestamp |

### `Visitors`

| Column | Type |
|---|---|
| id | UUID |
| eventId | UUID (FK → Events) |
| registrationId | string (unique) |
| fullName / email / phone / identityNumber | string (nullable, indexed) |
| payload | JSON |
| language | char(2) |
| submittedAt | datetime (nullable) |
| createdAt / updatedAt | timestamp |

---

## Event bawaan (seed)

| Property | Value |
|---|---|
| slug | `probuild-intim-2026` |
| name | ProBuild INTIM 2026 |
| registrationPrefix | `RSVP-2026` |
| fields | 19 field (lihat `prisma/intim-2026-fields.ts`) |

Menambah event baru: `POST /events` dengan `slug` dan `fields` baru — tidak perlu ubah kode API.

---

## Catatan implementasi

- **CORS:** diizinkan untuk `/api/**` (lihat `nuxt.config.ts` dan `server/middleware/cors.ts`).
- **Rate limiting:** disarankan untuk endpoint publik (belum diimplementasikan).
- **Notifikasi:** WhatsApp/email setelah RSVP belum terintegrasi (rekomendasi terpisah).
- **Dashboard:** `GET /api/dashboard/stats` menghitung total visitor semua event.
