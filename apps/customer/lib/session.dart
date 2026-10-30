import 'package:flutter/foundation.dart';
import 'package:laundry_customer/models/auth_user.dart';
import 'package:laundry_customer/models/laundry_order.dart';
import 'package:laundry_customer/services/api_client.dart';
import 'package:laundry_customer/services/order_realtime.dart';
import 'package:laundry_customer/services/push_notifications.dart';
import 'package:laundry_customer/services/token_store.dart';

class Session extends ChangeNotifier {
  Session({TokenStore? store}) : _store = store ?? TokenStore() {
    _api = ApiClient(_store);
    realtime = OrderRealtime(_store);
    push = PushNotifications(_api);
  }

  final TokenStore _store;
  late final ApiClient _api;
  late final OrderRealtime realtime;
  late final PushNotifications push;

  AuthUser? user;

  bool get isLoggedIn => user != null;

  Future<void> bootstrap() async {
    final token = await _store.readToken();
    if (token == null || token.isEmpty) {
      user = null;
      return;
    }
    user = await _store.readUser();
    if (user == null) {
      await _store.clear();
      return;
    }
    await realtime.connect();
    await push.syncToken();
  }

  /// Register creates the account. The access token is stored only after login.
  Future<void> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    await _api.register(
      name: name,
      email: email,
      password: password,
      phone: phone,
    );
  }

  Future<void> login({required String email, required String password}) async {
    final result = await _api.login(email: email, password: password);
    await _store.saveSession(result);
    user = result.user;
    await realtime.connect();
    await push.syncToken();
    notifyListeners();
  }

  Future<void> logout() async {
    await push.clearToken();
    realtime.disconnect();
    await _store.clear();
    user = null;
    notifyListeners();
  }

  Future<LaundryOrder> createOrder({
    required String pickupAddress,
    required String deliveryAddress,
    required String itemName,
    required double weightKg,
    required num pricePerKg,
    DateTime? scheduledPickupAt,
  }) {
    return _api.createOrder(
      pickupAddress: pickupAddress,
      deliveryAddress: deliveryAddress,
      itemName: itemName,
      weightKg: weightKg,
      pricePerKg: pricePerKg,
      scheduledPickupAt: scheduledPickupAt,
    );
  }

  Future<List<LaundryOrder>> listOrders() => _api.listOrders();

  Future<LaundryOrder> getOrder(String id) => _api.getOrder(id);

  Future<void> cancelOrder(String id) => _api.cancelOrder(id);
}
