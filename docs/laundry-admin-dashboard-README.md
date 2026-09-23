# laundry-admin-dashboard

Dashboard web untuk pemilik/operator laundry, dibangun dengan Next.js. Digunakan untuk mengelola order masuk, assign kurir, update status cucian, dan melihat laporan harian.

## Fitur utama

- Login admin dengan email/password
- Ringkasan order hari ini (pending, dalam proses, selesai)
- Kelola semua order secara realtime
- Assign kurir ke order yang masuk
- Update status cucian dari dasbor
- Manajemen data pelanggan
- Laporan pendapatan harian & bulanan
- Manajemen akun kurir (tambah, nonaktifkan)

## Stack teknologi

| Teknologi | Kegunaan |
|---|---|
| Next.js 14 (App Router) | Framework web utama |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | Komponen UI |
| Firebase Auth | Login admin |
| Firebase Firestore | Data realtime |
| Recharts | Grafik laporan |
| TanStack Table | Tabel order yang bisa di-sort & filter |
| date-fns | Manipulasi tanggal |

## Prasyarat

- Node.js 18 ke atas
- npm atau pnpm
- Akun Firebase (project yang sama dengan backend)

## Setup lokal

```bash
# Clone repository
git clone https://github.com/username/laundry-admin-dashboard.git
cd laundry-admin-dashboard

# Install dependencies
npm install

# Salin file environment
cp .env.example .env.local

# Isi .env.local dengan konfigurasi Firebase
# (lihat bagian Environment Variables di bawah)

# Jalankan development server
npm run dev
```

Buka `http://localhost:3000` di browser.

## Environment variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Untuk koneksi ke emulator (development)
NEXT_PUBLIC_USE_EMULATOR=true
```

## Struktur project

```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/
│   │   └── login/
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Layout sidebar + header
│   │   ├── page.tsx            # Halaman utama (ringkasan)
│   │   ├── orders/             # Daftar & detail order
│   │   ├── couriers/           # Manajemen kurir
│   │   ├── customers/          # Data pelanggan
│   │   └── reports/            # Laporan & grafik
│   └── api/                    # API routes (minimal)
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── orders/                 # Komponen khusus order
│   ├── charts/                 # Komponen grafik
│   └── layout/                 # Sidebar, header, dll
├── lib/
│   ├── firebase.ts             # Inisialisasi Firebase
│   ├── firestore/              # Helper query Firestore
│   └── utils.ts
└── types/
    └── index.ts                # TypeScript types
```

## Build & deploy

```bash
# Build production
npm run build

# Preview build lokal
npm run start
```

### Deploy ke Vercel (rekomendasi)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Atau hubungkan repo ke [Vercel](https://vercel.com) untuk auto-deploy setiap push ke `main`.

### Deploy ke Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

## Konvensi

- Gunakan **App Router** (bukan Pages Router) — semua halaman ada di `src/app/`
- Data Firestore di-subscribe pakai `onSnapshot` untuk update realtime di halaman order
- Role admin diverifikasi di middleware Next.js — akses ditolak kalau bukan role `admin`
- Semua tabel order bisa di-filter minimal berdasarkan: tanggal, status, dan nama pelanggan
