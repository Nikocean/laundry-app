class OrderAssignedEvent {
  const OrderAssignedEvent({
    required this.orderId,
    required this.status,
    required this.courierId,
  });

  final String orderId;
  final String status;
  final String courierId;

  static OrderAssignedEvent? tryParse(dynamic data) {
    final raw = data is List && data.isNotEmpty ? data.first : data;
    if (raw is! Map) return null;
    final map = Map<String, dynamic>.from(raw);
    final orderId = map['orderId'];
    final status = map['status'];
    final courierId = map['courierId'];
    if (orderId is! String || orderId.isEmpty) return null;
    if (status is! String || status.isEmpty) return null;
    if (courierId is! String || courierId.isEmpty) return null;
    return OrderAssignedEvent(
      orderId: orderId,
      status: status,
      courierId: courierId,
    );
  }
}

Map<String, dynamic>? ackPayload(dynamic data) {
  final raw = data is List && data.isNotEmpty ? data.first : data;
  if (raw is! Map) return null;
  return Map<String, dynamic>.from(raw);
}
