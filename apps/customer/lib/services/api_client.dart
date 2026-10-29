import 'package:dio/dio.dart';
import 'package:laundry_customer/config/api_config.dart';
import 'package:laundry_customer/models/auth_user.dart';
import 'package:laundry_customer/models/laundry_order.dart';
import 'package:laundry_customer/services/api_exception.dart';
import 'package:laundry_customer/services/token_store.dart';

class ApiClient {
  ApiClient(this._tokens) {
    dio = Dio(
      BaseOptions(
        baseUrl: normalizedApiBaseUrl(),
        connectTimeout: const Duration(seconds: 20),
        receiveTimeout: const Duration(seconds: 20),
        headers: const {'Accept': 'application/json'},
      ),
    );
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _tokens.readToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
      ),
    );
  }

  final TokenStore _tokens;
  late final Dio dio;

  Future<AuthResult> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) {
    return _authPost('/api/auth/register', {
      'name': name,
      'email': email,
      'password': password,
      if (phone != null && phone.isNotEmpty) 'phone': phone,
    });
  }

  Future<AuthResult> login({required String email, required String password}) {
    return _authPost('/api/auth/login', {
      'email': email,
      'password': password,
    });
  }

  Future<LaundryOrder> createOrder({
    required String pickupAddress,
    required String deliveryAddress,
    required String itemName,
    required double weightKg,
    required num pricePerKg,
    DateTime? scheduledPickupAt,
  }) async {
    try {
      final response = await dio.post<dynamic>(
        '/api/orders',
        data: {
          'pickupAddress': pickupAddress,
          'deliveryAddress': deliveryAddress,
          'items': [
            {
              'name': itemName,
              'weightKg': weightKg,
              'pricePerKg': pricePerKg,
            },
          ],
          if (scheduledPickupAt != null)
            'scheduledPickupAt': scheduledPickupAt.toUtc().toIso8601String(),
        },
      );
      return LaundryOrder.fromJson(_asMap(response.data));
    } on DioException catch (error) {
      throw ApiException.fromDio(error);
    }
  }

  Future<LaundryOrder> getOrder(String id) async {
    try {
      final response = await dio.get<dynamic>('/api/orders/$id');
      return LaundryOrder.fromJson(_asMap(response.data));
    } on DioException catch (error) {
      throw ApiException.fromDio(error);
    }
  }

  Future<void> cancelOrder(String id) async {
    try {
      await dio.patch<dynamic>(
        '/api/orders/$id/status',
        data: const {'status': 'cancelled'},
      );
    } on DioException catch (error) {
      throw ApiException.fromDio(error);
    }
  }

  Future<List<LaundryOrder>> listOrders() async {
    try {
      final response = await dio.get<dynamic>('/api/orders');
      final data = response.data;
      if (data is! List) {
        throw const ApiException('Respons daftar order tidak dikenali.');
      }
      return data
          .whereType<Map>()
          .map((item) => LaundryOrder.fromJson(Map<String, dynamic>.from(item)))
          .toList();
    } on DioException catch (error) {
      throw ApiException.fromDio(error);
    }
  }

  Future<void> updateFcmToken(String? fcmToken) async {
    try {
      await dio.patch<dynamic>(
        '/api/users/me',
        data: {'fcmToken': fcmToken},
      );
    } on DioException catch (error) {
      throw ApiException.fromDio(error);
    }
  }

  Future<AuthResult> _authPost(String path, Map<String, dynamic> body) async {
    try {
      final response = await dio.post<dynamic>(path, data: body);
      return AuthResult.fromJson(_asMap(response.data));
    } on DioException catch (error) {
      throw ApiException.fromDio(error);
    }
  }
}

Map<String, dynamic> _asMap(Object? data) {
  if (data is Map<String, dynamic>) return data;
  if (data is Map) return Map<String, dynamic>.from(data);
  throw const ApiException('Respons server tidak dikenali.');
}
