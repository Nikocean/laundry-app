# Admin Dashboard — E2E Test Plan

Sumber kebenaran untuk suite Playwright pada `apps/admin-dashboard`.  
Hanya mencakup fitur yang **sudah shipped** di kode (bukan spek prototype / EARS penuh).

Terakhir diselaraskan dengan: login BFF, middleware JWT admin, `/` Overview scaffold, `/orders` (REST + Socket.io), assign kurir pada order `pending`.

## Scope

| In scope | Out of scope (belum ada UI / belum E2E) |
|---|---|
| Login & logout admin | Kanban board, POS offline, laporan keuangan |
| Proteksi route (middleware) | Halaman customers / couriers CRUD |
| Daftar order + filter status / customerId | Update status cucian dari dashboard |
| Live indicator Socket.io | Prototype (`apps/prototype`) |
| Assign kurir ke order `pending` | Flutter customer / courier (bukan Playwright) |

Referensi spek produk (bukan acceptance E2E saat ini): `REQ-ADM-*` di `apps/prototype/src/docs/ears-spec.ts`.  
Catatan penting vs EARS: assign dari admin pada order `pending` mengubah status menjadi **`picked_up`** (lihat `assignCourier` di backend), bukan langsung `delivering`.

## Prerequisites

Jalankan dari root monorepo:

1. Backend: `npm run dev:backend` → `http://localhost:3000`
2. Admin: `npm run dev:admin` → `http://localhost:3001`
3. Env admin (`apps/admin-dashboard/.env.local`, lihat `.env.example`):
   - `BACKEND_URL=http://localhost:3000`
   - `JWT_ACCESS_SECRET` **sama** dengan backend
   - `NEXT_PUBLIC_SOCKET_URL=http://localhost:3000`
4. PostgreSQL tersedia sesuai `DATABASE_URL` backend; migrasi Prisma sudah diterapkan.

Playwright (saat di-setup) sebaiknya memakai `baseURL: http://localhost:3001` dan `webServer` / pre-start untuk backend + admin.

## Test data

Tidak ada seed script di repo. Siapkan data E2E secara eksplisit (Prisma Studio, SQL, atau API).

| Entitas | Cara buat | Catatan |
|---|---|---|
| Admin user | Insert DB (`users.role = admin`) | `POST /api/auth/register` **menolak** `role: admin` |
| Customer | `POST /api/auth/register` (default role) | Dibutuhkan untuk membuat order |
| Courier | Register `role: courier` lalu set `couriers.isAvailable = true` | List assign hanya kurir available |
| Order `pending` | `POST /api/orders` sebagai customer | Tombol **Assign** hanya tampil jika `status === pending` |
| Order non-pending | Update status via API / DB | Untuk assert tombol Assign tidak muncul |

Simpan kredensial tes di env lokal CI/dev saja, misalnya:

```env
E2E_ADMIN_EMAIL=
E2E_ADMIN_PASSWORD=
E2E_CUSTOMER_ID=          # opsional, untuk filter
E2E_PENDING_ORDER_ID=     # opsional
```

Jangan commit password / secret ke git.

## Selector contract (disarankan)

UI sekarang mengandalkan label / role. Untuk suite stabil, tambahkan `data-testid` saat implement Playwright (atau sebelumnya):

| Area | Selector sekarang | `data-testid` disarankan |
|---|---|---|
| Login form | `#email`, `#password`, button “Sign in” | `login-email`, `login-password`, `login-submit` |
| Login error | `role="alert"` | `login-error` |
| Nav | Link “Overview”, “Orders” | `nav-overview`, `nav-orders` |
| Sign out | Button “Sign out” | `nav-sign-out` |
| Status filter | `#status-filter` | `orders-status-filter` |
| Customer filter | `#customer-filter` | `orders-customer-filter` |
| Live socket | teks “Live: …” | `orders-socket-state` |
| Assign open | Button “Assign” per row | `order-assign-{orderId}` atau `order-row-{id}` + Assign |
| Assign dialog | `role="dialog"`, `#courier-select` | `assign-dialog`, `assign-courier-select`, `assign-submit` |

Prioritas locator Playwright: `getByRole` / `getByLabel` dulu; `data-testid` untuk row dinamis.

## Critical journeys

### A1 — Login sukses

**Given** user `role=admin` valid  
**When** submit email + password di `/login`  
**Then** redirect ke `/` (atau `?next=`), cookie httpOnly ter-set, sidebar “Admin” terlihat

### A2 — Login gagal (kredensial salah)

