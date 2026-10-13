import 'package:flutter_test/flutter_test.dart';
import 'package:laundry_customer/models/laundry_order.dart';

void main() {
  test('parses order json from GET /api/orders', () {
    final order = LaundryOrder.fromJson({
      'id': 'order-1',
      'customerId': 'user-1',
      'status': 'pending',
      'pickupAddress': 'Jl. Mawar 1',
      'deliveryAddress': 'Jl. Mawar 1',
      'totalPrice': '27000.00',
      'createdAt': '2026-10-11T00:00:00.000Z',
      'items': [
        {
          'name': 'Cuci Kiloan Reguler',
          'weightKg': '3.00',
          'pricePerKg': '9000.00',
          'subtotal': '27000.00',
        },
      ],
    });

    expect(order.status, 'pending');
    expect(order.customerId, 'user-1');
    expect(order.items.single.name, 'Cuci Kiloan Reguler');
    expect(formatRupiah(order.totalPrice), 'Rp27.000');
    expect(statusLabel('pending'), 'Menunggu konfirmasi');
    expect(statusStageIndex('washing'), 2);
    expect(statusStageIndex('cancelled'), -1);
  });
}
