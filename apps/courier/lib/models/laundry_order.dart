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
    this.courierId,
    this.proofPhotoUrl,
  });

  final String id;
  final String customerId;
  final String? courierId;
  final String status;
  final String pickupAddress;
  final String deliveryAddress;
  final String totalPrice;
  final String createdAt;
  final String? proofPhotoUrl;
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
      courierId: courierId,
      proofPhotoUrl: proofPhotoUrl,
    );
  }

  factory LaundryOrder.fromJson(Map<String, dynamic> json) {
    final rawItems = json['items'];
    return LaundryOrder(
      id: json['id'] as String,
      customerId: json['customerId'] as String? ?? '',
      courierId: json['courierId'] as String?,
      status: json['status'] as String? ?? '',
      pickupAddress: json['pickupAddress'] as String? ?? '',
      deliveryAddress: json['deliveryAddress'] as String? ?? '',
      totalPrice: '${json['totalPrice']}',
      createdAt: json['createdAt'] as String? ?? '',
      proofPhotoUrl: json['proofPhotoUrl'] as String?,
      items: rawItems is List
          ? rawItems
                .whereType<Map>()
                .map(
                  (item) => OrderLine.fromJson(Map<String, dynamic>.from(item)),
                )
                .toList()
          : const [],
    );
  }
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

String shortOrderId(String id) {
  if (id.length <= 8) return id;
  return id.substring(0, 8);
}
