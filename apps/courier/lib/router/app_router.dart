import 'package:go_router/go_router.dart';
import 'package:laundry_courier/screens/login_screen.dart';
import 'package:laundry_courier/screens/order_detail_screen.dart';
import 'package:laundry_courier/screens/tasks_screen.dart';
import 'package:laundry_courier/session.dart';

GoRouter createRouter(Session session) {
  return GoRouter(
    initialLocation: '/login',
    refreshListenable: session,
    redirect: (context, state) {
      final location = state.matchedLocation;
      final onLogin = location == '/login';
      if (!session.isLoggedIn && !onLogin) return '/login';
      if (session.isLoggedIn && onLogin) return '/tasks';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => LoginScreen(session: session),
      ),
      GoRoute(
        path: '/tasks',
        builder: (context, state) => TasksScreen(session: session),
      ),
      GoRoute(
        path: '/orders/:id',
        builder: (context, state) => OrderDetailScreen(
          session: session,
          orderId: state.pathParameters['id'] ?? '',
        ),
      ),
    ],
  );
}
