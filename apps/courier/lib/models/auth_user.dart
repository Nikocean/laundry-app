class AuthUser {
  const AuthUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.phone,
  });

  final String id;
  final String name;
  final String email;
  final String? phone;
  final String role;

  bool get isCourier => role == 'courier';

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String?,
      role: json['role'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'role': role,
    };
  }
}

class AuthResult {
  const AuthResult({required this.accessToken, required this.user});

  final String accessToken;
  final AuthUser user;

  factory AuthResult.fromJson(Map<String, dynamic> json) {
    final user = json['user'];
    if (user is! Map) {
      throw const FormatException('Respons login tidak berisi user.');
    }
    final token = json['accessToken'];
    if (token is! String || token.isEmpty) {
      throw const FormatException('Respons login tidak berisi accessToken.');
    }
    return AuthResult(
      accessToken: token,
      user: AuthUser.fromJson(Map<String, dynamic>.from(user)),
    );
  }
}
