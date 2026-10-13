import 'package:go_router/go_router.dart';
import 'package:laundry_customer/screens/home_screen.dart';
import 'package:laundry_customer/screens/login_screen.dart';
import 'package:laundry_customer/screens/new_order_screen.dart';
import 'package:laundry_customer/screens/orders_screen.dart';
import 'package:laundry_customer/screens/register_screen.dart';
import 'package:laundry_customer/screens/tracking_screen.dart';
import 'package:laundry_customer/session.dart';

GoRouter createRouter(Session session) {
  return GoRouter(
    initialLocation: '/login',
    refreshListenable: session,
    redirect: (context, state) {
      final location = state.matchedLocation;
      final onAuth = location == '/login' || location == '/register';
      if (!session.isLoggedIn && !onAuth) return '/login';
      if (session.isLoggedIn && onAuth) return '/home';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => LoginScreen(
          session: session,
          initialEmail: state.extra is String ? state.extra as String : null,
        ),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => RegisterScreen(session: session),
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => HomeScreen(session: session),
      ),
      GoRoute(
        path: '/orders/new',
        builder: (context, state) => NewOrderScreen(session: session),
      ),
      GoRoute(
        path: '/orders/:id',
        builder: (context, state) => TrackingScreen(
          session: session,
          orderId: state.pathParameters['id'] ?? '',
        ),
      ),
      GoRoute(
        path: '/orders',
        builder: (context, state) => OrdersScreen(session: session),
      ),
    ],
  );
}
