import 'package:dio/dio.dart';

class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode});

  final String message;
  final int? statusCode;

  factory ApiException.fromDio(DioException error) {
    final data = error.response?.data;
    if (data is Map && data['error'] is String) {
      return ApiException(
        data['error'] as String,
        statusCode: error.response?.statusCode,
      );
    }
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.connectionError) {
      return const ApiException('Tidak dapat menghubungi server.');
    }
    return ApiException(
      'Permintaan gagal (${error.response?.statusCode ?? 'jaringan'}).',
      statusCode: error.response?.statusCode,
    );
  }

  @override
  String toString() => message;
}
