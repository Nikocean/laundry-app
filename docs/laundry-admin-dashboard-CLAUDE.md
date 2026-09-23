# CLAUDE.md — laundry-admin-dashboard

File ini membantu Claude Code memahami konteks dan konvensi repository Next.js untuk dashboard admin laundry.

## Tentang project ini

Dashboard web Next.js 14 (App Router) untuk operator laundry. Digunakan di desktop/laptop, bukan mobile. Backend: Firebase (Firestore, Auth) — project yang sama dengan `laundry-backend`, `laundry-customer-app`, dan `laundry-courier-app`.

## Perintah yang sering dipakai

```bash
# Development
npm run dev

# Build production
npm run build

# Jalankan production build lokal
npm run start

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

## Arsitektur & pola yang dipakai

### App Router Next.js 14

Semua halaman ada di `src/app/`. Gunakan struktur folder dengan route groups:
- `(auth)` — halaman sebelum login
- `(dashboard)` — halaman setelah login, punya layout sidebar

```typescript
// Server Component (default) — gunakan untuk halaman statis
export default async function OrdersPage() { ... }

// Client Component — gunakan kalau butuh state, event, atau Firestore realtime
'use client';
export default function OrderTable() { ... }
```

Pilih Server Component dulu, baru tambah `'use client'` kalau benar-benar butuh.

### Firestore realtime di dashboard

Halaman order menggunakan `onSnapshot` untuk update realtime. Pola yang dipakai:

```typescript
// Di custom hook: hooks/useOrders.ts
export function useOrders(status?: OrderStatus) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const q = status
      ? query(collection(db, 'orders'), where('status', '==', status))
      : collection(db, 'orders');

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order)));
    });

    return () => unsubscribe(); // cleanup saat unmount
  }, [status]);

  return orders;
}
```

Jangan lupa return `unsubscribe` di cleanup function — memory leak kalau lupa.

### Auth & middleware

`src/middleware.ts` melindungi semua route `(dashboard)`. Cara kerjanya:
1. Cek session cookie Firebase
2. Verifikasi token di server
3. Cek role user == `admin` di Firestore
4. Redirect ke `/login` kalau tidak valid

Jangan taruh logic proteksi route di komponen — semua di middleware.

### Komponen UI

Project menggunakan **shadcn/ui**. Untuk tambah komponen baru:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
```

Komponen yang sudah diinstall ada di `src/components/ui/`. Jangan edit file di sana langsung — extend di komponen kamu sendiri.

## Firestore yang diakses dari dashboard

Admin punya read/write ke semua koleksi (sesuai security rules). Yang paling sering diakses:

```typescript
// Semua order (dengan pagination atau filter)
collection(db, 'orders')

// Assign kurir ke order
doc(db, 'orders', orderId) → update({ courierId, status: 'picked_up' })

// Daftar kurir yang available
query(collection(db, 'couriers'), where('isAvailable', '==', true))

// Data user
collection(db, 'users')
```

## Format data yang konsisten

```typescript
// Selalu format harga sebagai Rupiah
export const formatRupiah = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

// Format tanggal
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
format(date, 'dd MMMM yyyy', { locale: id }); // "07 Juli 2026"
```

## Hal yang perlu dihindari

- Jangan fetch Firestore di Server Component tanpa caching yang tepat — data order berubah sering, gunakan Client Component dengan `onSnapshot`
- Jangan expose Firebase service account key di client — hanya Firebase web SDK (public config) yang boleh di client
- Jangan buat halaman baru tanpa cek apakah perlu `'use client'` atau tidak
- Jangan update status order langsung ke Firestore dari dashboard — selalu lewat Cloud Function `updateOrderStatus` agar notifikasi ke pelanggan tetap jalan
- Jangan lupa unsubscribe Firestore listener di `useEffect` cleanup

## Koneksi ke Firebase Emulator (development)

Di `src/lib/firebase.ts`:

```typescript
if (process.env.NEXT_PUBLIC_USE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

Pastikan `firebase emulators:start` dari repo `laundry-backend` sudah jalan.

## Referensi

- [Next.js 14 App Router docs](https://nextjs.org/docs)
- [shadcn/ui docs](https://ui.shadcn.com)
- [TanStack Table docs](https://tanstack.com/table)
- [Recharts docs](https://recharts.org)
- [date-fns docs](https://date-fns.org)
