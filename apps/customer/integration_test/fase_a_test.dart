import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:laundry_customer/main.dart' as app;
import 'package:laundry_customer/screens/orders_screen.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('register, login, create order, list pending', (tester) async {
    final email = 'fase-a-${DateTime.now().millisecondsSinceEpoch}@laundry.test';
    const password = 'FaseA-laundry-1';
    debugPrint('FASE_A_EMAIL=$email');

    await app.main();
    await tester.pump();

    await tester.tap(find.byKey(const Key('login-go-register')));
    await tester.pumpAndSettle();

    await tester.enterText(find.byKey(const Key('register-name')), 'Customer Fase A');
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
      'Jl. Uji Fase A No. 11, Jakarta',
    );
    await _dismissKeyboard(tester);
    await tester.ensureVisible(find.byKey(const Key('order-submit')));
    await tester.tap(find.byKey(const Key('order-submit')));
    await _waitFor(tester, find.byType(OrderCard));

    expect(
      find.byType(OrderCard),
      findsOneWidget,
      reason: 'Customer baru hanya boleh melihat order miliknya',
    );
    final card = tester.widget<OrderCard>(find.byType(OrderCard));
    final screen = tester.widget<OrdersScreen>(find.byType(OrdersScreen));
    expect(card.order.status, 'pending');
    expect(card.order.customerId, screen.session.user?.id);
    debugPrint('FASE_A_ORDER_ID=${card.order.id}');
    debugPrint('FASE_A_CUSTOMER_ID=${card.order.customerId}');
    debugPrint('FASE_A_STATUS=${card.order.status}');
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
    final ordersError = find.byKey(const Key('orders-error'));
    if (ordersError.evaluate().isNotEmpty) {
      final text = tester.widget<Text>(ordersError).data;
      fail(text ?? 'Gagal memuat pesanan');
    }
  }
  fail('Waktu habis menunggu $finder');
}
