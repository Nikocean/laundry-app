import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:laundry_courier/router/app_router.dart';
import 'package:laundry_courier/session.dart';
import 'package:laundry_courier/theme/app_colors.dart';

class CourierApp extends StatelessWidget {
  const CourierApp({super.key, required this.router});

  final GoRouter router;

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Kurir Laundry',
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(),
      routerConfig: router,
    );
  }
}

CourierApp buildCourierApp(Session session) {
  return CourierApp(router: createRouter(session));
}
