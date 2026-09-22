# laundry-courier-app

Aplikasi mobile untuk kurir layanan laundry pickup & delivery, dibangun dengan Flutter.

## Fitur utama

- Login khusus akun kurir (role-based access)
- Lihat daftar order yang di-assign
- Navigasi ke alamat pickup dan delivery (integrasi Google Maps)
- Update status order secara langsung dari lapangan (pickup, selesai antar, dll)
- Upload foto bukti pickup dan pengantaran
- Notifikasi order baru yang masuk

## Stack teknologi

| Package | Kegunaan |
|---|---|
| `firebase_core` | Inisialisasi Firebase |
| `firebase_auth` | Autentikasi kurir |
| `cloud_firestore` | Data order dan status |
| `firebase_messaging` | Notifikasi order baru |
| `firebase_storage` | Upload foto bukti |
| `google_maps_flutter` | Tampilkan peta & navigasi |
| `geolocator` | Ambil lokasi GPS kurir |
| `go_router` | Navigasi antar screen |
| `riverpod` | State management |
| `image_picker` | Kamera untuk foto bukti |

## Prasyarat

- Flutter SDK 3.x ke atas
- Android Studio (untuk emulator & SDK)
- File `google-services.json` dari Firebase Console
- Google Maps API Key (aktifkan Maps SDK for Android/iOS di Google Cloud Console)

## Setup lokal

```bash
# Clone repository
git clone https://github.com/username/laundry-courier-app.git
cd laundry-courier-app

# Install dependencies
flutter pub get

# Jalankan di device fisik (disarankan untuk testing GPS)
flutter run
```

### Konfigurasi Google Maps

1. Dapatkan API key dari [Google Cloud Console](https://console.cloud.google.com)
2. Android: tambahkan key di `android/app/src/main/AndroidManifest.xml`
   ```xml
   <meta-data android:name="com.google.android.geo.API_KEY"
              android:value="YOUR_API_KEY"/>
   ```
3. iOS: tambahkan di `ios/Runner/AppDelegate.swift`

## Struktur project

```
lib/
├── main.dart
├── firebase_options.dart
├── core/
│   ├── constants/
│   ├── router/
│   └── theme/
├── features/
│   ├── auth/                   # Login kurir
│   ├── order_list/             # Daftar order yang di-assign
│   ├── order_detail/           # Detail order + aksi update status
│   ├── navigation/             # Integrasi Google Maps
│   └── profile/                # Profil & availability toggle
└── shared/
    ├── models/
    ├── providers/
    └── widgets/
```

## Perbedaan dengan laundry-customer-app

Meski tech stack-nya sama, app ini punya perbedaan:

| Aspek | Customer App | Courier App |
|---|---|---|
| Role Firebase | `customer` | `courier` |
| Firestore rules | Akses order milik sendiri | Akses order yang di-assign |
| Fitur GPS | Tidak ada | Wajib (tracking & navigasi) |
| Upload foto | Tidak ada | Wajib (bukti pickup/delivery) |
| Update status | Tidak bisa | Bisa update status order |

## Konvensi

- Kurir **harus** menggunakan device fisik atau emulator dengan GPS mock untuk testing fitur lokasi
- Foto bukti wajib dikompresi sebelum upload ke Firebase Storage (gunakan package `flutter_image_compress`)
- Toggle availability kurir tersimpan di koleksi `couriers/{courierId}` field `isAvailable`
