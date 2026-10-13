import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:laundry_customer/services/api_exception.dart';
import 'package:laundry_customer/session.dart';
import 'package:laundry_customer/theme/app_colors.dart';
import 'package:laundry_customer/widgets/form_widgets.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key, required this.session});

  final Session session;

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _password = TextEditingController();
  String? _error;
  bool _loading = false;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _phone.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final name = _name.text.trim();
    final email = _email.text.trim();
    final password = _password.text;
    final phone = _phone.text.trim();
    if (name.isEmpty || email.isEmpty || password.isEmpty) {
      setState(() => _error = 'Nama, email, dan kata sandi wajib diisi.');
      return;
    }
    if (password.length < 8) {
      setState(() => _error = 'Kata sandi minimal 8 karakter.');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await widget.session.register(
        name: name,
        email: email,
        password: password,
        phone: phone.isEmpty ? null : phone,
      );
      if (!mounted) return;
      context.go('/login', extra: email);
    } on ApiException catch (error) {
      if (mounted) setState(() => _error = error.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Gagal membuat akun.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ScreenScaffold(
      title: 'Daftar',
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
        children: [
          const Text(
            'Akun customer baru',
            style: TextStyle(color: AppColors.muted, fontSize: 13),
          ),
          const SizedBox(height: 16),
          TextField(
            key: const Key('register-name'),
            controller: _name,
            textCapitalization: TextCapitalization.words,
            decoration: const InputDecoration(labelText: 'Nama'),
          ),
          const SizedBox(height: 12),
          TextField(
            key: const Key('register-email'),
            controller: _email,
            keyboardType: TextInputType.emailAddress,
            autocorrect: false,
            decoration: const InputDecoration(labelText: 'Email'),
          ),
          const SizedBox(height: 12),
          TextField(
            key: const Key('register-phone'),
            controller: _phone,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(labelText: 'Nomor telepon (opsional)'),
          ),
          const SizedBox(height: 12),
          TextField(
            key: const Key('register-password'),
            controller: _password,
            obscureText: true,
            decoration: const InputDecoration(labelText: 'Kata sandi'),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            ErrorBanner(message: _error!),
          ],
          const SizedBox(height: 18),
          PrimaryButton(
            key: const Key('register-submit'),
            label: 'Buat akun',
            loading: _loading,
            onPressed: _submit,
          ),
          TextButton(
            key: const Key('register-go-login'),
            onPressed: () => context.go('/login'),
            child: const Text('Sudah punya akun? Masuk'),
          ),
        ],
      ),
    );
  }
}
