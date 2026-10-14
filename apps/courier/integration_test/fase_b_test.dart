import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:laundry_courier/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('assigned order appears from courier room without refresh', (
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
    await _waitFor(tester, find.byKey(const Key('socket-joined')));
    await _waitFor(tester, find.byKey(const Key('tasks-empty')));
    expect(find.byKey(Key('task-$orderId')), findsNothing);
    debugPrint('FASE_B_JOINED email=$email');

    await _waitFor(
      tester,
      find.byKey(Key('task-$orderId')),
      timeout: const Duration(seconds: 90),
    );
    expect(find.byKey(const Key('live-assignment')), findsOneWidget);
    expect(find.byKey(const Key('tasks-empty')), findsNothing);
    expect(find.byKey(Key('task-code-$orderId-picked_up')), findsOneWidget);
    debugPrint('FASE_B_ORDER_ID=$orderId');
    debugPrint('FASE_B_STATUS=picked_up');
  });
}

Future<void> _dismissKeyboard(WidgetTester tester) async {
  FocusManager.instance.primaryFocus?.unfocus();
  await tester.pump(const Duration(milliseconds: 300));
}

Future<void> _waitFor(
  WidgetTester tester,
  Finder finder, {
  Duration timeout = const Duration(seconds: 45),
}) async {
  final deadline = DateTime.now().add(timeout);
  while (DateTime.now().isBefore(deadline)) {
    await tester.pump(const Duration(milliseconds: 200));
    if (finder.evaluate().isNotEmpty) return;
    final error = find.byKey(const Key('form-error-text'));
    if (error.evaluate().isNotEmpty) {
      fail(tester.widget<Text>(error).data ?? 'Permintaan gagal');
    }
    final tasksError = find.byKey(const Key('tasks-error'));
    if (tasksError.evaluate().isNotEmpty) {
      fail(tester.widget<Text>(tasksError).data ?? 'Gagal memuat tugas');
    }
  }
  fail('Waktu habis menunggu elemen di layar.');
}
