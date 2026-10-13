import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:laundry_customer/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('socket status update without refresh', (tester) async {
    final email = 'fase-b-${DateTime.now().millisecondsSinceEpoch}@laundry.test';
    const password = 'FaseB-laundry-1';
    debugPrint('FASE_B_EMAIL=$email');

    await app.main();
    await tester.pump();

    await tester.tap(find.byKey(const Key('login-go-register')));
    await tester.pumpAndSettle();

    await tester.enterText(find.byKey(const Key('register-name')), 'Customer Fase B');
    await tester.enterText(find.byKey(const Key('register-email')), email);
    await tester.enterText(find.byKey(const Key('register-password')), password);
    await _dismissKeyboard(tester);
    await tester.ensureVisible(find.byKey(const Key('register-submit')));
    await tester.tap(find.byKey(const Key('register-submit')));
    await _waitFor(tester, find.byKey(const Key('register-success')));

    await tester.enterText(find.byKey(const Key('login-password')), password);
    await _dismissKeyboard(tester);
    await tester.ensureVisible(find.byKey(const Key('login-submit')));
    await tester.tap(find.byKey(const Key('login-submit')));
    await _waitFor(tester, find.byKey(const Key('home-name')));

    await tester.tap(find.byKey(const Key('home-new-order')));
    await tester.pumpAndSettle();

    await tester.enterText(
      find.byKey(const Key('order-pickup')),
      'Jl. Uji Fase B No. 4, Jakarta',
    );
    await _dismissKeyboard(tester);
    await _scrollTo(tester, const Key('order-submit'));
    await tester.tap(find.byKey(const Key('order-submit')));
    await _waitFor(tester, find.byKey(const Key('order-open-0')));

    await tester.tap(find.byKey(const Key('order-open-0')));
    await _waitFor(tester, find.byKey(const Key('socket-joined')));

    expect(tester.widget<Text>(find.byKey(const Key('track-status'))).data, 'pending');
    expect(
      tester.widget<Text>(find.byKey(const Key('status-source'))).data,
      'Menunggu pembaruan langsung',
    );
    final orderId = tester.widget<Text>(find.byKey(const Key('track-order-id'))).data;
    debugPrint('FASE_B_ORDER_ID=$orderId');

    await _scrollTo(tester, const Key('cancel-order'));
    await tester.tap(find.byKey(const Key('cancel-order')));
    await _waitFor(tester, find.text('Diperbarui langsung'));

    expect(tester.widget<Text>(find.byKey(const Key('track-status'))).data, 'cancelled');
    expect(tester.widget<Text>(find.byKey(const Key('status-source'))).data, 'Diperbarui langsung');
    debugPrint('FASE_B_STATUS=cancelled');
  });
}

Future<void> _scrollTo(WidgetTester tester, Key key) async {
  await tester.scrollUntilVisible(
    find.byKey(key),
    400,
    scrollable: find.byType(Scrollable).last,
  );
  await tester.pump(const Duration(milliseconds: 200));
}

Future<void> _dismissKeyboard(WidgetTester tester) async {
  FocusManager.instance.primaryFocus?.unfocus();
  await tester.pump(const Duration(milliseconds: 300));
}

Future<void> _waitFor(WidgetTester tester, Finder finder) async {
  final deadline = DateTime.now().add(const Duration(seconds: 45));
  while (DateTime.now().isBefore(deadline)) {
    await tester.pump(const Duration(milliseconds: 200));
    if (finder.evaluate().isNotEmpty) return;
    final error = find.byKey(const Key('form-error-text'));
    if (error.evaluate().isNotEmpty) {
      fail(tester.widget<Text>(error).data ?? 'Permintaan gagal');
    }
    final ordersError = find.byKey(const Key('orders-error'));
    if (ordersError.evaluate().isNotEmpty) {
      fail(tester.widget<Text>(ordersError).data ?? 'Gagal memuat pesanan');
    }
    final trackError = find.byKey(const Key('track-error'));
    if (trackError.evaluate().isNotEmpty) {
      fail(tester.widget<Text>(trackError).data ?? 'Gagal memuat pelacakan');
    }
  }
  fail('Waktu habis menunggu $finder');
}