**When** password salah  
**Then** tetap di `/login`, `role="alert"` menampilkan pesan error, tidak masuk dashboard

### A3 — Login non-admin ditolak

**Given** akun `customer` atau `courier`  
**When** login via form admin  
**Then** status 403 path BFF → pesan seperti “Admin role required”, tidak ada session admin

### A4 — Proteksi route

**Given** belum login  
**When** buka `/orders`  
**Then** redirect ke `/login?next=%2Forders`  
**And** setelah login sukses, land di `/orders`

### A5 — Logout

**Given** sudah login  
**When** klik “Sign out”  
**Then** ke `/login`; akses `/orders` lagi kembali ke login

### A6 — Orders list load

**Given** admin login + backend punya ≥1 order  
**When** buka `/orders`  
**Then** tabel menampilkan kolom Order, Customer, Status, Courier, Total, Payment, Created, Actions  
**And** tidak ada alert “Unable to reach backend” / “Missing BACKEND_URL”

### A7 — Filter status

**When** pilih status di `#status-filter` (mis. `pending`)  
**Then** hanya baris dengan status itu (atau empty state “No orders found.”)

### A8 — Filter customerId

**When** ketik substring `customerId` di `#customer-filter`  
**Then** baris terfilter by `customerId` (bukan nama — payload belum punya name)

### A9 — Socket live state

**Given** backend Socket.io up + JWT admin valid  
**When** halaman Orders terbuka  
**Then** indikator Live menuju `connected` (boleh brief `connecting` dulu)  
**And** tidak stuck di `error` dengan pesan auth/network

### A10 — Assign kurir (happy path)

**Given** order `pending` + ≥1 courier `isAvailable=true`  
**When** klik Assign → pilih kurir → submit Assign  
**Then** dialog tutup; baris order punya `courierId`; status menjadi **`picked_up`**; tombol Assign hilang untuk baris itu

### A11 — Assign tanpa kurir available

**Given** order `pending`, tidak ada courier available  
**When** buka dialog Assign  
**Then** pesan “No available couriers right now.”; submit disabled / tidak bisa assign

### A12 — Assign validation

**When** dialog terbuka tanpa memilih kurir lalu submit (jika memungkinkan)  
**Then** error “Select an available courier” (atau submit tetap disabled)

### A13 — Overview scaffold

**When** buka `/` setelah login  
**Then** heading “Overview” terlihat (Phase A copy boleh ada; jangan assert fitur realtime di sini)

## Priority matrix

| ID | Prioritas | Alasan |
|---|---|---|
| A1, A2, A3, A4, A5 | P0 | Auth gate seluruh dashboard |
| A6, A10 | P0 | Core operator workflow |
| A7, A8, A9 | P1 | Operasional harian + realtime |
| A11, A12, A13 | P2 | Edge case & smoke shell |

## Env & CI checklist

- [ ] Backend + admin healthy sebelum `npx playwright test`
- [ ] `JWT_ACCESS_SECRET` identik di backend dan admin
- [ ] Admin user + pending order + available courier di DB tes
- [ ] Jangan pakai production DB untuk E2E destruktif (assign mengubah status)
- [ ] Isolasi: order/courier khusus prefix E2E, atau reset transaksi per suite
- [ ] Artifact: trace + screenshot on failure (`playwright.config` `trace: 'on-first-retry'`)

## Menjalankan Playwright

```bash
# 1) Pastikan apps/admin-dashboard/.env.local ada (JWT_ACCESS_SECRET = backend)
# 2) Seed user + kurir available + order pending (idempotent)
npm run seed:e2e

# 3) Jalankan suite (webServer auto-start backend :3000 + admin :3001 jika belum jalan)
npm run test:e2e:admin
```

Lokasi suite:

```
apps/admin-dashboard/
  playwright.config.ts
  e2e/
    helpers.ts
    auth.spec.ts             # A1–A5
    orders.spec.ts           # A6–A9, A13
    assign-courier.spec.ts   # A10, A12
```

A11 (no available couriers) sengaja belum diotomasi — butuh mematikan availability kurir dan mudah bentrok dengan suite lain.

## Dokumen terkait

- `docs/laundry-admin-dashboard-README.md` — overview lama (masih menyebut Firebase; stack aktual = Next BFF → Express)
- `docs/laundry-admin-dashboard-CLAUDE.md` — catatan coding agent (sebagian pola Firebase usang)
- `apps/admin-dashboard/.env.example` — env yang wajib untuk E2E
- Backend assign + state machine: `apps/backend/src/services/order.service.ts`, `orderStateMachine.ts`
