# CLAUDE.md — laundry-customer-app

File ini membantu Claude Code memahami konteks dan konvensi repository Flutter untuk sisi pelanggan.

## Tentang app ini

App Flutter untuk pelanggan laundry pickup & delivery. Target platform: Android dan iOS.
Backend: Firebase (Firestore, Auth, Storage, FCM). Lihat repo `laundry-backend` untuk detail backend.

## Perintah yang sering dipakai

```bash
# Jalankan app (development, terhubung ke Firebase Emulator)
flutter run

# Jalankan dengan flavor tertentu (jika sudah dikonfigurasi)
flutter run --flavor development

# Build release
flutter build apk --release
flutter build appbundle --release

# Generate kode (Riverpod, Freezed, dll)
dart run build_runner build --delete-conflicting-outputs

# Cek masalah
flutter analyze
flutter test
```

## State management — Riverpod

Project ini menggunakan **Riverpod** sebagai state management. Pola yang dipakai:

```dart
// Provider untuk data dari Firestore (stream)
final orderListProvider = StreamProvider<List<Order>>((ref) {
  return ref.watch(orderRepositoryProvider).watchOrders();
});

// Provider untuk aksi (AsyncNotifier)
final orderNotifierProvider = AsyncNotifierProvider<OrderNotifier, void>(
  OrderNotifier.new,
);
```

Jangan gunakan `setState` kecuali untuk state UI lokal yang sangat sederhana (misal toggle visibility dalam satu widget).

## Navigasi — go_router

Semua route didefinisikan di `lib/core/router/app_router.dart`. Untuk navigasi gunakan:

```dart
context.go('/home');           // ganti halaman
context.push('/order/detail'); // push ke stack
context.pop();                  // kembali
```

Jangan gunakan `Navigator.of(context).push()` — tidak konsisten dengan go_router.

## Model data

Model ada di `lib/shared/models/`. Semua model menggunakan **Freezed** untuk immutability dan copyWith:

```dart
@freezed
class Order with _$Order {
  const factory Order({
    required String id,
    required String customerId,
    required OrderStatus status,
    required double totalPrice,
    // ...
  }) = _Order;

  factory Order.fromFirestore(DocumentSnapshot doc) { ... }
}
```

Kalau perlu tambah field baru ke model, jalankan `build_runner` setelahnya.

## Koneksi ke Firebase Emulator (development)

Di `main.dart`, ada blok ini yang aktif saat development:

```dart
if (kDebugMode) {
  FirebaseFirestore.instance.useFirestoreEmulator('localhost', 8080);
  FirebaseAuth.instance.useAuthEmulator('localhost', 9099);
  FirebaseStorage.instance.useStorageEmulator('localhost', 9199);
}
```

Pastikan emulator Firebase (`firebase emulators:start`) sudah jalan sebelum `flutter run`.

## Struktur folder — feature-first

Setiap fitur punya folder sendiri di `lib/features/` dengan struktur:

```
features/
└── tracking/
    ├── screens/          # Widget screen utama
    ├── widgets/          # Widget kecil khusus fitur ini
    ├── providers/        # Riverpod providers khusus fitur ini
    └── repositories/     # Akses data Firestore
```

Jangan taruh logic bisnis di dalam widget/screen — taruh di provider atau repository.

## Format angka dan tanggal

Selalu gunakan helper dari `lib/core/utils/formatter.dart`:

```dart
// Harga
formatRupiah(15000) // → "Rp 15.000"

// Tanggal
formatTanggal(DateTime.now()) // → "Senin, 7 Juli 2026"
```

Jangan format manual pakai string interpolasi.

## Hal yang perlu dihindari

- Jangan hardcode warna — gunakan `Theme.of(context).colorScheme`
- Jangan panggil Firestore langsung dari widget — selalu lewat repository
- Jangan simpan data sensitif (token, key) di SharedPreferences tanpa enkripsi
- Jangan lupa handle loading state dan error state di setiap StreamProvider/FutureProvider

## Referensi

- [Flutter docs](https://docs.flutter.dev)
- [Riverpod docs](https://riverpod.dev)
- [go_router docs](https://pub.dev/packages/go_router)
- [FlutterFire docs](https://firebase.flutter.dev)
