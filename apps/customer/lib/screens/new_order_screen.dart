import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:laundry_customer/models/laundry_order.dart';
import 'package:laundry_customer/services/api_exception.dart';
import 'package:laundry_customer/session.dart';
import 'package:laundry_customer/theme/app_colors.dart';
import 'package:laundry_customer/widgets/form_widgets.dart';

class NewOrderScreen extends StatefulWidget {
  const NewOrderScreen({super.key, required this.session});

  final Session session;

  @override
  State<NewOrderScreen> createState() => _NewOrderScreenState();
}

class _NewOrderScreenState extends State<NewOrderScreen> {
  final _pickup = TextEditingController();
  final _delivery = TextEditingController();
  final _weight = TextEditingController(text: '3');
  CatalogService _service = catalogServices.first;
  bool _sameAddress = true;
  bool _schedulePickup = false;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _pickup.dispose();
    _delivery.dispose();
    _weight.dispose();
    super.dispose();
  }

  DateTime? _scheduledAt() {
    if (!_schedulePickup) return null;
    final now = DateTime.now();
    return DateTime(now.year, now.month, now.day + 1, 9);
  }

  Future<void> _submit() async {
    final pickup = _pickup.text.trim();
    final delivery = _sameAddress ? pickup : _delivery.text.trim();
    final weight = double.tryParse(_weight.text.trim().replaceAll(',', '.'));
    if (pickup.isEmpty || delivery.isEmpty) {
      setState(() => _error = 'Alamat jemput dan antar wajib diisi.');
      return;
    }
    if (weight == null || weight <= 0) {
      setState(() => _error = 'Berat harus lebih dari 0 kg.');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final order = await widget.session.createOrder(
        pickupAddress: pickup,
        deliveryAddress: delivery,
        itemName: _service.name,
        weightKg: weight,
        pricePerKg: _service.pricePerKg,
        scheduledPickupAt: _scheduledAt(),
      );
      debugPrint('FASE_A_ORDER_ID=${order.id}');
      if (!mounted) return;
      context.go('/orders');
    } on ApiException catch (error) {
      if (mounted) setState(() => _error = error.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Gagal membuat order.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final weight = double.tryParse(_weight.text.trim().replaceAll(',', '.')) ?? 0;
    final estimate = weight > 0 ? weight * _service.pricePerKg : 0;

    return ScreenScaffold(
      title: 'Pesan laundry',
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
        children: [
          const Text(
            'Layanan',
            style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.ink),
          ),
          const SizedBox(height: 8),
          for (final service in catalogServices) ...[
            _ServiceTile(
              service: service,
              selected: service.name == _service.name,
              onTap: () => setState(() => _service = service),
            ),
            const SizedBox(height: 8),
          ],
          const SizedBox(height: 8),
          TextField(
            key: const Key('order-weight'),
            controller: _weight,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: const InputDecoration(
              labelText: 'Perkiraan berat (kg)',
              helperText: 'Ditimbang ulang di workshop',
            ),
            onChanged: (_) => setState(() {}),
          ),
          const SizedBox(height: 12),
          TextField(
            key: const Key('order-pickup'),
            controller: _pickup,
            minLines: 2,
            maxLines: 3,
            decoration: const InputDecoration(labelText: 'Alamat penjemputan'),
          ),
          SwitchListTile(
            key: const Key('order-same-address'),
            contentPadding: EdgeInsets.zero,
            title: const Text('Antar ke alamat yang sama', style: TextStyle(fontSize: 14)),
            value: _sameAddress,
            activeThumbColor: AppColors.primary,
            onChanged: (value) => setState(() => _sameAddress = value),
          ),
          if (!_sameAddress)
            TextField(
              key: const Key('order-delivery'),
              controller: _delivery,
              minLines: 2,
              maxLines: 3,
              decoration: const InputDecoration(labelText: 'Alamat pengantaran'),
            ),
          SwitchListTile(
            key: const Key('order-schedule'),
            contentPadding: EdgeInsets.zero,
            title: const Text('Jemput besok pagi (09:00)', style: TextStyle(fontSize: 14)),
            value: _schedulePickup,
            activeThumbColor: AppColors.primary,
            onChanged: (value) => setState(() => _schedulePickup = value),
          ),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.line),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Estimasi', style: TextStyle(color: AppColors.muted)),
                Text(
                  formatRupiah(estimate),
                  style: const TextStyle(
                    color: AppColors.primaryDark,
                    fontWeight: FontWeight.w800,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            ErrorBanner(message: _error!),
          ],
          const SizedBox(height: 16),
          PrimaryButton(
            key: const Key('order-submit'),
            label: 'Buat pesanan',
            loading: _loading,
            onPressed: _submit,
          ),
        ],
      ),
    );
  }
}

class _ServiceTile extends StatelessWidget {
  const _ServiceTile({
    required this.service,
    required this.selected,
    required this.onTap,
  });

  final CatalogService service;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? const Color(0xFFE7F3EF) : AppColors.surface,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        key: Key('service-${service.pricePerKg}'),
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: selected ? AppColors.primary : AppColors.line,
              width: selected ? 1.4 : 1,
            ),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      service.name,
                      style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.ink),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      service.detail,
                      style: const TextStyle(color: AppColors.muted, fontSize: 12),
                    ),
                  ],
                ),
              ),
              Text(
                '${formatRupiah(service.pricePerKg)}/kg',
                style: const TextStyle(
                  color: AppColors.primaryDark,
                  fontWeight: FontWeight.w800,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
