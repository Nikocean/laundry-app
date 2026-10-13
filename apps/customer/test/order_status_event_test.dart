import 'package:flutter_test/flutter_test.dart';
import 'package:laundry_customer/models/order_status_event.dart';

void main() {
  test('parses order:status_changed payload', () {
    final event = OrderStatusEvent.tryParse({
      'orderId': 'order-1',
      'status': 'cancelled',
      'customerId': 'user-1',
      'courierId': null,
    });

    expect(event?.orderId, 'order-1');
    expect(event?.status, 'cancelled');
    expect(event?.customerId, 'user-1');
    expect(event?.courierId, isNull);
  });

  test('reads ack wrapped in a list', () {
    final ack = ackPayload([
      {'ok': true, 'room': 'order:order-1'},
    ]);
    expect(ack?['ok'], isTrue);
  });
}
