# laundry-backend

Backend service untuk aplikasi laundry pickup & delivery, dibangun di atas Firebase platform dengan Cloud Functions untuk custom business logic.

## Gambaran umum

Repository ini berisi konfigurasi Firebase dan Cloud Functions yang menjadi tulang punggung seluruh ekosistem aplikasi laundry, melayani tiga klien: app pelanggan, app kurir, dan dashboard admin.

## Arsitektur

```
laundry-backend/
├── functions/              # Firebase Cloud Functions
│   ├── src/
│   │   ├── orders/         # Logic pembuatan & update order
│   │   ├── notifications/  # Trigger FCM push notification
│   │   ├── payments/       # Integrasi payment gateway
│   │   └── scheduler/      # Cron job (laporan harian, dll)
│   ├── package.json
│   └── tsconfig.json
├── firestore.rules         # Security rules Firestore
├── storage.rules           # Security rules Firebase Storage
├── firestore.indexes.json  # Index Firestore
└── firebase.json           # Konfigurasi project Firebase
```

## Stack teknologi

| Teknologi | Kegunaan |
|---|---|
| Firebase Authentication | Login pelanggan, kurir, dan admin |
| Cloud Firestore | Database utama (orders, users, couriers) |
| Firebase Storage | Upload foto bukti pickup/delivery |
| Cloud Functions (Node.js) | Business logic, notifikasi, integrasi payment |
| Firebase Cloud Messaging | Push notification ke semua klien |
| Firebase Hosting | (opsional) hosting admin dashboard |

## Struktur database Firestore

```
/users/{userId}
  - name, email, phone, address, role (customer/courier/admin)

/orders/{orderId}
  - customerId, courierId
  - status: pending | picked_up | washing | done | delivering | delivered
  - items: [{ name, weight, price }]
  - totalPrice, pickupAddress, deliveryAddress
  - createdAt, updatedAt, estimatedDoneAt

/couriers/{courierId}
  - userId, isAvailable, currentLocation

/notifications/{notifId}
  - userId, title, body, type, isRead, createdAt
```

## Prasyarat

- Node.js 18 atau lebih baru
- Firebase CLI (`npm install -g firebase-tools`)
- Akun Firebase dengan project yang sudah dibuat

## Setup lokal

```bash
# Clone repository
git clone https://github.com/username/laundry-backend.git
cd laundry-backend

# Login ke Firebase
firebase login

# Pilih project Firebase
firebase use --add

# Install dependencies Cloud Functions
cd functions
npm install
cd ..

# Jalankan emulator lokal
firebase emulators:start
```

Emulator berjalan di:
- Firestore: `http://localhost:8080`
- Auth: `http://localhost:9099`
- Functions: `http://localhost:5001`
- Storage: `http://localhost:9199`

## Environment variables

Buat file `functions/.env` berdasarkan `functions/.env.example`:

```env
MIDTRANS_SERVER_KEY=your_key_here
MIDTRANS_IS_PRODUCTION=false
FCM_SERVER_KEY=your_fcm_key
```

## Deploy ke production

```bash
# Deploy semua sekaligus
firebase deploy

# Deploy hanya Cloud Functions
firebase deploy --only functions

# Deploy hanya security rules
firebase deploy --only firestore:rules,storage:rules
```

## Konvensi penulisan kode

- Gunakan TypeScript untuk semua Cloud Functions
- Setiap function wajib punya error handling dan logging
- Gunakan Firestore transactions untuk operasi yang atomik (misal update order + kurir sekaligus)
- Security rules: akses Firestore selalu divalidasi berdasarkan `role` di dokumen `/users/{userId}`

## Kontributor

- [Nama kamu] — maintainer utama
