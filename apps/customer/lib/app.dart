import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:laundry_customer/router/app_router.dart';
import 'package:laundry_customer/session.dart';
import 'package:laundry_customer/theme/app_colors.dart';

class LaundryApp extends StatelessWidget {
  const LaundryApp({super.key, required this.router});

  final GoRouter router;

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Laundry',
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(),
      routerConfig: router,
    );
  }
}

LaundryApp buildLaundryApp(Session session) {
  return LaundryApp(router: createRouter(session));
}
