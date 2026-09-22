# CLAUDE.md — laundry-courier-app

File ini membantu Claude Code memahami konteks dan konvensi repository Flutter untuk sisi kurir.

## Tentang app ini

App Flutter khusus kurir layanan laundry pickup & delivery. Kurir login dengan akun yang sudah diberi role `courier` oleh admin. App ini berbeda repo dengan `laundry-customer-app` meski tech stack-nya identik.

## Perintah yang sering dipakai

```bash
# Jalankan (gunakan device fisik untuk testing GPS)
flutter run

# Build release Android
flutter build apk --release

# Generate kode (Riverpod, Freezed)
dart run build_runner build --delete-conflicting-outputs

# Analisis kode
flutter analyze
```

## Perbedaan kritis dari customer app

### 1. Auth & role check
Setelah login, app selalu verifikasi bahwa user punya `role == 'courier'` di Firestore. Jika bukan kurir, langsung logout dan tampilkan error. Cek ini ada di `AuthNotifier` di `lib/features/auth/providers/`.

### 2. Firestore rules yang berlaku
Kurir hanya bisa:
- Baca orders di mana `courierId == auth.uid`
- Update field `status`, `proofPhotoUrl` di order tersebut
- Update field `isAvailable` dan `currentLocation` di dokumen `couriers/{uid}` miliknya sendiri

Jangan coba akses koleksi lain — akan ditolak oleh security rules.

### 3. Update status order
Update status **selalu** lewat Cloud Function `updateOrderStatus`, bukan tulis langsung ke Firestore:

```dart
// BENAR
await ref.read(orderRepositoryProvider)
    .updateStatus(orderId: id, newStatus: OrderStatus.pickedUp);

// SALAH — bypass validasi dan notifikasi
await FirebaseFirestore.instance
    .collection('orders')
    .doc(id)
    .update({'status': 'picked_up'});
```

Cloud Function akan otomatis trigger notifikasi ke pelanggan setelah status berubah.

### 4. Upload foto bukti
Foto dicompress dulu sebelum upload, lalu URL disimpan ke field `proofPhotoUrl` di order:

```dart
// Di OrderRepository
Future<void> uploadProofPhoto(String orderId, File imageFile) async {
  final compressed = await compressImage(imageFile);
  final url = await _uploadToStorage(orderId, compressed);
  await updateOrderWithProofUrl(orderId, url);
}
```

Foto tersimpan di Firebase Storage path: `proof_photos/{orderId}/{timestamp}.jpg`

## State management

Sama seperti customer app — gunakan **Riverpod**. Provider utama:

- `assignedOrdersProvider` — StreamProvider, daftar order yang di-assign ke kurir ini
- `courierStatusProvider` — StateNotifierProvider, toggle availability kurir
- `locationProvider` — StreamProvider dari `geolocator`, update lokasi kurir secara periodik

## Lokasi kurir

Lokasi kurir di-update ke Firestore setiap 30 detik saat app aktif di foreground:

```dart
// Di location_service.dart
Geolocator.getPositionStream(
  locationSettings: const LocationSettings(
    accuracy: LocationAccuracy.high,
    distanceFilter: 20, // update setiap geser 20 meter
  ),
).listen((position) {
  _updateLocationToFirestore(position);
});
```

Jangan update terlalu sering — boros baterai dan Firestore write quota.

## Hal yang perlu dihindari

- Jangan jalankan di emulator untuk testing fitur GPS/Maps — gunakan device fisik atau mock location
- Jangan upload foto tanpa kompresi — file asli kamera bisa 5-10MB
- Jangan lupakan izin runtime: `LOCATION`, `CAMERA`, `READ_EXTERNAL_STORAGE` — minta izin sebelum pakai
- Jangan hardcode `courierId` — selalu ambil dari `FirebaseAuth.instance.currentUser?.uid`

## Referensi

- [geolocator package](https://pub.dev/packages/geolocator)
- [google_maps_flutter](https://pub.dev/packages/google_maps_flutter)
- [image_picker](https://pub.dev/packages/image_picker)
- [flutter_image_compress](https://pub.dev/packages/flutter_image_compress)
