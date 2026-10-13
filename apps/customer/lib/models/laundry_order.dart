class OrderLine {
  const OrderLine({
    required this.name,
    required this.weightKg,
    required this.pricePerKg,
    required this.subtotal,
  });

  final String name;
  final String weightKg;
  final String pricePerKg;
  final String subtotal;

  factory OrderLine.fromJson(Map<String, dynamic> json) {
    return OrderLine(
      name: json['name'] as String? ?? '',
      weightKg: '${json['weightKg']}',
      pricePerKg: '${json['pricePerKg']}',
      subtotal: '${json['subtotal']}',
    );
  }
}

class LaundryOrder {
  const LaundryOrder({
    required this.id,
    required this.customerId,
    required this.status,
    required this.pickupAddress,
    required this.deliveryAddress,
    required this.totalPrice,
    required this.createdAt,
    required this.items,
    this.scheduledPickupAt,
  });

  final String id;
  final String customerId;
  final String status;
  final String pickupAddress;
  final String deliveryAddress;
  final String totalPrice;
  final String createdAt;
  final String? scheduledPickupAt;
  final List<OrderLine> items;

  LaundryOrder copyWith({String? status}) {
    return LaundryOrder(
      id: id,
      customerId: customerId,
      status: status ?? this.status,
      pickupAddress: pickupAddress,
      deliveryAddress: deliveryAddress,
      totalPrice: totalPrice,
      createdAt: createdAt,
      items: items,
      scheduledPickupAt: scheduledPickupAt,
    );
  }

  factory LaundryOrder.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'];
    return LaundryOrder(
      id: json['id'] as String,
      customerId: json['customerId'] as String,
      status: json['status'] as String,
      pickupAddress: json['pickupAddress'] as String? ?? '',
      deliveryAddress: json['deliveryAddress'] as String? ?? '',
      totalPrice: '${json['totalPrice']}',
      createdAt: json['createdAt'] as String? ?? '',
      scheduledPickupAt: json['scheduledPickupAt'] as String?,
      items: rawItems is List
          ? rawItems
                .whereType<Map>()
                .map((item) => OrderLine.fromJson(Map<String, dynamic>.from(item)))
                .toList()
          : const [],
    );
  }
}

const catalogServices = <CatalogService>[
  CatalogService(
    name: 'Cuci Kiloan Reguler',
    pricePerKg: 9000,
    detail: 'Cuci, kering, setrika, lipat',
  ),
  CatalogService(
    name: 'Cuci Kiloan Express 24 Jam',
    pricePerKg: 15000,
    detail: 'Selesai dalam 24 jam',
  ),
];

class CatalogService {
  const CatalogService({
    required this.name,
    required this.pricePerKg,
    required this.detail,
  });

  final String name;
  final int pricePerKg;
  final String detail;
}

String formatRupiah(Object amount) {
  final value = switch (amount) {
    num n => n,
    String s => double.tryParse(s) ?? 0,
    _ => 0,
  };
  final digits = value.round().abs().toString();
  final buffer = StringBuffer(value < 0 ? '-Rp' : 'Rp');
  for (var i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 == 0) buffer.write('.');
    buffer.write(digits[i]);
  }
  return buffer.toString();
}

class OrderStage {
  const OrderStage(this.status, this.label, this.detail);

  final String status;
  final String label;
  final String detail;
}

const orderStages = <OrderStage>[
  OrderStage('pending', 'Pesanan diterima', 'Menunggu konfirmasi laundry'),
  OrderStage('picked_up', 'Dijemput kurir', 'Dalam perjalanan ke workshop'),
  OrderStage('washing', 'Cuci dan setrika', 'Sedang dicuci dan dipacking'),
  OrderStage('done', 'Siap dikirim', 'Packing selesai'),
  OrderStage('delivering', 'Sedang diantar', 'Kurir menuju alamat tujuan'),
  OrderStage('delivered', 'Selesai', 'Pakaian sudah diterima'),
];

int statusStageIndex(String status) {
  return orderStages.indexWhere((stage) => stage.status == status);
}

String statusLabel(String status) {
  return switch (status) {
    'pending' => 'Menunggu konfirmasi',
    'picked_up' => 'Dijemput',
    'washing' => 'Sedang dicuci',
    'done' => 'Selesai dicuci',
    'delivering' => 'Diantar',
    'delivered' => 'Terkirim',
    'cancelled' => 'Dibatalkan',
    _ => status,
  };
}

String formatWhen(String iso) {
  final parsed = DateTime.tryParse(iso);
  if (parsed == null) return iso;
  final local = parsed.toLocal();
  String two(int n) => n.toString().padLeft(2, '0');
  return '${two(local.day)}/${two(local.month)}/${local.year} ${two(local.hour)}:${two(local.minute)}';
}
