import 'package:dio/dio.dart';
import 'package:laundry_courier/config/api_config.dart';
import 'package:laundry_courier/models/auth_user.dart';
import 'package:laundry_courier/models/laundry_order.dart';
import 'package:laundry_courier/models/status_step.dart';
import 'package:laundry_courier/services/api_exception.dart';
import 'package:laundry_courier/services/token_store.dart';

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

  Future<AuthResult> login({required String email, required String password}) {
    return _authPost('/api/auth/login', {'email': email, 'password': password});
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

  Future<LaundryOrder> getOrder(String id) async {
    try {
      final response = await dio.get<dynamic>('/api/orders/$id');
      return LaundryOrder.fromJson(_asMap(response.data));
    } on DioException catch (error) {
      throw ApiException.fromDio(error);
    }
  }

  Future<LaundryOrder> advanceStatus(LaundryOrder order) async {
    final next = forwardStatus(order.status);
    if (next == null) {
      throw const ApiException('Status ini tidak bisa dilanjutkan.');
    }
    try {
      final response = await dio.patch<dynamic>(
        '/api/orders/${order.id}/status',
        data: {
          'status': next,
          if (needsProofPhoto(next) &&
              (order.proofPhotoUrl == null || order.proofPhotoUrl!.isEmpty))
            'proofPhotoUrl': dummyProofPhotoUrl,
        },
      );
      return LaundryOrder.fromJson(_asMap(response.data));
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

  /// Uploads a gallery image as multipart `file` to the proof-photo endpoint.
  /// The server stores it in Cloudinary and returns the order with its URL.
  Future<LaundryOrder> uploadProofPhoto({
    required String orderId,
    required String filePath,
    required String fileName,
  }) async {
    try {
      final form = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath, filename: fileName),
      });
      final response = await dio.post<dynamic>(
        '/api/orders/$orderId/proof-photo',
        data: form,
      );
      return LaundryOrder.fromJson(_asMap(response.data));
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
