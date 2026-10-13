import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:laundry_customer/services/api_exception.dart';
import 'package:laundry_customer/session.dart';
import 'package:laundry_customer/theme/app_colors.dart';
import 'package:laundry_customer/widgets/form_widgets.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, required this.session, this.initialEmail});

  final Session session;
  final String? initialEmail;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  late final TextEditingController _email;
  final _password = TextEditingController();
  String? _error;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _email = TextEditingController(text: widget.initialEmail ?? '');
  }

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _email.text.trim();
    final password = _password.text;
    if (email.isEmpty || password.isEmpty) {
      setState(() => _error = 'Email dan kata sandi wajib diisi.');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await widget.session.login(email: email, password: password);
    } on ApiException catch (error) {
      if (mounted) setState(() => _error = error.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Gagal masuk.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ScreenScaffold(
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 28, 20, 24),
        children: [
          const Text(
            'Laundry',
            style: TextStyle(
              color: AppColors.primary,
              fontSize: 28,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Masuk untuk memesan jemput cucian.',
            style: TextStyle(color: AppColors.muted, fontSize: 14),
          ),
          const SizedBox(height: 24),
          if (widget.initialEmail != null) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFE7F3EF),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                'Akun berhasil dibuat. Masuk untuk melanjutkan.',
                key: Key('register-success'),
                style: TextStyle(color: AppColors.primaryDark, fontSize: 13),
              ),
            ),
            const SizedBox(height: 16),
          ],
          TextField(
            key: const Key('login-email'),
            controller: _email,
            keyboardType: TextInputType.emailAddress,
            autocorrect: false,
            decoration: const InputDecoration(labelText: 'Email'),
          ),
          const SizedBox(height: 12),
          TextField(
            key: const Key('login-password'),
            controller: _password,
            obscureText: true,
            decoration: const InputDecoration(labelText: 'Kata sandi'),
            onSubmitted: (_) => _submit(),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            ErrorBanner(message: _error!),
          ],
          const SizedBox(height: 18),
          PrimaryButton(
            key: const Key('login-submit'),
            label: 'Masuk',
            loading: _loading,
            onPressed: _submit,
          ),
          const SizedBox(height: 8),
          TextButton(
            key: const Key('login-go-register'),
            onPressed: () => context.go('/register'),
            child: const Text('Belum punya akun? Daftar'),
          ),
        ],
      ),
    );
  }
}
