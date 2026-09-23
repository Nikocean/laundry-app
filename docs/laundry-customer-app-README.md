# laundry-customer-app

Aplikasi mobile untuk pelanggan layanan laundry pickup & delivery, dibangun dengan Flutter.

## Fitur utama

- Registrasi & login (email/password dan Google Sign-In)
- Pesan pickup laundry dengan pilih alamat dan jadwal
- Tracking status cucian secara realtime
- Notifikasi push untuk setiap perubahan status
- Riwayat transaksi dan invoice
- Pembayaran in-app (transfer bank / e-wallet via Midtrans)

## Stack teknologi

| Package | Kegunaan |
|---|---|
| `firebase_core` | Inisialisasi Firebase |
| `firebase_auth` | Autentikasi user |
| `cloud_firestore` | Baca/tulis data order |
| `firebase_messaging` | Push notification |
| `firebase_storage` | Upload foto |
| `go_router` | Navigasi antar screen |
| `riverpod` | State management |
| `dio` | HTTP client untuk Cloud Functions |
| `google_fonts` | Tipografi |
| `intl` | Format tanggal & mata uang (Rupiah) |

## Prasyarat

- Flutter SDK 3.x ke atas
- Android Studio (untuk emulator Android)
- Xcode (untuk build iOS, hanya di macOS)
- File `google-services.json` (Android) dan `GoogleService-Info.plist` (iOS) dari Firebase Console

## Setup lokal

```bash
# Clone repository
git clone https://github.com/username/laundry-customer-app.git
cd laundry-customer-app

# Install dependencies
flutter pub get

# Pastikan environment sudah benar
flutter doctor

# Jalankan di emulator atau device
flutter run
```

### Konfigurasi Firebase

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Download `google-services.json` → taruh di `android/app/`
3. Download `GoogleService-Info.plist` → taruh di `ios/Runner/`
4. Jalankan `flutterfire configure` (opsional, untuk generate `firebase_options.dart` otomatis)

## Struktur project

```
lib/
├── main.dart
├── firebase_options.dart       # Auto-generated oleh FlutterFire CLI
├── core/
│   ├── constants/              # Warna, string, ukuran
│   ├── router/                 # Konfigurasi go_router
│   └── theme/                  # ThemeData app
├── features/
│   ├── auth/                   # Login, register, splash screen
│   ├── home/                   # Halaman utama & order baru
│   ├── tracking/               # Realtime tracking status order
│   ├── history/                # Riwayat transaksi
│   ├── payment/                # Flow pembayaran
│   └── profile/                # Edit profil user
└── shared/
    ├── models/                 # Data model (Order, User, dll)
    ├── providers/              # Riverpod providers
    └── widgets/                # Widget reusable
```

## Build untuk production

```bash
# Android APK
flutter build apk --release

# Android App Bundle (untuk Play Store)
flutter build appbundle --release

# iOS (hanya di macOS)
flutter build ipa --release
```

## Konvensi

- State management menggunakan **Riverpod** — hindari `setState` di luar widget kecil
- Navigasi menggunakan `go_router` — jangan gunakan `Navigator.push` langsung
- Format mata uang selalu dalam **Rupiah (IDR)** menggunakan package `intl`
- Semua teks UI menggunakan **Bahasa Indonesia**
