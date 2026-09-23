# Spec Migrasi Backend: Firebase → Node.js/Express + PostgreSQL

**Project:** Laundry App (laundry-backend)
**Status:** Draft requirement — belum ada kode yang ditulis
**Dibuat:** 5 September 2026

---

## 1. Konteks & Constraints

### 1.1 Kondisi saat ini
- Backend sudah fully scaffolded di Firebase: Firestore rules, Storage rules, indexes, Cloud Functions (state machine order, assignment kurir, FCM push, webhook Midtrans dengan validasi SHA-512, scheduled daily revenue report).
- Tiga klien sudah eksis dan bergantung pada Firebase SDK secara langsung: `laundry-customer-app` (Flutter), `laundry-courier-app` (Flutter), `laundry-admin-dashboard` (Next.js).
- ERD sudah didefinisikan dan **sudah berbentuk relasional** — ini jadi basis langsung untuk schema Postgres.

### 1.2 Constraints
- Solo developer, portfolio-scale project, target selesai tanpa tim ops dedicated.
- Familiar dengan SQL, TypeScript, Java 8, Python 2 — belum berpengalaman dengan ORM Node.js modern (Prisma/Drizzle) atau Socket.io.
- Environment: Windows, VS Code, Node 18.
- Tiga klien (2 Flutter + 1 Next.js) **wajib direfactor** karena migrasi ini bukan cuma ganti database, tapi ganti seluruh cara klien bicara ke backend (SDK langsung → REST/WebSocket API).

### 1.3 Non-functional requirements
- Response time API standar < 300ms di kondisi normal (bukan sistem skala besar, jadi tidak perlu load balancing dari awal).
- Availability: cukup single instance untuk tahap portfolio, tapi desain harus tidak menutup opsi horizontal scaling nanti.
- Cost: prioritaskan opsi gratis/murah untuk hosting Postgres (Supabase, Neon, atau Railway free tier).

---

## 2. Arsitektur Tingkat Tinggi

```
┌─────────────────┐   ┌─────────────────┐   ┌──────────────────────┐
│ customer-app     │   │ courier-app      │   │ admin-dashboard       │
│ (Flutter)         │   │ (Flutter)         │   │ (Next.js)              │
└────────┬─────────┘   └────────┬─────────┘   └──────────┬───────────┘
         │  HTTPS (REST)  + WebSocket (Socket.io)          │
         └───────────────────────┬──────────────────────────┘
                                  ▼
                    ┌───────────────────────────┐
                    │  Express API (Node 18, TS)  │
                    │  - Auth middleware (JWT)     │
                    │  - Role-based route guards   │
                    │  - REST controllers          │
                    │  - Socket.io gateway          │
                    │  - node-cron (scheduled jobs) │
                    └──────────────┬────────────────┘
                                   │
              ┌────────────────────┼─────────────────────┐
              ▼                    ▼                       ▼
     ┌─────────────────┐  ┌────────────────┐   ┌───────────────────┐
     │ PostgreSQL        │  │ S3 / Cloudinary  │   │ Midtrans webhook    │
     │ (Prisma ORM)        │  │ (foto bukti)       │   │ (payment gateway)     │
     └─────────────────┘  └────────────────┘   └───────────────────┘
```

Prinsip kunci: **tidak ada klien yang bicara langsung ke database.** Semua lewat Express API — ini menggantikan peran Firestore Security Rules yang sebelumnya jadi lapisan proteksi.

---

## 3. Data Model (mapping dari ERD existing)

Skema di bawah ini menerjemahkan langsung dari `laundry_erd_users.html` dan `laundry_erd_orders.html`.

```sql
-- users
CREATE TYPE user_role AS ENUM ('customer', 'courier', 'admin');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  fcm_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- addresses
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  full_address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false
);

-- couriers
CREATE TABLE couriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_available BOOLEAN NOT NULL DEFAULT false,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  last_active_at TIMESTAMPTZ
);

-- orders
CREATE TYPE order_status AS ENUM (
  'pending', 'picked_up', 'washing', 'done', 'delivering', 'delivered', 'cancelled'
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id),
  courier_id UUID REFERENCES users(id),
  status order_status NOT NULL DEFAULT 'pending',
  pickup_address TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  total_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  proof_photo_url TEXT,
  scheduled_pickup_at TIMESTAMPTZ,
  estimated_done_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- order_items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  weight_kg NUMERIC(6,2) NOT NULL,
  price_per_kg NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL
);

-- payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  amount NUMERIC(12,2) NOT NULL,
  paid_at TIMESTAMPTZ
);

-- notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- index yang jelas dibutuhkan berdasarkan pola akses di CLAUDE.md
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_courier ON orders(courier_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_couriers_available ON couriers(is_available);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
```

