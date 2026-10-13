import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:laundry_customer/session.dart';
import 'package:laundry_customer/theme/app_colors.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key, required this.session});

  final Session session;

  @override
  Widget build(BuildContext context) {
    final name = session.user?.name ?? 'Customer';
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Halo,',
                        style: TextStyle(color: AppColors.muted, fontSize: 13),
                      ),
                      Text(
                        name,
                        key: const Key('home-name'),
                        style: const TextStyle(
                          color: AppColors.ink,
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  key: const Key('home-logout'),
                  tooltip: 'Keluar',
                  onPressed: () => session.logout(),
                  icon: const Icon(Icons.logout, color: AppColors.muted),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'GRATIS ANTAR JEMPUT',
                    style: TextStyle(
                      color: AppColors.gold,
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.4,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Pesan cuci, kami jemput ke alamatmu.',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      height: 1.25,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            _ActionCard(
              key: const Key('home-new-order'),
              title: 'Pesan cuci sekarang',
              subtitle: 'Isi alamat jemput dan berat perkiraan',
              icon: Icons.add_circle_outline,
              filled: true,
              onTap: () => context.push('/orders/new'),
            ),
            const SizedBox(height: 10),
            _ActionCard(
              key: const Key('home-orders'),
              title: 'Pesanan saya',
              subtitle: 'Status diperbarui langsung',
              icon: Icons.receipt_long_outlined,
              onTap: () => context.push('/orders'),
            ),
          ],
        ),
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  const _ActionCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
    this.filled = false,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;
  final bool filled;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: filled ? AppColors.primary : AppColors.surface,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: filled ? AppColors.primary : AppColors.line),
          ),
          child: Row(
            children: [
              Icon(icon, color: filled ? Colors.white : AppColors.primary),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        color: filled ? Colors.white : AppColors.ink,
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: TextStyle(
                        color: filled ? Colors.white70 : AppColors.muted,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.chevron_right,
                color: filled ? Colors.white : AppColors.muted,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
