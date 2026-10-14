import 'package:flutter_test/flutter_test.dart';
import 'package:laundry_courier/models/order_assigned_event.dart';

void main() {
  test('parses order:assigned for the courier room', () {
    final event = OrderAssignedEvent.tryParse({
      'orderId': 'order-1',
      'status': 'picked_up',
      'courierId': 'courier-1',
    });
    expect(event?.orderId, 'order-1');
    expect(event?.status, 'picked_up');
    expect(event?.courierId, 'courier-1');
    expect(OrderAssignedEvent.tryParse({'orderId': 'x'}), isNull);
  });
}
