import 'package:flutter_test/flutter_test.dart';
import 'package:laundry_courier/models/status_step.dart';

void main() {
  test('picked_up advances to washing without a proof photo', () {
    expect(forwardStatus('picked_up'), 'washing');
    expect(needsProofPhoto('washing'), isFalse);
    expect(advanceButtonLabel('washing'), 'Mulai cuci');
  });

  test('proof photo is required only for pickup and delivery handoff', () {
    expect(needsProofPhoto('picked_up'), isTrue);
    expect(needsProofPhoto('delivering'), isTrue);
    expect(needsProofPhoto('delivered'), isTrue);
    expect(needsProofPhoto('done'), isFalse);
    expect(forwardStatus('delivered'), isNull);
    expect(forwardStatus('cancelled'), isNull);
  });
}
