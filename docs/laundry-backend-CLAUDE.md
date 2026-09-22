# CLAUDE.md — laundry-backend

File ini membantu Claude Code memahami konteks, konvensi, dan cara kerja repository ini.

## Tentang project ini

Backend Firebase untuk aplikasi laundry pickup & delivery. Melayani tiga klien:
- **App pelanggan** (`laundry-customer-app`) — Flutter, Android/iOS
- **App kurir** (`laundry-courier-app`) — Flutter, Android/iOS
- **Dashboard admin** (`laundry-admin-dashboard`) — Next.js, web

## Perintah penting

```bash
# Jalankan semua emulator (gunakan ini untuk development)
firebase emulators:start

# Jalankan hanya functions dengan watch mode
cd functions && npm run serve

# Build TypeScript
cd functions && npm run build

# Lint
cd functions && npm run lint

# Deploy production
firebase deploy --only functions
firebase deploy --only firestore:rules
```

## Struktur Firestore yang perlu diketahui

Saat membaca atau menulis ke Firestore, gunakan koleksi berikut:

- `users` — semua user (pelanggan, kurir, admin). Field `role` menentukan tipe user.
- `orders` — semua order laundry. Field `status` adalah state machine utama.
- `couriers` — data operasional kurir (availability, lokasi).
- `notifications` — antrian notifikasi per user.

### State machine order

```
pending → picked_up → washing → done → delivering → delivered
                                              ↓
                                         cancelled (bisa dari pending atau picked_up)
```

Perubahan status order selalu melalui Cloud Function `updateOrderStatus`, **bukan** ditulis langsung dari klien, untuk memastikan validasi dan trigger notifikasi berjalan.

## Konvensi penting

### Security rules
- Pelanggan hanya bisa baca/tulis dokumen miliknya sendiri (`userId == request.auth.uid`)
- Kurir hanya bisa update field `status` dan `courierId` di orders yang di-assign ke mereka
- Admin (role == 'admin') punya akses baca/tulis penuh ke semua koleksi
- Jangan pernah beri akses write ke koleksi `users` dari klien untuk field `role`

### Cloud Functions
- Semua function ditulis di `functions/src/`, satu file per domain
- Gunakan `logger` dari `firebase-functions` (bukan `console.log`) agar log muncul di Firebase Console
- Setiap HTTP function wajib validasi auth token di header
- Gunakan Firestore batch write atau transaction kalau update lebih dari 1 dokumen sekaligus

### Error handling pattern
```typescript
try {
  // logic
} catch (error) {
  logger.error('Nama function gagal:', error);
  throw new functions.https.HttpsError('internal', 'Pesan error untuk klien');
}
```

## Hal yang perlu dihindari

- Jangan taruh API key atau secret langsung di kode — gunakan `functions.config()` atau `.env`
- Jangan izinkan klien mengubah field `role`, `totalPrice`, atau `status` secara langsung lewat Firestore SDK — selalu lewat Cloud Function
- Jangan query Firestore tanpa index untuk field yang sering difilter (cek `firestore.indexes.json`)

## Emulator vs Production

Saat development, semua klien (customer app, courier app, admin dashboard) diarahkan ke emulator lokal. Pastikan konfigurasi `connectFirestoreEmulator()` di masing-masing klien hanya aktif di mode debug/development.

## Referensi

- [Firebase Docs](https://firebase.google.com/docs)
- [Cloud Functions for Firebase](https://firebase.google.com/docs/functions)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
