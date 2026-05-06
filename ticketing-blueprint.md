# Blueprint Sistem Web Ticketing Event
> Referensi Platform: Yesplis.com & Goersapp.com  
> Tech Stack: Bun + Elysia.js + PostgreSQL + Prisma + Redis + Next.js 14  
> Versi Dokumen: 1.0.0 — 27 Maret 2026

---

## Daftar Isi

1. [System Overview](#1-system-overview)
2. [Role System Recommendation](#2-role-system-recommendation)
3. [Feature Classification](#3-feature-classification)
4. [Database Design](#4-database-design)
5. [API Design](#5-api-design)
6. [Business Logic Flows](#6-business-logic-flows)
7. [Backend Structure](#7-backend-structure)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Error Handling Standard](#9-error-handling-standard)
10. [Edge Cases](#10-edge-cases)
11. [Scalability Roadmap](#11-scalability-roadmap)

---

## 1. System Overview

Platform ini adalah **two-sided marketplace untuk penjualan tiket event** — bukan platform wisata atau travel, fokus murni pada event seperti konser, festival, seminar, workshop, kelas, dan pameran. Analoginya persis seperti Yesplis dan Goers: organizer mendaftar, membuat event, menetapkan harga tiket, lalu platform menjadi jembatan antara mereka dan pembeli.

Secara end-to-end, sistem bekerja sebagai berikut: **Organizer** membuat event melalui dashboard, mengatur tipe tiket (VIP, Regular, Early Bird), menetapkan promo code, lalu mempublikasikan event. **Buyer** menemukan event melalui halaman discovery, melakukan checkout, membayar via Midtrans (VA, QRIS, e-wallet, kartu kredit), dan menerima e-ticket ber-QR Code melalui email dan WhatsApp. Pada hari H, **Gate Scanner** (petugas pintu yang di-assign organizer) men-scan QR Code tiket menggunakan interface web mobile-friendly. Untuk event berskala besar dengan demand tinggi seperti konser viral, sistem mengaktifkan **Virtual Waiting Room** — antrian digital yang memanggil user satu per satu untuk checkout, mencegah server crash dan overselling massal. Platform mengambil **service fee** dari setiap transaksi sebagai model bisnis utama, dan organizer dapat **menarik revenue kapan saja** (bukan menunggu event selesai) sesuai model yang dipopulerkan Goers.

### Posisi vs Kompetitor

| Dimensi | Platform Ini | Yesplis | Goers |
|---|---|---|---|
| Fokus utama | Event ticketing | Event ticketing | Event + Wisata + Travel |
| Model bisnis | Service fee | Service fee | Service fee + Premium plan |
| Target organizer | Semua skala | Semua skala | Small s/d Enterprise |
| Virtual Waiting Room | Ya (MVP) | Ya | Partial |
| Follow organizer | Ya (MVP) | Tidak | Ya |
| Payout timing | Kapan saja | Setelah event | Kapan saja |
| On-site POS | V2 | Ya | Ya |
| Cashless wristband | V3 | Ya | Ya |

---

## 2. Role System Recommendation

### 2.1 Keputusan Role Final

Setelah analisis trade-off, sistem menggunakan **6 role** dengan **event-scoped permission** untuk staff dan scanner — bukan flat global role.

| Role | Scope | Deskripsi |
|---|---|---|
| `super_admin` | Global | Full access platform, moderasi, konfigurasi fee, financial |
| `organizer` | Global + Per-Event | Buat & kelola event milik sendiri, kelola tim, tarik revenue |
| `event_staff` | Per-Event | Diundang organizer, akses terbatas sesuai permission yang di-grant |
| `gate_scanner` | Per-Event | Hanya bisa scan & validasi tiket, real-time check-in |
| `buyer` | Global | Cari event, beli tiket, kelola order |
| `guest` | Per-Session | Beli tanpa akun, tiket dikirim ke email, tidak ada akun permanen |

> **Mengapa bukan Role-based saja?** Karena satu user bisa menjadi `event_staff` di event A tapi `gate_scanner` di event B. Jika ini dikunci di level role global, sistem menjadi tidak fleksibel. Solusinya: tabel `EventStaff` menyimpan kombinasi `(event_id, user_id, role)` — permission di-resolve saat request masuk.

### 2.2 Keputusan: Guest Buyer — Implement di MVP

**Rekomendasi: YA, implement di MVP.** Alasan:

- Goers dan Yesplis sama-sama mengizinkan beli tanpa akun
- Konversi jauh lebih tinggi — friction berkurang drastis untuk buyer kasual
- Kompleksitas terbatas: cukup simpan `guest_email` di tabel Order, tiket dikirim via email
- Trade-off: support lebih susah jika user kehilangan email → solusi: endpoint resend ticket by email

### 2.3 Keputusan: Organizer Verification

**Model dua tier:**

- **Organizer Reguler** (self-service): bisa buat event gratis langsung setelah daftar. Tidak bisa buat event berbayar sampai verifikasi.
- **Verified Organizer**: sudah submit KTP + NPWP + rekening bank, di-review admin. Bisa buat event berbayar, bisa tarik revenue, tampil badge "Verified" di profil.

Alasan: mencegah fraud organizer fiktif mengumpulkan uang lalu kabur.

### 2.4 Permission Matrix

| Permission | super_admin | organizer | event_staff | gate_scanner | buyer | guest |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Lihat listing event publik | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Beli tiket | ✓ | ✓ | ✓ | ✓ | ✓ | ✓* |
| Buat event | ✓ | ✓ | — | — | — | — |
| Edit event (milik sendiri) | ✓ | ✓ | ✓** | — | — | — |
| Lihat attendee list | ✓ | ✓ | ✓** | — | — | — |
| Scan & validasi tiket | ✓ | ✓ | — | ✓** | — | — |
| Invite event staff | ✓ | ✓ | — | — | — | — |
| Tarik revenue | ✓ | ✓ | — | — | — | — |
| Kirim blast ke buyer | ✓ | ✓ | ✓** | — | — | — |
| Approve event | ✓ | — | — | — | — | — |
| Kelola platform fee | ✓ | — | — | — | — | — |
| Suspend user / event | ✓ | — | — | — | — | — |

> `*` Guest hanya via email, tanpa akun  
> `**` Hanya untuk event spesifik tempat mereka di-assign

### 2.5 Event-Scoped Permission (EventStaff)

```
EventStaff {
  event_id     : UUID
  user_id      : UUID
  role         : "co_organizer" | "gate_scanner"
  permissions  : string[]   // ["edit_event", "view_attendee", "send_blast"]
  invited_by   : UUID
  accepted_at  : DateTime?
}
```

**Co-organizer bisa diberi permission:**
- `edit_event` — edit detail event
- `view_revenue` — lihat data revenue (tapi tidak bisa tarik)
- `view_attendee` — lihat & export daftar attendee
- `send_blast` — kirim blast message ke buyer
- `manage_promo` — kelola promo codes

**Gate Scanner hanya bisa:**
- Scan QR dan validasi tiket untuk event yang di-assign

### 2.6 Organizer Onboarding Flow

```
Daftar akun (email + password)
  ↓
Verifikasi email
  ↓
Akun aktif sebagai Buyer (bisa beli tiket)
  ↓
[Jika ingin jadi Organizer]
Isi profil organizer (nama EO, deskripsi, foto)
  ↓
Status: Organizer Reguler (hanya bisa buat FREE event)
  ↓
[Untuk event berbayar]
Submit dokumen: KTP + NPWP + Rekening Bank
  ↓
Admin review (1–3 hari kerja)
  ↓
Status: Verified Organizer (bisa buat event berbayar + tarik revenue)
```

---

## 3. Feature Classification

### 3.1 Tabel Klasifikasi Fitur

| Fitur | Status | Alasan |
|---|---|---|
| **EVENT MANAGEMENT** | | |
| CRUD event lengkap | **MVP** | Core platform |
| Kategori & tags event | **MVP** | Discovery engine butuh ini dari awal |
| Status flow (draft→published→on sale→sold out→completed/cancelled) | **MVP** | Business logic fundamental |
| Scheduled auto-publish | **MVP** | Organizer perlu set jam launch tiket — standar di Yesplis/Goers |
| Private / unlisted event | **MVP** | Banyak event corporate & komunitas pakai ini |
| Free event (tanpa payment) | **MVP** | ~30–40% event di platform Indo itu gratis |
| Organizer profile page | **MVP** | Trust signal — buyer mau lihat track record organizer |
| Follow organizer | **MVP** | Fitur Goers yang terbukti tingkatkan retention buyer |
| Event template | **V2** | Nice to have, bukan blocker |
| Featured / promoted event | **V2** | Revenue tambahan, tapi platform harus punya traffic dulu |
| **TICKET TYPES & PRICING** | | |
| Multiple ticket types | **MVP** | Hampir semua event punya VIP, Regular minimal |
| Early bird (expire by date/quota) | **MVP** | Standar industri, organizer selalu minta ini |
| Per-user purchase limit | **MVP** | Anti-scalping, wajib untuk konser |
| Promo codes / vouchers | **MVP** | Goers & Yesplis punya, organizer butuh untuk marketing |
| Complimentary tickets | **MVP** | Speaker, sponsor, media — semua event besar butuh ini |
| Group discount | **V2** | Berguna tapi bisa disimulasi dengan promo code dulu |
| **VIRTUAL WAITING ROOM** | | |
| Virtual Waiting Room | **MVP** | Lihat penjelasan lengkap di §3.2 |
| **CHECKOUT & ORDER** | | |
| Checkout dengan akun | **MVP** | Core flow |
| Guest checkout (email only) | **MVP** | Tingkatkan konversi signifikan |
| Custom form fields per event | **MVP** | Banyak organizer butuh data peserta (nama, institusi, dll) |
| Order expiry timer | **MVP** | Tanpa ini stock akan stuck di pending selamanya |
| Real-time stock counter | **MVP** | UX penting — buyer perlu tahu sisa tiket |
| Rincian biaya transparan | **MVP** | Mandatory — user harus lihat fee sebelum bayar |
| **PAYMENT & FINANCE** | | |
| Midtrans multi-payment method | **MVP** | Core payment |
| Platform service fee | **MVP** | Model bisnis utama |
| Free event flow (tanpa Midtrans) | **MVP** | Wajib ada karena banyak event gratis |
| Refund policy per event | **MVP** | Organizer harus bisa set ini saat buat event |
| Payout kapan saja (Goers model) | **MVP** | Diferensiasi dari kompetitor, akuisisi organizer |
| PDF invoice / receipt | **MVP** | User selalu minta ini untuk reimburse kerja |
| Partial refund | **V2** | Kompleks, Yesplis & Goers pun tidak jelas fitur ini |
| E-faktur korporat | **Hapus** | Bukan scope platform ini |
| **TICKET DELIVERY** | | |
| QR Code unik per tiket | **MVP** | Core — 1 tiket = 1 QR |
| E-ticket di akun + email | **MVP** | Core |
| Download PDF tiket | **MVP** | Standar semua platform |
| Re-send tiket ke email | **MVP** | Support case paling sering |
| Ticket transfer antar user | **V3** | Yesplis & Goers tidak jelas punya ini, skip dulu |
| PWA offline ticket | **V2** | Berguna tapi bukan blocker MVP |
| **SOCIAL & DISCOVERY** | | |
| Attendance list per event | **MVP** | Fitur Goers yang unik — bantu buyer decide beli tiket |
| Follow organizer | **MVP** | Retention & notifikasi event baru |
| Wishlist / bookmark event | **V2** | Berguna tapi bukan blocker |
| Share event + OG image | **MVP** | Viral loop — penting untuk growth |
| **GATE MANAGEMENT** | | |
| Scanner web interface (mobile) | **MVP** | Core — pengganti app terpisah untuk MVP |
| Scan QR → valid/invalid/used | **MVP** | Core |
| Real-time check-in counter | **MVP** | Organizer butuh ini live di venue |
| Manual check-in override | **MVP** | Selalu ada kasus QR rusak |
| Check-in dashboard live | **MVP** | Organizer minta ini paling sering |
| Export check-in data | **MVP** | Post-event reporting |
| **ORGANIZER DASHBOARD** | | |
| Revenue summary + chart | **MVP** | Core dashboard |
| Attendee list + export | **MVP** | Core |
| Promo code performance | **MVP** | Organizer perlu tahu efektivitas promo |
| Blast message ke buyer | **MVP** | Goers & Yesplis punya, organizer sering butuh |
| Invite & kelola event staff | **MVP** | Tanpa ini organizer tidak bisa delegasi ke timnya |
| **ORGANIZER TIER** | | |
| Free tier (event gratis only) | **MVP** | Barrier to entry rendah |
| Verified tier (event berbayar) | **MVP** | Trust & fraud prevention |
| Enterprise/Premium plan | **V2** | Goers punya, tapi butuh traction dulu |
| **EMBED WIDGET** | | |
| Embed button di website organizer | **V2** | Goers punya, useful tapi kompleks. Dulu JS snippet |
| **ON-SITE POS** | | |
| POS tiket di venue | **V2** | Yesplis & Goers punya, butuh hardware integration |
| Wristband printing | **V3** | Ekosistem tersendiri, investasi besar |
| **DISCOVERY & SEO** | | |
| Search full-text event | **MVP** | Core discovery |
| Filter (kategori, kota, tanggal, harga) | **MVP** | Core |
| Sort (terbaru, populer) | **MVP** | Core |
| Event page SEO + OG image | **MVP** | Growth engine — event harus bisa di-share |
| Google Event Schema JSON-LD | **MVP** | Free traffic dari Google |
| Sitemap dinamis | **MVP** | SEO fundamental |
| **NOTIFICATION** | | |
| Email lifecycle (7 template minimum) | **MVP** | Core |
| WhatsApp notifikasi | **MVP** | Indonesia = WA-first |
| Blast message organizer | **MVP** | Lihat di atas |
| In-app notification bell | **V2** | Nice to have |

### 3.2 Virtual Waiting Room — Penjelasan Detail

**Keputusan: Implement di MVP**, dengan catatan:
- Aktifkan hanya untuk event yang secara manual di-mark organizer sebagai "high demand"
- Untuk event kecil/sedang, tidak perlu — checkout langsung seperti biasa

**Mengapa MVP?** Kalau lo target konser, satu kali viral event tanpa Virtual Waiting Room → server crash, overselling, reputasi hancur. Biaya recovery jauh lebih mahal dari biaya build ini.

**Bagaimana cara kerjanya:**

```
User buka halaman event "on sale"
  ↓
Sistem cek: apakah event ini high_demand = true?
  ├── TIDAK → Langsung ke halaman checkout normal
  └── YA → User masuk Virtual Waiting Room
              ↓
         Redis ZADD waiting_room:{event_id} timestamp user_id
              ↓
         User lihat posisi antrian + estimasi waktu
              ↓
         Background job panggil user per batch (misal 50 user/menit)
              ↓
         User di-notify: "Giliran kamu! Selesaikan checkout dalam 10 menit"
              ↓
         Token checkout (Redis, TTL 10 menit) digenerate
              ↓
         User checkout → bayar → tiket
              ↓
         Jika user tidak checkout dalam 10 menit → slot hangus
         → user berikutnya di antrian dipanggil
```

**Implementasi teknis:**
- Redis Sorted Set sebagai queue: `ZADD waiting_room:{event_id} {timestamp} {user_id}`
- Polling dari client setiap 5 detik: `GET /events/:id/waiting-room/position`
- BullMQ job dispatcher memanggil batch user dari queue
- Token checkout: Redis key `checkout_token:{event_id}:{user_id}` TTL 10 menit

### 3.3 Payout Timing — Keputusan

**Rekomendasi: Model Hybrid**

| Fase | Berapa yang bisa ditarik | Alasan |
|---|---|---|
| Setelah event on-sale | 70% dari revenue terkumpul | Cash flow untuk organizer, cover marketing cost |
| Setelah event selesai | 30% sisa (ditahan sebagai buffer refund) | Protect platform dari refund klaim |
| H+7 setelah event | Sisa 30% cair otomatis | Jika tidak ada dispute |

Alasan model ini lebih baik dari "kapan saja 100%": platform punya buffer jika organizer membatalkan event mendadak dan harus refund semua buyer.

---

## 4. Database Design

### 4.1 Entity Relationship Diagram

```mermaid
erDiagram
    Users {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        string phone
        string avatar_url
        enum role "buyer|organizer|super_admin"
        boolean email_verified
        datetime email_verified_at
        boolean is_active
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }

    OrganizerProfiles {
        uuid id PK
        uuid user_id FK
        string brand_name
        string description
        string logo_url
        string website_url
        string instagram_url
        enum kyc_status "unverified|pending|verified|rejected"
        string ktp_url
        string npwp_url
        string bank_name
        string bank_account_number
        string bank_account_name
        datetime verified_at
        uuid verified_by FK
        datetime created_at
        datetime updated_at
    }

    OrganizerFollowers {
        uuid id PK
        uuid organizer_user_id FK
        uuid follower_user_id FK
        datetime created_at
    }

    EventCategories {
        uuid id PK
        string name
        string slug UK
        string icon_url
        boolean is_active
        integer sort_order
        datetime created_at
    }

    Events {
        uuid id PK
        uuid organizer_id FK
        uuid category_id FK
        string title
        string slug UK
        string description
        string banner_url
        enum event_type "offline|online|hybrid"
        string venue_name
        string venue_address
        string venue_city
        string venue_maps_url
        string online_url
        datetime starts_at
        datetime ends_at
        datetime sale_starts_at
        datetime sale_ends_at
        enum status "draft|published|on_sale|sold_out|completed|cancelled"
        enum visibility "public|private|unlisted"
        boolean is_high_demand
        boolean allow_attendance_list
        integer total_capacity
        string refund_policy
        decimal platform_fee_flat
        decimal platform_fee_percent
        datetime published_at
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }

    EventStaff {
        uuid id PK
        uuid event_id FK
        uuid user_id FK
        enum role "co_organizer|gate_scanner"
        json permissions
        uuid invited_by FK
        datetime accepted_at
        datetime created_at
    }

    TicketTypes {
        uuid id PK
        uuid event_id FK
        string name
        string description
        decimal price
        integer quota
        integer sold_count
        integer max_per_user
        boolean is_early_bird
        datetime early_bird_ends_at
        integer early_bird_quota
        boolean is_visible
        integer sort_order
        datetime sale_starts_at
        datetime sale_ends_at
        datetime created_at
        datetime updated_at
    }

    CustomFormFields {
        uuid id PK
        uuid event_id FK
        string label
        enum field_type "text|textarea|select|checkbox|radio"
        json options
        boolean is_required
        integer sort_order
        datetime created_at
    }

    PromoCodes {
        uuid id PK
        uuid event_id FK
        string code UK
        enum discount_type "flat|percent"
        decimal discount_value
        decimal max_discount_amount
        integer usage_limit
        integer used_count
        integer max_per_user
        datetime valid_from
        datetime valid_until
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    WaitingRoomQueues {
        uuid id PK
        uuid event_id FK
        uuid user_id FK
        string session_token
        integer queue_position
        enum status "waiting|called|checkout|expired"
        datetime called_at
        datetime checkout_expires_at
        datetime created_at
    }

    Orders {
        uuid id PK
        uuid event_id FK
        uuid user_id FK
        string guest_email
        string order_number UK
        enum status "pending|paid|cancelled|refunded|expired"
        decimal subtotal
        decimal platform_fee
        decimal payment_fee
        decimal total_amount
        uuid promo_code_id FK
        decimal discount_amount
        datetime expires_at
        datetime paid_at
        datetime cancelled_at
        string cancel_reason
        datetime created_at
        datetime updated_at
    }

    OrderItems {
        uuid id PK
        uuid order_id FK
        uuid ticket_type_id FK
        string ticket_type_name_snapshot
        decimal price_snapshot
        integer quantity
        decimal subtotal
        datetime created_at
    }

    CustomFormAnswers {
        uuid id PK
        uuid order_item_id FK
        uuid field_id FK
        string answer
        datetime created_at
    }

    Payments {
        uuid id PK
        uuid order_id FK
        string midtrans_transaction_id UK
        string payment_method
        decimal amount
        enum status "pending|settlement|deny|cancel|expire|fraud"
        json raw_webhook_payload
        datetime settled_at
        datetime created_at
        datetime updated_at
    }

    Tickets {
        uuid id PK
        uuid order_item_id FK
        uuid order_id FK
        uuid event_id FK
        string ticket_code UK
        string qr_data
        string qr_url
        enum status "active|used|cancelled"
        datetime used_at
        uuid scanned_by FK
        datetime created_at
        datetime updated_at
    }

    Wishlists {
        uuid id PK
        uuid user_id FK
        uuid event_id FK
        datetime created_at
    }

    Payouts {
        uuid id PK
        uuid organizer_id FK
        decimal amount
        string bank_name
        string bank_account_number
        string bank_account_name
        enum status "pending|processing|completed|failed"
        string transfer_proof_url
        string failure_reason
        uuid processed_by FK
        datetime processed_at
        datetime created_at
        datetime updated_at
    }

    AuditLogs {
        uuid id PK
        uuid user_id FK
        string action
        string entity_type
        uuid entity_id
        json old_data
        json new_data
        string ip_address
        string user_agent
        datetime created_at
    }

    Users ||--o| OrganizerProfiles : "has profile"
    Users ||--o{ OrganizerFollowers : "follows"
    Users ||--o{ Orders : "places"
    Users ||--o{ EventStaff : "assigned to"
    Users ||--o{ Wishlists : "has"
    Events ||--o{ TicketTypes : "has"
    Events ||--o{ EventStaff : "has team"
    Events ||--o{ Orders : "receives"
    Events ||--o{ CustomFormFields : "has"
    Events ||--o{ PromoCodes : "has"
    Events ||--o{ Tickets : "issues"
    Events ||--o{ WaitingRoomQueues : "has queue"
    Events }o--|| EventCategories : "belongs to"
    Orders ||--o{ OrderItems : "contains"
    Orders ||--o| Payments : "has payment"
    OrderItems ||--o{ Tickets : "generates"
    OrderItems ||--o{ CustomFormAnswers : "has answers"
    Tickets }o--o| Users : "scanned by"
```

### 4.2 Keputusan Desain Penting

**Mengapa `price_snapshot` di `OrderItems`?**  
Harga tiket bisa berubah setelah organizer edit. Kita harus menyimpan harga pada saat transaksi terjadi, bukan reference ke `TicketTypes.price` yang mutable. Ini juga kebutuhan audit dan akuntansi.

**Mengapa `qr_data` dan `qr_url` terpisah di `Tickets`?**  
`qr_data` = string yang di-encode ke QR (misal: UUID tiket + HMAC signature untuk verifikasi offline). `qr_url` = URL gambar QR yang sudah digenerate dan disimpan (CDN/storage) agar tidak perlu generate ulang setiap kali ditampilkan.

**Mengapa `raw_webhook_payload` disimpan di `Payments`?**  
Untuk audit trail lengkap dari Midtrans. Jika ada dispute, kita bisa reproduce timeline payment. Ini juga membantu debug jika ada webhook yang aneh.

**Mengapa `sold_count` di `TicketTypes` dan bukan hanya count dari `OrderItems`?**  
Performa. Query COUNT dari OrderItems akan makin lambat seiring volume. `sold_count` di-increment secara atomic bersamaan dengan stock decrement — ini yang mencegah overselling.

**Indexing Strategy:**

```sql
-- Untuk event discovery
CREATE INDEX idx_events_status_visibility ON events(status, visibility);
CREATE INDEX idx_events_category ON events(category_id);
CREATE INDEX idx_events_city ON events(venue_city);
CREATE INDEX idx_events_starts_at ON events(starts_at);
CREATE INDEX idx_events_slug ON events(slug);

-- Untuk order management
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_event ON orders(event_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_expires_at ON orders(expires_at) WHERE status = 'pending';

-- Untuk ticket scanning
CREATE INDEX idx_tickets_code ON tickets(ticket_code);
CREATE INDEX idx_tickets_event ON tickets(event_id);

-- Untuk waiting room
CREATE INDEX idx_waiting_room_event_status ON waiting_room_queues(event_id, status);

-- Untuk follower feed
CREATE INDEX idx_followers_organizer ON organizer_followers(organizer_user_id);
```

**Soft Delete Strategy:**  
Hanya `Users` dan `Events` menggunakan soft delete (`deleted_at`). Entitas transaksional seperti `Orders`, `Payments`, `Tickets` tidak pernah dihapus — hanya status yang berubah. Ini untuk kebutuhan audit dan compliance UU PDP.

---

## 5. API Design

### 5.1 Konvensi Global

**Base URL:** `https://api.domain.com/v1`

**Authentication:**
```
Authorization: Bearer {access_token}
```

**Format Response Sukses:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 150 }
}
```

**Format Response Error:**
```json
{
  "success": false,
  "code": "ERR_TICKET_SOLD_OUT",
  "message": "Tiket habis untuk tipe yang dipilih",
  "errors": [
    { "field": "ticket_type_id", "message": "Quota tiket Regular sudah habis" }
  ]
}
```

---

### 5.2 Auth Endpoints

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| POST | `/auth/register` | Public | Daftar akun baru |
| POST | `/auth/login` | Public | Login, return access + refresh token |
| POST | `/auth/refresh` | Public | Refresh access token |
| POST | `/auth/logout` | Bearer | Revoke refresh token |
| POST | `/auth/verify-email` | Public | Verifikasi email via token |
| POST | `/auth/resend-verification` | Public | Resend email verifikasi |
| POST | `/auth/forgot-password` | Public | Kirim link reset password |
| POST | `/auth/reset-password` | Public | Reset password via token |

**Contoh: POST /auth/login**

Request:
```json
{
  "email": "daffa@example.com",
  "password": "rahasia123"
}
```

Response (200):
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGci...",
    "refresh_token": "rt_abc123...",
    "expires_in": 900,
    "user": {
      "id": "uuid",
      "email": "daffa@example.com",
      "full_name": "Daffa",
      "role": "organizer",
      "avatar_url": "https://..."
    }
  }
}
```

---

### 5.3 Events Endpoints

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| GET | `/events` | Public | Listing event publik + filter + pagination |
| GET | `/events/:slug` | Public | Detail event |
| GET | `/events/categories` | Public | Semua kategori aktif |
| POST | `/events` | Organizer | Buat event baru |
| PUT | `/events/:id` | Organizer | Update event |
| DELETE | `/events/:id` | Organizer | Soft delete event (hanya jika belum ada penjualan) |
| POST | `/events/:id/publish` | Organizer | Publish event |
| POST | `/events/:id/cancel` | Organizer | Cancel event |
| GET | `/events/:id/attendees` | Organizer/Staff | Daftar attendee |
| GET | `/events/:id/stats` | Organizer | Statistik penjualan |
| POST | `/events/:id/staff` | Organizer | Invite event staff |
| DELETE | `/events/:id/staff/:userId` | Organizer | Remove event staff |

**Contoh: GET /events (dengan filter)**

Request:
```
GET /events?category=konser&city=Jakarta&date_from=2026-04-01&price_max=500000&sort=popular&page=1&limit=12
```

Response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Konser Malam Minggu",
      "slug": "konser-malam-minggu",
      "banner_url": "https://...",
      "organizer": {
        "id": "uuid",
        "brand_name": "EO Mantap",
        "is_verified": true
      },
      "venue_city": "Jakarta",
      "starts_at": "2026-05-10T19:00:00Z",
      "status": "on_sale",
      "min_price": 150000,
      "max_price": 500000,
      "is_sold_out": false
    }
  ],
  "meta": { "page": 1, "limit": 12, "total": 48 }
}
```

---

### 5.4 Ticket Types Endpoints

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| GET | `/events/:id/ticket-types` | Public | Daftar tipe tiket + stock sisa |
| POST | `/events/:id/ticket-types` | Organizer | Tambah tipe tiket |
| PUT | `/events/:id/ticket-types/:typeId` | Organizer | Update tipe tiket |
| DELETE | `/events/:id/ticket-types/:typeId` | Organizer | Hapus tipe tiket |

---

### 5.5 Promo Codes Endpoints

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| GET | `/events/:id/promo-codes` | Organizer | List promo codes per event |
| POST | `/events/:id/promo-codes` | Organizer | Buat promo code |
| PUT | `/events/:id/promo-codes/:codeId` | Organizer | Update / deactivate |
| POST | `/checkout/validate-promo` | Buyer | Validasi promo code saat checkout |

---

### 5.6 Waiting Room Endpoints

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| POST | `/events/:id/waiting-room/join` | Buyer/Guest | Masuk antrian |
| GET | `/events/:id/waiting-room/position` | Buyer/Guest | Cek posisi antrian (polling) |
| DELETE | `/events/:id/waiting-room/leave` | Buyer | Keluar antrian |

**Contoh: GET /events/:id/waiting-room/position**

Response (200):
```json
{
  "success": true,
  "data": {
    "status": "waiting",
    "position": 142,
    "estimated_wait_minutes": 14,
    "total_in_queue": 520
  }
}
```

Response saat dipanggil:
```json
{
  "success": true,
  "data": {
    "status": "called",
    "checkout_token": "ct_abc123xyz",
    "checkout_expires_at": "2026-05-10T20:15:00Z"
  }
}
```

---

### 5.7 Orders Endpoints

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| POST | `/orders` | Buyer/Guest | Buat order baru |
| GET | `/orders/:id` | Buyer | Detail order |
| GET | `/orders` | Buyer | My orders list |
| POST | `/orders/:id/cancel` | Buyer | Cancel order (jika masih pending) |

**Contoh: POST /orders**

Request:
```json
{
  "event_id": "uuid",
  "checkout_token": "ct_abc123xyz",
  "items": [
    {
      "ticket_type_id": "uuid",
      "quantity": 2,
      "form_answers": [
        { "field_id": "uuid", "answer": "Daffa" },
        { "field_id": "uuid", "answer": "M" }
      ]
    }
  ],
  "promo_code": "DISKON20",
  "guest_email": null
}
```

Response (201):
```json
{
  "success": true,
  "data": {
    "order_id": "uuid",
    "order_number": "TKT-20260510-001234",
    "status": "pending",
    "expires_at": "2026-05-10T20:30:00Z",
    "total_amount": 340000,
    "breakdown": {
      "subtotal": 300000,
      "platform_fee": 20000,
      "payment_fee": 5000,
      "discount": 60000,
      "total": 265000
    },
    "payment_url": "https://app.midtrans.com/snap/..."
  }
}
```

---

### 5.8 Payments Endpoints

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| POST | `/payments/webhook/midtrans` | Internal (sig) | Terima webhook Midtrans |
| GET | `/orders/:id/payment-status` | Buyer | Cek status payment |

---

### 5.9 Tickets Endpoints

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| GET | `/tickets` | Buyer | My tickets list |
| GET | `/tickets/:code` | Buyer | Detail tiket |
| GET | `/tickets/:code/qr` | Buyer | Ambil QR image URL |
| POST | `/tickets/resend` | Buyer/Guest | Resend tiket ke email |
| POST | `/tickets/:code/validate` | Scanner | Validasi tiket (scan) |

**Contoh: POST /tickets/:code/validate**

Response valid (200):
```json
{
  "success": true,
  "data": {
    "status": "valid",
    "ticket_code": "TKT-ABC123",
    "holder_name": "Daffa",
    "ticket_type": "VIP",
    "event_name": "Konser Malam Minggu",
    "event_date": "2026-05-10T19:00:00+07:00"
  }
}
```

Response sudah dipakai (200):
```json
{
  "success": false,
  "code": "ERR_TICKET_ALREADY_USED",
  "message": "Tiket ini sudah digunakan pada 20:05 WIB",
  "data": {
    "used_at": "2026-05-10T13:05:00Z"
  }
}
```

---

### 5.10 Payouts Endpoints

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| GET | `/payouts/balance` | Organizer | Saldo available vs on-hold |
| POST | `/payouts/request` | Organizer | Submit payout request |
| GET | `/payouts` | Organizer | History payout |
| GET | `/admin/payouts` | Admin | Semua payout request |
| POST | `/admin/payouts/:id/approve` | Admin | Approve payout |
| POST | `/admin/payouts/:id/reject` | Admin | Reject payout |

---

### 5.11 Social Endpoints

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| POST | `/organizers/:id/follow` | Buyer | Follow organizer |
| DELETE | `/organizers/:id/follow` | Buyer | Unfollow organizer |
| GET | `/events/:id/attendees/public` | Public | Lihat attendance list publik |
| POST | `/events/:id/wishlist` | Buyer | Tambah wishlist |
| DELETE | `/events/:id/wishlist` | Buyer | Hapus wishlist |

---

## 6. Business Logic Flows

### 6.1 Purchase Flow — Event Berbayar dengan Waiting Room

```
User buka halaman event (status: on_sale)
  ↓
Cek event.is_high_demand
  ├── TIDAK → Langsung ke step checkout (§6.2)
  └── YA
       ↓
  POST /events/:id/waiting-room/join
       ↓
  Redis: ZADD waiting_room:{event_id} {now_timestamp} {user_id}
       ↓
  Client polling GET /waiting-room/position setiap 5 detik
       ↓
  BullMQ job "dispatch-waiting-room" berjalan setiap 10 detik:
    - ZRANGE waiting_room:{event_id} 0 49 (ambil 50 user pertama)
    - Untuk setiap user: SET checkout_token:{event_id}:{user_id} TTL 600
    - ZREM user dari sorted set
    - Push notifikasi ke user: "Giliran kamu! 10 menit tersisa"
       ↓
  Client dapat response status: "called" + checkout_token
       ↓
  User lanjut ke checkout →→→ (§6.2 dari step POST /orders)
```

### 6.2 Purchase Flow — Event Berbayar Normal

```
User pilih ticket type + quantity
  ↓
[Jika ada promo code] → POST /checkout/validate-promo
  ↓
POST /orders (dengan checkout_token jika dari waiting room)
  ↓
Backend: validasi checkout_token (jika waiting room)
  ↓
BEGIN TRANSACTION:
  1. SELECT quota, sold_count FROM ticket_types WHERE id = ? FOR UPDATE
  2. Cek: quota - sold_count >= quantity yang dipesan?
     ├── TIDAK → ROLLBACK → Return ERR_TICKET_SOLD_OUT
     └── YA
  3. UPDATE ticket_types SET sold_count = sold_count + quantity
  4. INSERT INTO orders (status: pending, expires_at: now+15min)
  5. INSERT INTO order_items (price_snapshot dari ticket_type.price saat ini)
  6. [Jika promo] UPDATE promo_codes SET used_count = used_count + 1
COMMIT TRANSACTION
  ↓
Create Midtrans transaction via API → dapat payment_url
  ↓
Return order_id + expires_at + payment_url ke client
  ↓
Client redirect ke Midtrans payment page
  ↓
[User bayar]
  ↓
Midtrans kirim webhook ke POST /payments/webhook/midtrans
  ↓
Backend:
  1. Verifikasi HMAC-SHA512 signature dari Midtrans
  2. Cek idempotency: sudah pernah proses transaction_id ini?
     ├── YA → Return 200 (idempotent, ignore)
     └── TIDAK → lanjut
  3. Simpan raw_webhook_payload ke Payments
  4. Cek status webhook:
     ├── "settlement" / "capture" → goto PAID flow
     ├── "deny" / "cancel" / "expire" / "fraud" → goto FAILED flow
     └── "pending" → update payment status saja, tidak apa-apa

PAID FLOW:
  1. UPDATE orders SET status = 'paid', paid_at = now()
  2. UPDATE payments SET status = 'settlement', settled_at = now()
  3. Generate Tickets:
     - Untuk setiap OrderItem × quantity:
       INSERT INTO tickets (ticket_code: ULID, qr_data: sign(ticket_id+secret))
       Generate QR image → upload ke storage → simpan qr_url
  4. BullMQ: push job "send-ticket-notification" (email + WhatsApp)
  5. BullMQ: push job "update-event-status-if-sold-out"

FAILED FLOW:
  1. UPDATE orders SET status = 'cancelled' / 'expired'
  2. BEGIN TRANSACTION:
     UPDATE ticket_types SET sold_count = sold_count - quantity (rollback stock)
  COMMIT
  3. BullMQ: push job "send-payment-failed-notification"
```

### 6.3 Purchase Flow — Free Event

```
User pilih tiket gratis
  ↓
POST /orders (tanpa checkout_token, tanpa payment method)
  ↓
Backend:
  1. Validasi event.price = 0 untuk semua items
  2. BEGIN TRANSACTION:
     Decrement stock (sama seperti paid flow)
  3. INSERT orders (status: langsung 'paid', paid_at: now())
  4. Generate Tickets langsung
  COMMIT
  ↓
BullMQ: kirim tiket via email (tanpa langkah payment)
  ↓
Return order dengan tiket langsung terlampir
```

### 6.4 Virtual Waiting Room — Full Flow

```
Saat organizer publish event dengan is_high_demand = true:
  SET event_sale_active:{event_id} = true (Redis)

User membuka halaman event:
  GET /events/:slug
  Client melihat countdown "Penjualan mulai: 10 menit lagi"

Tepat saat sale_starts_at:
  BullMQ scheduled job: SET event:{id}:status = "on_sale"
  Organizer dashboard update via SSE

User klik "Beli Tiket":
  POST /events/:id/waiting-room/join
  Server: ZADD waiting_room:{event_id} {timestamp.now()} {user_id}
  Response: { position: 1423, estimated_wait: 28 }

Client polling setiap 5 detik:
  GET /events/:id/waiting-room/position
  Server: ZRANK waiting_room:{event_id} {user_id}

BullMQ "dispatch-waiting-room" job (interval 10 detik):
  total_available = SUM(quota - sold_count) dari semua ticket_types event ini
  Jika total_available <= 0: clear antrian, end
  batch_size = MIN(50, total_available × 1.2)  -- slight overbooking buffer
  users = ZPOPMIN waiting_room:{event_id} batch_size
  Untuk setiap user:
    SET checkout_token:{event_id}:{user_id} = random_token (TTL: 600 detik)
    Push notification: "Giliranmu! Selesaikan dalam 10 menit"

User dapat notifikasi, buka app:
  GET /waiting-room/position → status: "called", checkout_expires_at: ...
  User lanjut checkout dalam 10 menit

Jika user tidak checkout dalam 10 menit:
  checkout_token expired otomatis di Redis
  Slot masuk ke batch berikutnya untuk user antrian selanjutnya

Saat event sold out:
  BullMQ job deteksi sold_count >= quota untuk semua ticket_types
  Clear waiting_room Redis key
  UPDATE events SET status = 'sold_out'
  Push notifikasi ke semua yang masih antri: "Maaf, tiket habis"
```

### 6.5 Event Creation & Publish Flow

```
Organizer isi form event (status: draft, visibility: private by default)
  ↓
Save as draft → POST /events
  ↓
Organizer tambah TicketTypes + CustomFormFields + PromoCodes
  ↓
Organizer preview halaman event (unlisted, link khusus)
  ↓
Organizer klik "Publish":
  Validasi:
  - Minimal 1 TicketType aktif? ✓
  - Banner image ada? ✓
  - starts_at di masa depan? ✓
  - Organizer status verified? (jika event berbayar) ✓
    └── TIDAK verified → Return ERR_ORGANIZER_NOT_VERIFIED
  ↓
  UPDATE events SET status = 'published', published_at = now()
  ↓
  Jika sale_starts_at = null → langsung SET status = 'on_sale'
  Jika sale_starts_at ada → BullMQ scheduled job untuk auto-publish
  ↓
Admin notification: ada event baru untuk di-review (jika event berbayar)
  ↓
[Setelah admin approve jika diperlukan]:
  UPDATE events SET visibility = 'public'
  ↓
Event muncul di listing publik + sitemap diupdate
```

### 6.6 Gate Validation Flow

```
Gate Scanner buka /scanner (mobile web)
  ↓
Login (jika belum) → verifikasi role gate_scanner untuk event ini
  ↓
Pilih event yang akan di-scan
  ↓
Kamera aktif → scan QR Code
  ↓
Extract ticket_code dari QR data
  ↓
POST /tickets/:code/validate
  Server:
  1. SELECT * FROM tickets WHERE ticket_code = ? FOR UPDATE
  2. Cek event_id cocok dengan event yang sedang di-scan
  3. Cek status:
     ├── "cancelled" → Return ERR_TICKET_CANCELLED
     ├── "used" → Return ERR_TICKET_ALREADY_USED (+ waktu dipakai)
     └── "active"
          ↓
       UPDATE tickets SET status = 'used', used_at = now(), scanned_by = scanner_id
       COMMIT
          ↓
       Return 200 OK (nama holder, tipe tiket, event name)
  ↓
Scanner app tampilkan:
  ✓ HIJAU = Valid (nama + tipe tiket)
  ✗ MERAH = Invalid / Sudah Dipakai / Tiket Event Lain
  ↓
Real-time: increment counter di Redis
  INCR checkin_count:{event_id}
  ↓
Organizer check-in dashboard diupdate via SSE
```

### 6.7 Order Expiry Cleanup (Background Job)

```
BullMQ recurring job "cleanup-expired-orders" (interval: setiap 1 menit)
  ↓
SELECT * FROM orders
WHERE status = 'pending'
AND expires_at < now()
LIMIT 100
  ↓
Untuk setiap expired order:
  BEGIN TRANSACTION:
  1. UPDATE orders SET status = 'expired'
  2. Untuk setiap order_item:
     UPDATE ticket_types
     SET sold_count = sold_count - order_item.quantity
     WHERE id = order_item.ticket_type_id
  3. Jika ada promo_code_id:
     UPDATE promo_codes SET used_count = used_count - 1
  COMMIT
  ↓
Cek apakah event tadi status = 'sold_out'?
  └── YA → Cek total stock tersisa sekarang > 0?
       └── YA → UPDATE events SET status = 'on_sale'
                 Trigger waiting room dispatch jika ada antrian
  ↓
Log expired orders untuk analytics
```

### 6.8 Payout Request & Disbursement Flow

```
Organizer buka halaman Keuangan:
  GET /payouts/balance
  Response: {
    gross_sales: 15.000.000,
    platform_fee_deducted: 1.500.000,
    available_70_percent: 9.450.000,
    on_hold_30_percent: 4.050.000,
    released_after_event: 4.050.000 (jika H+7 sudah lewat)
  }
  ↓
Organizer submit payout:
  POST /payouts/request { amount: 9.450.000 }
  ↓
Backend:
  1. Validasi amount <= available balance
  2. Validasi organizer status = verified
  3. INSERT INTO payouts (status: pending)
  4. AuditLog: payout_requested
  ↓
Admin notifikasi: ada payout request baru
  ↓
Admin review di /admin/payouts:
  Cek: rekening bank valid? Amount masuk akal?
  ↓
POST /admin/payouts/:id/approve
  ↓
Backend:
  1. UPDATE payouts SET status = 'processing'
  2. Eksekusi transfer (manual bank transfer atau via Midtrans Iris API)
  3. Setelah konfirmasi transfer:
     UPDATE payouts SET status = 'completed', transfer_proof_url = ...
  4. BullMQ: push notifikasi ke organizer (email + WA)
  ↓
Organizer terima notifikasi: "Payout Rp 9.450.000 berhasil ditransfer"
```

### 6.9 Organizer Blast Message Flow

```
Organizer buka Attendee Dashboard → klik "Kirim Pesan"
  ↓
Isi form: judul pesan + isi pesan
  ↓
POST /events/:id/blast-message
  ↓
Backend:
  1. Validasi organizer adalah pemilik event
  2. Rate limit check: apakah organizer sudah kirim blast dalam 1 jam terakhir?
     └── YA → Return ERR_BLAST_RATE_LIMIT (1 blast per jam per event)
  3. Ambil semua buyer yang statusnya paid untuk event ini
     SELECT DISTINCT u.email FROM orders o
     JOIN users u ON o.user_id = u.id
     WHERE o.event_id = ? AND o.status = 'paid'
  4. BullMQ: batch job kirim email (max 50/detik, tidak spam Gmail)
  5. Log blast_message ke AuditLogs
  ↓
Job berjalan di background — organizer dapat notifikasi "Pesan terkirim ke N peserta"
```

---

## 7. Backend Structure

### 7.1 Struktur Folder Monolith (Elysia.js)

```
src/
├── index.ts                    # Entry point, setup Elysia app
├── config/
│   ├── database.ts             # Prisma client singleton
│   ├── redis.ts                # Redis client (ioredis)
│   ├── queue.ts                # BullMQ setup, semua queue definitions
│   ├── storage.ts              # S3/Cloudflare R2 client
│   ├── midtrans.ts             # Midtrans client config
│   └── env.ts                  # Zod schema validation untuk env vars
│
├── plugins/
│   ├── auth.plugin.ts          # JWT decode + user inject ke context
│   ├── rate-limit.plugin.ts    # Per-IP & per-user rate limiting
│   ├── cors.plugin.ts          # CORS whitelist
│   ├── logger.plugin.ts        # Request/response logging (pino)
│   └── error-handler.plugin.ts # Global error handler
│
├── middleware/
│   ├── require-auth.ts         # Guard: harus login
│   ├── require-role.ts         # Guard: cek role (organizer, admin, dll)
│   ├── require-event-staff.ts  # Guard: cek event-scoped permission
│   ├── require-verified.ts     # Guard: organizer harus verified
│   └── validate-webhook.ts     # Midtrans HMAC signature verification
│
├── modules/                    # Setiap domain = 1 folder
│   ├── auth/
│   │   ├── auth.routes.ts
│   │   ├── auth.service.ts
│   │   └── auth.schema.ts      # Elysia/TypeBox input schema
│   │
│   ├── events/
│   │   ├── events.routes.ts
│   │   ├── events.service.ts
│   │   ├── events.repository.ts
│   │   └── events.schema.ts
│   │
│   ├── ticket-types/
│   │   ├── ticket-types.routes.ts
│   │   ├── ticket-types.service.ts
│   │   └── ticket-types.schema.ts
│   │
│   ├── promo-codes/
│   │   ├── promo-codes.routes.ts
│   │   ├── promo-codes.service.ts
│   │   └── promo-codes.schema.ts
│   │
│   ├── waiting-room/
│   │   ├── waiting-room.routes.ts
│   │   ├── waiting-room.service.ts  # Redis queue operations
│   │   └── waiting-room.schema.ts
│   │
│   ├── orders/
│   │   ├── orders.routes.ts
│   │   ├── orders.service.ts        # Core checkout logic
│   │   ├── orders.repository.ts     # DB transactions
│   │   └── orders.schema.ts
│   │
│   ├── payments/
│   │   ├── payments.routes.ts
│   │   ├── payments.service.ts
│   │   ├── payments.webhook.ts      # Webhook handler (isolated)
│   │   └── payments.schema.ts
│   │
│   ├── tickets/
│   │   ├── tickets.routes.ts
│   │   ├── tickets.service.ts
│   │   ├── tickets.validator.ts     # QR scan logic
│   │   └── tickets.schema.ts
│   │
│   ├── payouts/
│   │   ├── payouts.routes.ts
│   │   ├── payouts.service.ts
│   │   └── payouts.schema.ts
│   │
│   ├── organizers/
│   │   ├── organizers.routes.ts
│   │   ├── organizers.service.ts
│   │   └── organizers.schema.ts
│   │
│   ├── notifications/
│   │   ├── email.service.ts         # Email templates + send
│   │   ├── whatsapp.service.ts      # WA via Fonnte
│   │   └── templates/
│   │       ├── ticket-confirmation.html
│   │       ├── payment-failed.html
│   │       ├── event-reminder.html
│   │       └── ...
│   │
│   └── admin/
│       ├── admin.routes.ts
│       ├── admin-events.service.ts
│       ├── admin-payouts.service.ts
│       └── admin-users.service.ts
│
├── jobs/                       # BullMQ Job Processors
│   ├── queue-registry.ts       # Daftarkan semua queue + worker
│   ├── send-ticket.job.ts      # Generate + kirim tiket setelah payment
│   ├── cleanup-orders.job.ts   # Expired order cleanup (recurring)
│   ├── dispatch-waiting-room.job.ts  # Panggil user dari queue
│   ├── send-event-reminder.job.ts    # H-3 & H-1 reminder
│   ├── auto-publish-event.job.ts     # Scheduled publish
│   ├── update-event-status.job.ts    # Sold out detection
│   └── process-payout.job.ts         # Payout disbursement
│
├── shared/
│   ├── errors/
│   │   ├── app-error.ts        # Base AppError class
│   │   └── error-codes.ts      # Semua ERR_CODE constants
│   ├── utils/
│   │   ├── qr-generator.ts     # QR Code generation
│   │   ├── ulid.ts             # ULID generator untuk ticket_code
│   │   ├── hmac.ts             # HMAC sign/verify untuk QR data
│   │   ├── pagination.ts       # Cursor/offset pagination helpers
│   │   └── price.ts            # Fee calculation logic
│   └── types/
│       └── context.ts          # Elysia context types
│
└── prisma/
    ├── schema.prisma
    ├── migrations/
    └── seed.ts
```

### 7.2 Plugin Architecture (Elysia)

```typescript
// src/index.ts
import { Elysia } from 'elysia'
import { authPlugin } from './plugins/auth.plugin'
import { rateLimitPlugin } from './plugins/rate-limit.plugin'
import { errorHandlerPlugin } from './plugins/error-handler.plugin'
import { authRoutes } from './modules/auth/auth.routes'
import { eventsRoutes } from './modules/events/events.routes'
// ... import semua routes

const app = new Elysia()
  .use(errorHandlerPlugin)
  .use(rateLimitPlugin)
  .use(corsPlugin)
  .use(loggerPlugin)
  .use(authPlugin)          // Decode JWT, inject user ke ctx (tidak block jika tidak ada token)
  .use(authRoutes)
  .use(eventsRoutes)
  .use(ordersRoutes)
  .use(paymentsRoutes)
  .use(ticketsRoutes)
  .use(payoutsRoutes)
  .use(adminRoutes)
  .listen(3000)
```

### 7.3 Service Layer Pattern

```typescript
// Contoh: orders.service.ts
export class OrdersService {
  constructor(
    private db: PrismaClient,
    private redis: Redis,
    private queue: Queue,
    private midtrans: MidtransClient,
    private priceUtil: PriceUtil
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto): Promise<CreateOrderResult> {
    // 1. Validasi waiting room token jika event high demand
    // 2. Kalkulasi harga + fee + promo
    // 3. DB transaction: decrement stock + insert order
    // 4. Create Midtrans transaction
    // 5. Return order + payment_url
  }
}

// Route hanya handling HTTP concern
// Service handling business logic
// Repository handling complex DB queries
```

---

## 8. Frontend Architecture

### 8.1 Semua Halaman

**Public Pages (Server Components, SEO-first):**

| Path | Deskripsi |
|---|---|
| `/` | Homepage: featured events, kategori, search bar |
| `/events` | Discovery listing: filter, search, pagination |
| `/events/[slug]` | Event detail + harga tiket + tombol beli |
| `/organizers/[id]` | Profil organizer + semua event-nya |
| `/categories/[slug]` | Event per kategori |
| `/search` | Hasil search full-text |

**Buyer Pages (Client Auth Required):**

| Path | Deskripsi |
|---|---|
| `/checkout/[eventId]` | Pilih tiket, isi form, input promo code |
| `/checkout/[eventId]/payment` | Redirect ke Midtrans atau tampil waiting |
| `/checkout/[eventId]/waiting-room` | Antrian virtual + posisi |
| `/orders` | Daftar semua orderku |
| `/orders/[id]` | Detail order + status payment |
| `/tickets` | Semua tiket yang dimiliki |
| `/tickets/[code]` | Detail tiket + QR Code |
| `/profile` | Edit profil |
| `/profile/following` | Organizer yang di-follow |
| `/profile/wishlist` | Event yang di-wishlist |
| `/auth/login` | Login |
| `/auth/register` | Register |

**Organizer Dashboard (`/dashboard/**`):**

| Path | Deskripsi |
|---|---|
| `/dashboard` | Overview: revenue, event aktif, penjualan |
| `/dashboard/events` | Daftar event yang dibuat |
| `/dashboard/events/new` | Form buat event baru |
| `/dashboard/events/[id]` | Edit event |
| `/dashboard/events/[id]/tickets` | Kelola ticket types |
| `/dashboard/events/[id]/promos` | Kelola promo codes |
| `/dashboard/events/[id]/attendees` | Attendee list + export |
| `/dashboard/events/[id]/checkin` | Real-time check-in dashboard |
| `/dashboard/events/[id]/staff` | Kelola event staff |
| `/dashboard/events/[id]/blast` | Kirim blast message |
| `/dashboard/finance` | Revenue + payout management |
| `/dashboard/profile` | Edit profil organizer + KYC |

**Gate Scanner (`/scan/**`):**

| Path | Deskripsi |
|---|---|
| `/scan` | Pilih event untuk di-scan |
| `/scan/[eventId]` | Interface scan QR Code (kamera) |
| `/scan/[eventId]/manual` | Manual input kode tiket |

**Admin Panel (`/admin/**`):**

| Path | Deskripsi |
|---|---|
| `/admin` | Dashboard platform: GMV, stats |
| `/admin/events` | Moderasi event (approve/reject/suspend) |
| `/admin/organizers` | Verifikasi organizer (KYC review) |
| `/admin/payouts` | Approve payout requests |
| `/admin/users` | User management |
| `/admin/config` | Platform fee, settings |

### 8.2 Server vs Client Component Strategy

| Kebutuhan | Pendekatan | Alasan |
|---|---|---|
| Event listing, event detail | Server Component | SEO-critical, data dari DB langsung |
| Discovery + filter | Server Component + URL params | Filter masuk ke URL, server fetch |
| Checkout form | Client Component | Interaktif, state lokal |
| Waiting room counter | Client Component + polling | Harus update real-time |
| Check-in dashboard | Client Component + SSE | Real-time counter |
| QR Scanner (kamera) | Client Component | Browser API (getUserMedia) |
| Revenue chart | Client Component + SWR | Data sensitif, auto-refresh |
| Auth forms | Client Component | Interaktif |
| OG image per event | `generateMetadata()` | Server, per event slug |

### 8.3 Data Fetching Strategy

```
Event detail page (/events/[slug]):
  → generateMetadata(): Server fetch untuk meta + JSON-LD
  → Server Component: fetch event + ticket types
  → Client Component (hydrate): real-time stock counter via SWR (interval 30s)

Checkout flow:
  → Server Action untuk submit order (bisa validasi server-side)
  → Client: optimistic UI untuk order expiry timer

Check-in dashboard (/dashboard/events/[id]/checkin):
  → Inisial data: Server Component
  → Real-time: EventSource (SSE) ke /events/:id/checkin/stream
  → Stream: server kirim event setiap ada scan masuk

Waiting room:
  → Client Component + polling setiap 5 detik ke /waiting-room/position
  → Saat status = "called": redirect ke checkout
```

### 8.4 Real-time Strategy

| Fitur | Teknologi | Alasan |
|---|---|---|
| Check-in dashboard | SSE (Server-Sent Events) | One-way stream dari server, cukup untuk counter. Lebih ringan dari WebSocket |
| Waiting room position | HTTP Polling (5 detik) | Lebih simple, latency 5 detik masih acceptable untuk antrian |
| Stock counter di event page | SWR polling (30 detik) | Tidak perlu sangat real-time |
| Scanner feedback (valid/invalid) | HTTP Request-Response | Instant feedback dari POST request sudah cukup |

> **Mengapa tidak WebSocket untuk semuanya?** WebSocket lebih kompleks untuk di-scale (butuh sticky session atau Redis pub/sub), dan manfaatnya tidak sebanding untuk use case ini. SSE + polling cukup untuk MVP.

### 8.5 SEO Implementation

```typescript
// app/events/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const event = await getEvent(params.slug)
  return {
    title: `${event.title} | Tiket Event`,
    description: event.description.substring(0, 160),
    openGraph: {
      title: event.title,
      description: event.description,
      images: [{ url: event.banner_url, width: 1200, height: 630 }],
      type: 'website',
    },
  }
}

// JSON-LD Schema untuk Google Event rich results
function EventSchema({ event }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "startDate": event.starts_at,
    "endDate": event.ends_at,
    "location": {
      "@type": "Place",
      "name": event.venue_name,
      "address": event.venue_address
    },
    "offers": {
      "@type": "Offer",
      "price": event.min_price,
      "priceCurrency": "IDR",
      "availability": event.is_sold_out
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock"
    },
    "organizer": {
      "@type": "Organization",
      "name": event.organizer.brand_name
    }
  }
  return <script type="application/ld+json">{JSON.stringify(schema)}</script>
}
```

### 8.6 Scanner Page — Mobile-First Design

```
/scan/[eventId] requirements:
- Orientasi: portrait dan landscape support
- Kamera: gunakan html5-qrcode atau ZXing library
- Feedback:
  ✓ HIJAU (fullscreen) = Valid — tampil 1.5 detik → auto ready untuk scan berikutnya
  ✗ MERAH (fullscreen) = Invalid / Sudah Dipakai
  ⚠ KUNING = Error jaringan, coba lagi
- Offline handling: jika tidak ada koneksi, tampil peringatan (QR validation butuh internet)
- Performance: feedback harus muncul < 500ms dari POST request selesai
```

---

## 9. Error Handling Standard

### 9.1 Format Error Response

Semua error menggunakan format ini (RFC 7807-inspired):

```json
{
  "success": false,
  "code": "ERR_TICKET_SOLD_OUT",
  "message": "Tiket yang dipilih sudah habis",
  "errors": [
    {
      "field": "ticket_type_id",
      "message": "Quota Regular sudah habis. Silakan pilih tipe tiket lain."
    }
  ],
  "request_id": "req_01J8X..."
}
```

- `code`: konstanta string yang bisa dipakai frontend untuk handle spesifik
- `message`: human-readable, dalam bahasa Indonesia
- `errors`: validasi per field (opsional, untuk 422)
- `request_id`: trace ID untuk debugging (dari logger)

### 9.2 HTTP Status Code Matrix

| Status | Kapan dipakai | Contoh |
|---|---|---|
| 200 | Request berhasil | GET, PUT sukses |
| 201 | Resource baru dibuat | POST /orders, POST /events |
| 204 | Berhasil, no content | DELETE |
| 400 | Input tidak valid (bukan validasi field) | Format date salah |
| 401 | Belum login / token expired | Akses endpoint protected |
| 403 | Login tapi tidak punya akses | Buyer akses organizer dashboard |
| 404 | Resource tidak ditemukan | Event slug tidak ada |
| 409 | Conflict (duplicate, race condition) | Double order sama event |
| 422 | Validasi input gagal (field-level) | Field required kosong |
| 429 | Rate limit exceeded | Terlalu banyak request |
| 500 | Internal server error | DB down, unhandled exception |

### 9.3 Elysia Global Error Handler

```typescript
// plugins/error-handler.plugin.ts
import { Elysia } from 'elysia'
import { AppError } from '../shared/errors/app-error'
import { logger } from '../config/logger'

export const errorHandlerPlugin = new Elysia()
  .onError(({ code, error, set, request }) => {
    const requestId = crypto.randomUUID()

    if (error instanceof AppError) {
      set.status = error.httpStatus
      return {
        success: false,
        code: error.code,
        message: error.message,
        errors: error.errors ?? undefined,
        request_id: requestId,
      }
    }

    if (code === 'VALIDATION') {
      set.status = 422
      return {
        success: false,
        code: 'ERR_VALIDATION',
        message: 'Input tidak valid',
        errors: error.all?.map(e => ({
          field: e.path?.replace('/', '') ?? 'unknown',
          message: e.message,
        })),
        request_id: requestId,
      }
    }

    if (code === 'NOT_FOUND') {
      set.status = 404
      return {
        success: false,
        code: 'ERR_NOT_FOUND',
        message: 'Resource tidak ditemukan',
        request_id: requestId,
      }
    }

    // Unhandled error — log dan return generic 500
    logger.error({ err: error, requestId, url: request.url }, 'Unhandled error')
    set.status = 500
    return {
      success: false,
      code: 'ERR_INTERNAL',
      message: 'Terjadi kesalahan sistem. Silakan coba lagi.',
      request_id: requestId,
    }
  })
```

### 9.4 Error Codes Registry

```typescript
// shared/errors/error-codes.ts
export const ErrorCodes = {
  // Auth
  ERR_INVALID_CREDENTIALS: { http: 401, msg: 'Email atau password salah' },
  ERR_EMAIL_NOT_VERIFIED: { http: 403, msg: 'Email belum diverifikasi' },
  ERR_TOKEN_EXPIRED: { http: 401, msg: 'Sesi telah berakhir, silakan login kembali' },

  // Events
  ERR_EVENT_NOT_FOUND: { http: 404, msg: 'Event tidak ditemukan' },
  ERR_EVENT_NOT_ON_SALE: { http: 409, msg: 'Event belum atau sudah tidak dalam masa penjualan' },
  ERR_ORGANIZER_NOT_VERIFIED: { http: 403, msg: 'Akun organizer belum terverifikasi untuk event berbayar' },

  // Tickets
  ERR_TICKET_SOLD_OUT: { http: 409, msg: 'Tiket habis' },
  ERR_PURCHASE_LIMIT_EXCEEDED: { http: 409, msg: 'Melebihi batas pembelian per user untuk event ini' },
  ERR_TICKET_NOT_FOUND: { http: 404, msg: 'Tiket tidak ditemukan' },
  ERR_TICKET_ALREADY_USED: { http: 409, msg: 'Tiket ini sudah digunakan' },
  ERR_TICKET_CANCELLED: { http: 409, msg: 'Tiket telah dibatalkan' },
  ERR_TICKET_WRONG_EVENT: { http: 409, msg: 'Tiket bukan untuk event ini' },

  // Orders
  ERR_ORDER_EXPIRED: { http: 409, msg: 'Waktu pembayaran telah habis' },

  // Promo
  ERR_PROMO_NOT_FOUND: { http: 404, msg: 'Kode promo tidak ditemukan' },
  ERR_PROMO_EXPIRED: { http: 409, msg: 'Kode promo sudah tidak berlaku' },
  ERR_PROMO_LIMIT_REACHED: { http: 409, msg: 'Kode promo sudah mencapai batas penggunaan' },

  // Waiting Room
  ERR_CHECKOUT_TOKEN_INVALID: { http: 403, msg: 'Token checkout tidak valid atau sudah expired' },
  ERR_BLAST_RATE_LIMIT: { http: 429, msg: 'Hanya bisa kirim blast 1 kali per jam' },

  // Payout
  ERR_INSUFFICIENT_BALANCE: { http: 409, msg: 'Saldo tidak mencukupi untuk penarikan' },
  ERR_PAYOUT_ALREADY_PENDING: { http: 409, msg: 'Sudah ada permintaan penarikan yang sedang diproses' },

  // Payment
  ERR_WEBHOOK_INVALID_SIGNATURE: { http: 403, msg: 'Signature webhook tidak valid' },
} as const
```

### 9.5 Logging Strategy

**Tool:** Pino (structured JSON logging)

| Level | Kapan | Contoh |
|---|---|---|
| `error` | Exception, DB error, unhandled | Prisma error, Midtrans API timeout |
| `warn` | Business logic aneh tapi handled | Webhook duplikat, stock mendekati 0 |
| `info` | Event penting | Order created, payment settled, payout processed |
| `debug` | Development only | Query params, response payload |

**Yang WAJIB dilog:**
- Setiap order created (order_id, user_id, event_id, amount)
- Setiap payment webhook diterima (transaction_id, status, signature valid/invalid)
- Setiap ticket validation (ticket_code, scanner_id, result)
- Setiap payout processed (payout_id, amount, organizer_id)
- Setiap auth failure dengan IP address
- Setiap rate limit hit

### 9.6 Midtrans Webhook Failure Handling

```
Midtrans mengirim webhook → backend gagal proses (500/timeout)
  ↓
Midtrans akan retry otomatis (biasanya 3–5 kali dalam interval berbeda)
  ↓
Untuk mencegah double processing:
  - Sebelum proses: SET nx midtrans_processing:{transaction_id} = 1 TTL 300 (Redis)
  - Jika SET gagal (key sudah ada) → return 200 langsung (idempotent)
  - Setelah proses selesai: simpan di DB dengan flag processed = true
  - Setiap webhook masuk: cek dulu di DB apakah transaction_id sudah ada
    └── Sudah → return 200, skip
    └── Belum → proses

Monitoring:
  - Alert jika order status 'pending' lebih dari 30 menit setelah payment_url dibuat
  - Manual reconciliation: cron job harian cek status ke Midtrans API
    untuk order yang pending > 1 jam
```

---

## 10. Edge Cases

### EC-01: War Tiket — 5.000 User Submit Checkout Bersamaan

**Skenario:** Konser besar, saat tiket release jam 10 pagi, 5.000 user klik beli dalam 1 menit.

**Solusi:**
1. Virtual Waiting Room aktif (event.is_high_demand = true) → user masuk Redis queue, tidak langsung hit DB
2. Dispatch job panggil 50 user per batch → hanya 50 transaksi DB concurrent, bukan 5.000
3. Di dalam transaksi DB: `SELECT ... FOR UPDATE` pada TicketTypes → hanya 1 yang berhasil jika stock = 1
4. Yang tidak dapat: tetap di queue, dapat giliran berikutnya atau notif sold out

### EC-02: Midtrans Webhook Duplikat

**Skenario:** Midtrans kirim webhook settlement 2x untuk transaction yang sama.

**Solusi:**
1. Cek `payments` table: apakah `midtrans_transaction_id` sudah ada dengan status `settlement`?
2. YA → return HTTP 200 langsung (acknowledge ke Midtrans, tapi tidak proses ulang)
3. Redis lock sebagai layer kedua: `SET NX midtrans_lock:{transaction_id}` TTL 60 detik

### EC-03: Stock Habis di Tengah Checkout

**Skenario:** User A dan User B sama-sama checkout Regular ticket terakhir dalam waktu bersamaan.

**Solusi:**
- `SELECT quota, sold_count FROM ticket_types WHERE id = ? FOR UPDATE` dalam transaction
- Hanya 1 yang berhasil mendapat lock → 1 berhasil, 1 lagi rollback
- User yang gagal: return `ERR_TICKET_SOLD_OUT` + saran pilih tipe tiket lain
- Dari sisi UX: stock counter di halaman event diupdate real-time (SWR polling)

### EC-04: Waiting Room — User Disconnect Sebelum Checkout

**Skenario:** User dipanggil dari waiting room, tapi disconnect sebelum checkout selesai.

**Solusi:**
- `checkout_token` di Redis punya TTL 10 menit
- Setelah TTL expired, slot hangus otomatis
- BullMQ dispatch job berikutnya akan panggil user selanjutnya dari queue
- Tidak ada stock yang ter-lock karena order belum dibuat (stock baru di-decrement saat `POST /orders`)

### EC-05: User Tutup Tab Sebelum Bayar (Order Pending Menggantung)

**Skenario:** Order sudah dibuat, stock sudah di-decrement, tapi user pergi.

**Solusi:**
- Order punya `expires_at` = now + 15 menit
- BullMQ recurring job `cleanup-expired-orders` jalan setiap 1 menit
- Jika `expires_at < now` dan status masih `pending` → update status `expired` + rollback `sold_count`
- Jika event tadi `sold_out`, cek apakah stock kembali tersedia → update status event ke `on_sale`

### EC-06: Organizer Edit Harga Tiket Setelah Ada Pembelian

**Skenario:** Regular ticket awalnya Rp 150.000, sudah ada 200 orang beli. Organizer ubah jadi Rp 200.000.

**Solusi:**
- `OrderItems.price_snapshot` menyimpan harga pada saat transaksi → tidak berubah
- Buyer yang sudah beli tetap bayar Rp 150.000 (sesuai snapshot)
- Buyer baru akan bayar Rp 200.000 (dari `TicketTypes.price` yang sudah diupdate)
- Frontend selalu fetch harga dari `ticket_types` endpoint, bukan dari cache
- `AuditLog` mencatat perubahan harga (old_data vs new_data)

### EC-07: Event Cancelled Setelah Sold Out — Mass Refund

**Skenario:** Konser 2.000 tiket semua terjual, lalu event dibatalkan 1 minggu sebelum hari H.

**Solusi:**
1. Organizer klik "Cancel Event" → konfirmasi: "Event ini akan dibatalkan dan semua buyer direfund"
2. UPDATE events SET status = 'cancelled'
3. BullMQ job "mass-refund-event": query semua `orders` dengan status `paid` untuk event ini
4. Untuk setiap order: panggil Midtrans Refund API
5. Setelah refund berhasil: UPDATE orders status = 'refunded', UPDATE tickets status = 'cancelled'
6. Kirim email + WA ke semua buyer: "Event dibatalkan, refund dalam 3-7 hari kerja"
7. Update saldo organizer: kurangi sebesar total yang sudah ditarik (jika model hybrid)
8. Alert admin jika organizer balance tidak cukup cover refund

### EC-08: QR Code Discan 2x

**Skenario:** Orang yang sama scan tiket 2x (coba masuk ulang atau tiket dishare).

**Solusi:**
- `SELECT ... FOR UPDATE` pada tickets row saat validasi
- Cek `tickets.status`: jika sudah `used` → return `ERR_TICKET_ALREADY_USED` + waktu kapan dipakai
- Scanner interface tampil merah: "Tiket ini sudah digunakan pukul 20:05 WIB"
- Log: siapa yang scan (scanner_id), kapan, dari mana

### EC-09: Guest Buyer Kehilangan Email Tiket

**Skenario:** Guest beli tanpa akun, email tiket masuk spam / terhapus, user panik.

**Solusi:**
- Endpoint publik: `POST /tickets/resend` dengan input `{ email, order_number }`
- Validasi: `orders.guest_email = email` AND `orders.order_number = order_number`
- Rate limit: maksimal 3 resend per email per jam (anti abuse)
- Kirim ulang semua tiket untuk order tersebut ke guest_email

### EC-10: Promo Code Race Condition (200 User Pakai Bersamaan, Limit 50)

**Skenario:** Organizer buat promo code DISKON50 dengan limit 50 pemakaian. 200 user pakai bersamaan.

**Solusi:**
1. Di `promo_codes` table: gunakan `usage_limit` dan `used_count`
2. Saat validasi promo: `SELECT * FROM promo_codes WHERE code = ? FOR UPDATE`
3. Cek: `used_count < usage_limit` → YA: `UPDATE promo_codes SET used_count = used_count + 1`
4. Jika used_count sudah = usage_limit → return `ERR_PROMO_LIMIT_REACHED`
5. Jika order gagal/expired setelah promo dipakai → rollback: `used_count = used_count - 1`
6. Alternatif lebih ringan: Redis atomic INCR untuk promo counter, sync ke DB async

### EC-11: Payout Gagal (Rekening Salah / Tutup)

**Skenario:** Admin approve payout, tapi transfer gagal karena nomor rekening organizer tidak valid.

**Solusi:**
1. UPDATE payouts SET status = 'failed', failure_reason = 'Nomor rekening tidak valid'
2. Kirim notifikasi ke organizer: "Payout gagal, silakan update data rekening bank"
3. Organizer update rekening di profil → submit payout request baru
4. Admin tidak perlu approve dari awal — ada flag `retry_from_payout_id` untuk audit trail

### EC-12: Bot Attack Pada Endpoint Checkout

**Skenario:** Bot spam POST /orders untuk memborong semua tiket (scalping otomatis).

**Solusi:**
1. Rate limit per IP: maksimal 5 order attempt per 10 menit
2. Rate limit per user: maksimal 3 aktif pending orders bersamaan
3. `per_user_limit` di TicketTypes: enforce di application layer
4. DB unique constraint: satu user tidak bisa punya 2 pending order untuk event yang sama
5. Virtual Waiting Room secara natural mencegah ini (semua user di-queue, bot tidak bisa bypass)
6. Honeypot field di checkout form: bot yang mengisi field hidden → flag sebagai suspicious
7. Velocity check: jika 1 IP buat > 3 order dalam 1 menit → temporary block

---

## 11. Scalability Roadmap

### Phase 1: Short-term (0–6 Bulan) — Optimasi Monolith

**Tujuan:** Pastikan platform stabil untuk event 1.000–5.000 concurrent users.

- [ ] **Database indexing audit** — jalankan `EXPLAIN ANALYZE` pada semua query utama, tambah index yang kurang
- [ ] **Connection pooling** — gunakan PgBouncer di depan PostgreSQL untuk manage koneksi
- [ ] **Redis caching** — cache event detail (TTL 60 detik), stock counter, category list
- [ ] **Image optimization** — upload banner ke Cloudflare R2 + Cloudflare Images untuk resize otomatis
- [ ] **Monitoring** — setup Grafana + Prometheus atau pakai Highlight.io untuk error tracking
- [ ] **Load testing** — test dengan k6 untuk simulasi 1.000 user concurrent di checkout
- [ ] **Background job scaling** — BullMQ dengan multiple workers untuk job processing paralel
- [ ] **Virtual Waiting Room tuning** — kalibrasi batch size dan dispatch interval berdasarkan load test

### Phase 2: Mid-term (6–18 Bulan) — Horizontal Scaling

**Tujuan:** Support event 10.000–50.000 concurrent users (konser nasional).

- [ ] **Full-text search** — migrasi dari PostgreSQL ILIKE ke **Meilisearch** atau **Typesense** untuk discovery yang lebih cepat dan relevan
- [ ] **CDN untuk QR Code & banner** — semua asset statis via Cloudflare CDN, tidak hit server
- [ ] **Read replica PostgreSQL** — pisahkan read traffic (listing, search) ke replica, write tetap ke primary
- [ ] **Queue sharding** — pisahkan BullMQ queue per domain (email queue, ticket queue, waiting room queue) dengan dedicated workers
- [ ] **Containerisasi & orchestration** — Docker + Kubernetes (atau simpler: Fly.io / Railway) untuk scale horizontal
- [ ] **Feature flags** — implement feature toggle (misal: LaunchDarkly atau Unleash) untuk safe rollout fitur baru
- [ ] **Embed widget** — implement JS embed widget untuk organizer jual tiket di website sendiri
- [ ] **On-site POS** — tablet-based kasir untuk jual tiket di venue fisik
- [ ] **Organizer tier premium** — monetisasi tambahan: enterprise plan dengan SLA + dedicated support

### Phase 3: Long-term (18 Bulan+) — Platform Scale

**Tujuan:** Support jutaan transaksi per bulan, ekosistem platform.

- [ ] **Service extraction** — ekstrak service yang paling heavy: Ticketing Service, Payment Service, Notification Service menjadi microservice terpisah jika monolith sudah bottleneck
- [ ] **Event streaming** — Apache Kafka atau Redpanda untuk event sourcing (semua perubahan state → event stream untuk analytics, audit, downstream services)
- [ ] **Elasticsearch** — untuk analytics organizer yang advanced (faceted search, aggregasi kompleks)
- [ ] **Cashless wristband ecosystem** — RFID wristband untuk event besar: top-up saldo, transaksi F&B di venue, tracking movement (sesuai standar Goers/Yesplis yang sudah ada ini)
- [ ] **Mobile app native** — React Native atau Flutter untuk buyer app (tiket offline, push notification, Apple/Google Wallet integration)
- [ ] **Marketplace expansion** — tiket atraksi wisata (jika demand ada) sebagai kategori terpisah
- [ ] **API publik untuk organizer** — REST API yang bisa diintegrasikan ke sistem pihak ketiga (website organizer, CRM mereka)
- [ ] **ML recommendation engine** — "Event yang mungkin kamu suka" berdasarkan history pembelian dan follow organizer

---

## Appendix

### A. Kategori Event (Rekomendasi Struktur)

```
Musik & Hiburan
  ├── Konser
  ├── Festival Musik
  ├── Stand-up Comedy
  └── Pertunjukan Seni

Pendidikan & Profesional
  ├── Seminar
  ├── Workshop
  ├── Kelas & Kursus
  └── Konferensi

Olahraga & Kebugaran
  ├── Lari / Marathon
  ├── Turnamen
  └── Fitness Event

Komunitas & Sosial
  ├── Gathering
  ├── Meetup
  └── Festival Kuliner

Seni & Budaya
  ├── Pameran Seni
  ├── Festival Budaya
  └── Film Screening

Bisnis & Startup
  ├── Networking
  ├── Pitch Competition
  └── Expo / Pameran
```

### B. Struktur Platform Fee (Rekomendasi Model)

| Model | Cara | Cocok untuk |
|---|---|---|
| Buyer-side fee | Buyer bayar harga tiket + service fee on top | Organizer senang (harga bersih), buyer agak kaget |
| Organizer-side fee | Platform potong % dari revenue organizer | Buyer senang (harga yang tertera = yang dibayar) |
| Split fee | Sebagian dari buyer, sebagian dari organizer | Balance, tapi kalkulasi lebih kompleks |

**Rekomendasi MVP:** Buyer-side fee yang transparan ditampilkan di checkout. Flat Rp 5.000–10.000 per tiket + payment fee sesuai metode (VA: Rp 4.000, QRIS: 0.7%, CC: 2.9%). Ini paling mudah diimplementasi dan paling transparan.

### C. Environment Variables yang Dibutuhkan

```env
# App
NODE_ENV=production
PORT=3000
JWT_SECRET=
JWT_REFRESH_SECRET=
APP_URL=https://domain.com
API_URL=https://api.domain.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Redis
REDIS_URL=redis://host:6379

# Midtrans
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_WEBHOOK_KEY=

# Storage (Cloudflare R2 atau AWS S3)
STORAGE_ENDPOINT=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_BUCKET=
STORAGE_PUBLIC_URL=

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=noreply@domain.com

# WhatsApp (Fonnte)
FONNTE_API_KEY=

# QR Code signing
QR_HMAC_SECRET=
```

---

*Dokumen ini adalah blueprint living document. Update sesuai perkembangan sistem.*  
*Disiapkan untuk: Daffascript — Ticketing Platform Project*  
*Versi: 1.0.0 | 27 Maret 2026*
