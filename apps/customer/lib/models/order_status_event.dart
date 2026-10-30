class OrderStatusEvent {
  const OrderStatusEvent({
    required this.orderId,
    required this.status,
    this.customerId,
    this.courierId,
  });

  final String orderId;
  final String status;
  final String? customerId;
  final String? courierId;

  static OrderStatusEvent? tryParse(dynamic data) {
    final raw = data is List && data.isNotEmpty ? data.first : data;
    if (raw is! Map) return null;
    final map = Map<String, dynamic>.from(raw);
    final orderId = map['orderId'];
    final status = map['status'];
    if (orderId is! String || orderId.isEmpty) return null;
    if (status is! String || status.isEmpty) return null;
    return OrderStatusEvent(
      orderId: orderId,
      status: status,
      customerId: map['customerId'] is String ? map['customerId'] as String : null,
      courierId: map['courierId'] is String ? map['courierId'] as String : null,
    );
  }
}

Map<String, dynamic>? ackPayload(dynamic data) {
  final raw = data is List && data.isNotEmpty ? data.first : data;
  if (raw is! Map) return null;
  return Map<String, dynamic>.from(raw);
}
