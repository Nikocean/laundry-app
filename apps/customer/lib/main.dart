import 'package:flutter/widgets.dart';
import 'package:laundry_customer/app.dart';
import 'package:laundry_customer/session.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final session = Session();
  await session.bootstrap();
  runApp(buildLaundryApp(session));
}