**Catatan desain:** state `cancelled` ditambahkan eksplisit ke enum `order_status` (sebelumnya cuma disebut di narasi CLAUDE.md, tidak ada di ERD field `status` yang cuma `string`). Postgres enum akan menegakkan constraint ini di level database, sesuatu yang Firestore tidak bisa lakukan secara native.

---

## 4. API Design (menggantikan Cloud Functions)

| Cloud Function lama | Endpoint REST baru | Auth |
|---|---|---|
| `updateOrderStatus` | `PATCH /api/orders/:id/status` | customer (cancel saja), courier (assigned order saja), admin (semua) |
| Courier assignment logic | `POST /api/orders/:id/assign` | admin only |
| Midtrans webhook | `POST /api/payments/webhook` | signature validation (bukan JWT) |
| Scheduled daily revenue report | `node-cron` job internal, hasil disimpan ke tabel `reports` atau dikirim email | tidak ada endpoint publik |
| FCM push trigger | Dipanggil dari dalam service layer setelah write sukses (bukan Firestore trigger) | internal |

Endpoint pendukung lain yang perlu ditambahkan (tidak eksplisit di Cloud Functions lama tapi wajib ada di REST API):
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`
- `GET /api/orders`, `GET /api/orders/:id`, `POST /api/orders`
- `GET /api/couriers?available=true`
- `POST /api/orders/:id/proof-photo`
- `GET /api/notifications`, `PATCH /api/notifications/:id/read`

---

## 5. Realtime Strategy

Firestore `onSnapshot` diganti Socket.io dengan pola room-based:

- Customer join room `order:{orderId}` saat membuka tracking screen.
- Admin dashboard join room `orders:all` untuk melihat semua order masuk.
- Courier join room `courier:{courierId}` untuk notifikasi order baru yang di-assign.
- Setiap kali status order berubah lewat `PATCH /api/orders/:id/status`, service layer emit event ke room terkait **setelah** transaksi database commit — bukan sebelum, untuk menghindari race condition antara klien dan DB state.

---

## 6. Requirements (Format EARS)

### 6.1 Autentikasi & Otorisasi

**REQ-AUTH-01 (Ubiquitous)**
The system shall store user passwords as bcrypt hashes with a minimum cost factor of 10.

**REQ-AUTH-02 (Event-driven)**
When a user submits valid email and password to `POST /api/auth/login`, the system shall issue a JWT access token (expiry 15 minutes) and a refresh token (expiry 7 days).

**REQ-AUTH-03 (Event-driven)**
When a request is made to any `/api/*` route except `/api/auth/*` and `/api/payments/webhook`, the system shall reject the request with HTTP 401 if no valid JWT is present in the Authorization header.

**REQ-AUTH-04 (State-driven)**
While a user's role is not `admin`, the system shall reject any request to admin-only endpoints with HTTP 403.

**REQ-AUTH-05 (Unwanted behavior)**
If a JWT refresh token has been revoked or expired, then the system shall reject the refresh request with HTTP 401 and require full re-login.

### 6.2 Order State Machine

**REQ-ORDER-01 (Ubiquitous)**
The system shall enforce the order status transition sequence: `pending → picked_up → washing → done → delivering → delivered`, with `cancelled` reachable only from `pending` or `picked_up`.

**REQ-ORDER-02 (Unwanted behavior)**
If a status update request specifies a transition not permitted by REQ-ORDER-01, then the system shall reject the request with HTTP 400 and shall not modify the order record.

**REQ-ORDER-03 (Event-driven)**
When an order's status changes successfully, the system shall create a notification record for the order's customer and emit a `order:status_changed` event to the Socket.io room `order:{orderId}`.

**REQ-ORDER-04 (Event-driven)**
When a courier submits a status update for an order, the system shall verify that `orders.courier_id` matches the authenticated courier's user id before applying the change.

**REQ-ORDER-05 (Complex)**
Where an order transitions to `picked_up`, `delivering`, or `delivered`, the system shall require an accompanying `proof_photo_url` before accepting the transition.

### 6.3 Courier Assignment

**REQ-COURIER-01 (Event-driven)**
When an admin assigns a courier to an order via `POST /api/orders/:id/assign`, the system shall verify the target courier has `is_available = true` before completing the assignment.

**REQ-COURIER-02 (Event-driven)**
When a courier is assigned to an order, the system shall update `orders.courier_id`, set `orders.status = 'picked_up'` only if the current status is `pending`, and emit a push notification to the courier's device via FCM.

**REQ-COURIER-03 (State-driven)**
While a courier's `is_available` field is `false`, the system shall exclude that courier from the assignable-courier list returned by `GET /api/couriers?available=true`.

### 6.4 Payment (Midtrans Webhook)

**REQ-PAY-01 (Ubiquitous)**
The system shall validate every incoming Midtrans webhook request using SHA-512 signature verification before processing the payload.

**REQ-PAY-02 (Unwanted behavior)**
If the SHA-512 signature validation fails, then the system shall reject the webhook with HTTP 401 and shall not modify any payment or order record.

**REQ-PAY-03 (Event-driven)**
When a valid webhook confirms a successful payment, the system shall update the corresponding `payments.status` to `paid`, set `paid_at` to the current timestamp, and update `orders.payment_status` accordingly.

**REQ-PAY-04 (Complex)**
Where a webhook is received for a `transaction_id` that has already been marked `paid`, the system shall treat the event as idempotent and shall not create duplicate payment records or duplicate notifications.

### 6.5 Realtime & Notifications

**REQ-RT-01 (Event-driven)**
When a client establishes a Socket.io connection, the system shall authenticate the connection using the JWT access token before allowing room joins.

**REQ-RT-02 (Event-driven)**
When an order status changes, the system shall emit the update to Socket.io rooms only after the corresponding database transaction has committed successfully.

**REQ-RT-03 (Optional feature)**
Where a client's Socket.io connection is unavailable, the system shall still deliver order status changes via FCM push notification as a fallback channel.

### 6.6 Scheduled Reporting

**REQ-REPORT-01 (Ubiquitous)**
The system shall run a daily scheduled job at 23:59 local time (Asia/Jakarta) that aggregates total revenue and order count for the current day.

**REQ-REPORT-02 (Event-driven)**
When the daily report job completes, the system shall persist the result to a `daily_reports` table and shall not block the main API event loop during aggregation.

### 6.7 File Upload

**REQ-FILE-01 (Ubiquitous)**
The system shall compress and validate uploaded proof photos to a maximum of 2MB before storing them in object storage.

**REQ-FILE-02 (Unwanted behavior)**
If an uploaded file exceeds 10MB or is not an image MIME type, then the system shall reject the upload with HTTP 400 before any storage write occurs.

### 6.8 Data Migration (Firestore → Postgres, jika ada data lama)

**REQ-MIGRATE-01 (Ubiquitous)**
Where existing Firestore data exists at migration time, the system shall provide a one-time migration script that maps each Firestore document to its corresponding Postgres row, preserving original `createdAt` timestamps.

**REQ-MIGRATE-02 (Event-driven)**
When the migration script encounters a document missing a required relational field (e.g., an order referencing a deleted user), the system shall log the discrepancy to a report file rather than halting the entire migration.

---

## 7. Trade-off yang Perlu Disadari

| Aspek | Firebase (sebelumnya) | Postgres + Express (baru) | Trade-off |
|---|---|---|---|
| Realtime | Native (`onSnapshot`) | Manual (Socket.io) | Lebih banyak kode, tapi lebih terkontrol dan bisa di-debug |
| Otorisasi | Declarative (security rules) | Imperative (middleware) | Lebih verbose, tapi logic-nya jadi lebih eksplisit & testable |
| Skalabilitas awal | Auto-scale | Perlu setup manual (connection pooling, dsb.) | Untuk skala portfolio ini tidak masalah |
| Integritas data | Schema-less, validasi di kode | Schema-enforced di level DB | Migrasi ini justru **lebih ketat**, bagus untuk showcase skill |
| Kompleksitas ops | Rendah (managed) | Sedang (perlu kelola migration, connection, backup) | Trade-off yang wajar untuk portfolio backend engineering |

## 8. Yang Perlu Direvisit Seiring Pertumbuhan
- Connection pooling (PgBouncer) kalau nanti ada concurrent user lebih dari puluhan.
- Read replica Postgres kalau query reporting mulai membebani write path.
- Pindah dari polling FCM fallback ke queue (BullMQ/Redis) kalau volume notifikasi bertambah signifikan.

---

## 9. Langkah Migrasi yang Disarankan (Urutan Fase)

1. **Fase 1 — Schema & ORM**: Setup Postgres (Supabase/Neon/Railway), tulis schema Prisma dari mapping di bagian 3, jalankan migration awal.
2. **Fase 2 — Auth & Core API**: Implementasi JWT auth, endpoint `users`, `addresses`, dasar `orders` CRUD sesuai REQ-AUTH-* dan REQ-ORDER-*.
3. **Fase 3 — Business Logic**: Implementasi state machine, courier assignment, webhook Midtrans sesuai REQ-ORDER-*, REQ-COURIER-*, REQ-PAY-*.
4. **Fase 4 — Realtime**: Setup Socket.io gateway, integrasi ke service layer sesuai REQ-RT-*.
5. **Fase 5 — Client Refactor**: Update `laundry-customer-app`, `laundry-courier-app` (ganti Firebase SDK → `dio` + `socket_io_client`), `laundry-admin-dashboard` (ganti `onSnapshot` → socket listener).
6. **Fase 6 — Reporting & Cleanup**: Implementasi scheduled job, migration script data lama (jika perlu), decommission Firebase.

