import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:laundry_courier/models/laundry_order.dart';
import 'package:laundry_courier/models/status_step.dart';
import 'package:laundry_courier/services/api_exception.dart';
import 'package:laundry_courier/session.dart';
import 'package:laundry_courier/theme/app_colors.dart';
import 'package:laundry_courier/widgets/form_widgets.dart';

class OrderDetailScreen extends StatefulWidget {
  const OrderDetailScreen({
    super.key,
    required this.session,
    required this.orderId,
  });

  final Session session;
  final String orderId;

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  LaundryOrder? _order;
  String? _error;
  String? _proofMessage;
  bool _loading = true;
  bool _saving = false;
  bool _uploading = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final order = await widget.session.getOrder(widget.orderId);
      if (!mounted) return;
      setState(() {
        _order = order;
        _loading = false;
      });
    } on ApiException catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.message;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Gagal memuat order.';
        _loading = false;
      });
    }
  }

  Future<void> _advance() async {
    final order = _order;
    if (order == null) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final updated = await widget.session.advanceStatus(order);
      if (!mounted) return;
      setState(() {
        _order = updated;
        _saving = false;
      });
    } on ApiException catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.message;
        _saving = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Gagal memperbarui status.';
        _saving = false;
      });
    }
  }

  Future<void> _pickAndUploadProof() async {
    final order = _order;
    if (order == null) return;
    final picked = await ImagePicker().pickImage(source: ImageSource.gallery);
    if (picked == null || !mounted) return;
    setState(() {
      _uploading = true;
      _error = null;
      _proofMessage = null;
    });
    try {
      final updated = await widget.session.uploadProofPhoto(
        orderId: order.id,
        filePath: picked.path,
        fileName: picked.name,
      );
      if (!mounted) return;
      setState(() {
        _order = updated;
        _uploading = false;
        _proofMessage = 'Foto bukti berhasil diunggah.';
      });
    } on ApiException catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.message;
        _uploading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Gagal mengunggah foto bukti.';
        _uploading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final order = _order;
    final next = order == null ? null : forwardStatus(order.status);
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          'Detail order',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
        ),
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            )
          : order == null
          ? Padding(
              padding: const EdgeInsets.all(24),
              child: Text(
                _error ?? 'Order tidak ditemukan.',
                key: const Key('detail-error'),
              ),
            )
          : ListView(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
              children: [
                Text(
                  order.id,
                  key: const Key('order-id'),
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w800,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  statusLabel(order.status),
                  key: const Key('order-status'),
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  order.status,
                  key: const Key('order-status-code'),
                  style: const TextStyle(color: AppColors.muted, fontSize: 12),
                ),
                const SizedBox(height: 18),
                _AddressBlock(label: 'Jemput', address: order.pickupAddress),
                const SizedBox(height: 10),
                _AddressBlock(label: 'Antar', address: order.deliveryAddress),
                const SizedBox(height: 16),
                for (final item in order.items)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Text(
                      '${item.name} · ${item.weightKg} kg · ${formatRupiah(item.subtotal)}',
                      style: const TextStyle(fontSize: 13),
                    ),
                  ),
                Text(
                  formatRupiah(order.totalPrice),
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    color: AppColors.primaryDark,
                  ),
                ),
                const SizedBox(height: 20),
                const Text(
                  'Foto bukti',
                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                ),
                const SizedBox(height: 8),
                if (order.proofPhotoUrl != null &&
                    order.proofPhotoUrl!.isNotEmpty) ...[
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(
                      order.proofPhotoUrl!,
                      height: 180,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (_, _, _) => const SizedBox.shrink(),
                    ),
                  ),
                  const SizedBox(height: 8),
                  SelectableText(
                    order.proofPhotoUrl!,
                    key: const Key('proof-photo-url'),
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 11,
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
                if (_proofMessage != null) ...[
                  Text(
                    _proofMessage!,
                    key: const Key('proof-upload-success'),
                    style: const TextStyle(
                      color: AppColors.primaryDark,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                ],
                OutlinedButton.icon(
                  key: const Key('pick-proof-photo'),
                  onPressed: _uploading ? null : _pickAndUploadProof,
                  icon: _uploading
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.photo_library_outlined),
                  label: Text(
                    _uploading
                        ? 'Mengunggah...'
                        : 'Pilih foto bukti dari galeri',
                  ),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 16),
                  ErrorBanner(message: _error!),
                ],
                const SizedBox(height: 20),
                if (next != null)
                  PrimaryButton(
                    key: const Key('advance-status'),
                    label: advanceButtonLabel(next),
                    loading: _saving,
                    onPressed: _advance,
                  )
                else
                  const Text(
                    'Tidak ada langkah status berikutnya.',
                    key: Key('advance-unavailable'),
                    style: TextStyle(color: AppColors.muted, fontSize: 13),
                  ),
              ],
            ),
    );
  }
}

class _AddressBlock extends StatelessWidget {
  const _AddressBlock({required this.label, required this.address});

  final String label;
  final String address;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 11,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 4),
          Text(address, style: const TextStyle(fontSize: 14, height: 1.35)),
        ],
      ),
    );
  }
}
