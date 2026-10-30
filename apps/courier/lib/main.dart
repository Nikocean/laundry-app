import 'package:flutter/widgets.dart';
import 'package:laundry_courier/app.dart';
import 'package:laundry_courier/session.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final session = Session();
  await session.bootstrap();
  runApp(buildCourierApp(session));
}
