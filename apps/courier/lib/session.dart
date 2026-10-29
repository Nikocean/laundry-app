import 'package:flutter/foundation.dart';
import 'package:laundry_courier/models/auth_user.dart';
import 'package:laundry_courier/models/laundry_order.dart';
import 'package:laundry_courier/services/api_client.dart';
import 'package:laundry_courier/services/api_exception.dart';
import 'package:laundry_courier/services/courier_realtime.dart';
import 'package:laundry_courier/services/push_notifications.dart';
import 'package:laundry_courier/services/token_store.dart';

class Session extends ChangeNotifier {
  Session({TokenStore? store}) : _store = store ?? TokenStore() {
    _api = ApiClient(_store);
    realtime = CourierRealtime(_store);
    push = PushNotifications(_api);
  }

  final TokenStore _store;
  late final ApiClient _api;
  late final CourierRealtime realtime;
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
    if (user == null || !user!.isCourier) {
      await _store.clear();
      user = null;
      return;
    }
    await realtime.connect(user!.id);
    await push.syncToken();
  }

  Future<void> login({required String email, required String password}) async {
    final result = await _api.login(email: email, password: password);
    await _store.saveSession(result);
    if (!result.user.isCourier) {
      await logout();
      throw const ApiException('Akun ini bukan kurir.');
    }
    user = result.user;
    await realtime.connect(result.user.id);
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

  Future<List<LaundryOrder>> listMyOrders() async {
    final courierId = user?.id;
    final orders = await _api.listOrders();
    if (courierId == null) return const [];
    return [
      for (final order in orders)
        if (order.courierId == courierId) order,
    ];
  }

  Future<LaundryOrder> getOrder(String id) async {
    final order = await _api.getOrder(id);
    final courierId = user?.id;
    if (courierId == null || order.courierId != courierId) {
      throw const ApiException('Order ini bukan tugas Anda.');
    }
    return order;
  }

  Future<LaundryOrder> advanceStatus(LaundryOrder order) {
    return _api.advanceStatus(order);
  }

  Future<LaundryOrder> uploadProofPhoto({
    required String orderId,
    required String filePath,
    required String fileName,
  }) {
    return _api.uploadProofPhoto(
      orderId: orderId,
      filePath: filePath,
      fileName: fileName,
    );
  }
}
