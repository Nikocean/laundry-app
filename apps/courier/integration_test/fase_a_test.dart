import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:laundry_courier/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('courier sees assigned order and advances to washing', (
    tester,
  ) async {
    const email = String.fromEnvironment('COURIER_EMAIL');
    const password = String.fromEnvironment('COURIER_PASSWORD');
    const orderId = String.fromEnvironment('ORDER_ID');
    expect(email, isNotEmpty);
    expect(password, isNotEmpty);
    expect(orderId, isNotEmpty);

    await app.main();
    await tester.pump();

    await tester.enterText(find.byKey(const Key('login-email')), email);
    await tester.enterText(find.byKey(const Key('login-password')), password);
    await _dismissKeyboard(tester);
    await tester.tap(find.byKey(const Key('login-submit')));
    await _waitFor(tester, find.byKey(const Key('tasks-title')));

    await _waitFor(tester, find.byKey(Key('task-$orderId')));
    expect(find.byKey(const Key('tasks-empty')), findsNothing);

    await tester.tap(find.byKey(Key('task-$orderId')));
    await _waitFor(tester, find.byKey(const Key('order-status-code')));
    expect(
      tester.widget<Text>(find.byKey(const Key('order-status-code'))).data,
      'picked_up',
    );

    await tester.tap(find.byKey(const Key('advance-status')));
    await _waitFor(tester, find.text('washing'));
    expect(
      tester.widget<Text>(find.byKey(const Key('order-status-code'))).data,
      'washing',
    );
    debugPrint('FASE_A_ORDER_ID=$orderId');
    debugPrint('FASE_A_STATUS=washing');
  });
}

Future<void> _dismissKeyboard(WidgetTester tester) async {
  FocusManager.instance.primaryFocus?.unfocus();
  await tester.pump(const Duration(milliseconds: 300));
}

Future<void> _waitFor(WidgetTester tester, Finder finder) async {
  final deadline = DateTime.now().add(const Duration(seconds: 40));
  while (DateTime.now().isBefore(deadline)) {
    await tester.pump(const Duration(milliseconds: 200));
    if (finder.evaluate().isNotEmpty) return;
    final error = find.byKey(const Key('form-error-text'));
    if (error.evaluate().isNotEmpty) {
      final text = tester.widget<Text>(error).data;
      fail(text ?? 'Permintaan gagal');
    }
    final tasksError = find.byKey(const Key('tasks-error'));
    if (tasksError.evaluate().isNotEmpty) {
      final text = tester.widget<Text>(tasksError).data;
      fail(text ?? 'Gagal memuat tugas');
    }
    final detailError = find.byKey(const Key('detail-error'));
    if (detailError.evaluate().isNotEmpty) {
      final text = tester.widget<Text>(detailError).data;
      fail(text ?? 'Gagal memuat order');
    }
  }
  fail('Waktu habis menunggu elemen di layar.');
}
