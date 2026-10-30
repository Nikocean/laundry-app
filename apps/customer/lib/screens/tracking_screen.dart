import 'package:flutter/material.dart';
import 'package:laundry_customer/models/laundry_order.dart';
import 'package:laundry_customer/services/api_exception.dart';
import 'package:laundry_customer/session.dart';
import 'package:laundry_customer/theme/app_colors.dart';
import 'package:laundry_customer/widgets/form_widgets.dart';

class TrackingScreen extends StatefulWidget {
  const TrackingScreen({super.key, required this.session, required this.orderId});

  final Session session;
  final String orderId;

  @override
  State<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends State<TrackingScreen> {
  LaundryOrder? _order;
  String? _error;
  bool _loading = true;
  bool _cancelling = false;
  String _source = 'rest';

  @override
  void initState() {
    super.initState();
    widget.session.realtime.addListener(_onLive);
    _load();
  }

  @override
  void dispose() {
    widget.session.realtime.removeListener(_onLive);
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final order = await widget.session.getOrder(widget.orderId);
      widget.session.realtime.watch([order.id]);
      if (!mounted) return;
      final live = widget.session.realtime.statusFor(order.id);
      setState(() {
        _order = live == null ? order : order.copyWith(status: live);
        _source = live == null ? 'rest' : 'socket';
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
        _error = 'Gagal memuat pesanan.';
        _loading = false;
      });
    }
  }

  void _onLive() {
    final order = _order;
    if (!mounted || order == null) return;
    final live = widget.session.realtime.statusFor(order.id);
    if (live == null || live == order.status) {
      setState(() {});
      return;
    }
    setState(() {
      _order = order.copyWith(status: live);
      _source = 'socket';
    });
  }

  Future<void> _cancel() async {
    final order = _order;
    if (order == null || _cancelling) return;
    setState(() {
      _cancelling = true;
      _error = null;
    });
    try {
      await widget.session.cancelOrder(order.id);
    } on ApiException catch (error) {
      if (mounted) setState(() => _error = error.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Gagal membatalkan pesanan.');
    } finally {
      if (mounted) setState(() => _cancelling = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final realtime = widget.session.realtime;
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          'Lacak pesanan',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Center(child: _LiveChip(state: realtime.state)),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _order == null
          ? ListView(
              children: [
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Text(_error ?? 'Pesanan tidak ditemukan.', key: const Key('track-error')),
                ),
              ],
            )
          : RefreshIndicator(
              color: AppColors.primary,
              onRefresh: _load,
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
                children: [
                  if (realtime.isJoined(widget.orderId))
                    const Padding(
                      padding: EdgeInsets.only(bottom: 8),
                      child: Text(
                        'Terhubung ke pesanan ini',
                        key: Key('socket-joined'),
                        style: TextStyle(color: AppColors.primaryDark, fontSize: 12, fontWeight: FontWeight.w700),
                      ),
                    ),
                  Text(
                    _source == 'socket' ? 'Diperbarui langsung' : 'Menunggu pembaruan langsung',
                    key: const Key('status-source'),
                    style: const TextStyle(color: AppColors.muted, fontSize: 12),
                  ),
                  const SizedBox(height: 8),
                  _Summary(order: _order!),
                  const SizedBox(height: 12),
                  _Timeline(status: _order!.status),
                  if (_error != null) ...[
                    const SizedBox(height: 12),
                    ErrorBanner(message: _error!),
                  ],
                  if (_order!.status == 'pending') ...[
                    const SizedBox(height: 16),
                    PrimaryButton(
                      key: const Key('cancel-order'),
                      label: 'Batalkan pesanan',
                      loading: _cancelling,
                      onPressed: _cancel,
                    ),
                  ],
                ],
              ),
            ),
    );
  }
}

class _LiveChip extends StatelessWidget {
  const _LiveChip({required this.state});

  final String state;

  @override
  Widget build(BuildContext context) {
    final live = state == 'connected';
    final label = switch (state) {
      'connected' => 'Live',
      'connecting' => 'Menyambung',
      'error' => 'Terputus',
      _ => 'Offline',
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: live ? const Color(0xFFE7F3EF) : AppColors.sand,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: live ? AppColors.primary : AppColors.line),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: live ? AppColors.primaryDark : AppColors.muted,
          fontSize: 12,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

class _Summary extends StatelessWidget {
  const _Summary({required this.order});

  final LaundryOrder order;

  @override
  Widget build(BuildContext context) {
    final itemName = order.items.isEmpty ? 'Laundry' : order.items.first.name;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  order.id,
                  key: const Key('track-order-id'),
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w800,
                    fontSize: 13,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                order.status,
                key: const Key('track-status'),
                style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.ink),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(statusLabel(order.status), style: const TextStyle(color: AppColors.muted, fontSize: 12)),
          const SizedBox(height: 10),
          Text(itemName, style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          Text('Jemput: ${order.pickupAddress}', style: const TextStyle(color: AppColors.muted, fontSize: 12)),
          const SizedBox(height: 2),
          Text('Antar: ${order.deliveryAddress}', style: const TextStyle(color: AppColors.muted, fontSize: 12)),
          const SizedBox(height: 10),
          Text(
            formatRupiah(order.totalPrice),
            style: const TextStyle(color: AppColors.primaryDark, fontWeight: FontWeight.w800, fontSize: 16),
          ),
        ],
      ),
    );
  }
}

class _Timeline extends StatelessWidget {
  const _Timeline({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final cancelled = status == 'cancelled';
    final current = statusStageIndex(status);
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Status pengerjaan',
            style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.ink),
          ),
          if (cancelled) ...[
            const SizedBox(height: 10),
            const Text(
              'Pesanan dibatalkan.',
              key: Key('track-cancelled'),
              style: TextStyle(color: Color(0xFF8A3A32), fontWeight: FontWeight.w700),
            ),
          ],
          const SizedBox(height: 8),
          for (var index = 0; index < orderStages.length; index++)
            _StageRow(
              stage: orderStages[index],
              reached: !cancelled && current >= index,
              current: !cancelled && current == index,
              last: index == orderStages.length - 1,
            ),
        ],
      ),
    );
  }
}

class _StageRow extends StatelessWidget {
  const _StageRow({
    required this.stage,
    required this.reached,
    required this.current,
    required this.last,
  });

  final OrderStage stage;
  final bool reached;
  final bool current;
  final bool last;

  @override
  Widget build(BuildContext context) {
    final color = current ? AppColors.primary : reached ? const Color(0xFF4C9A5B) : AppColors.line;
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 28,
            child: Column(
              children: [
                Container(
                  width: 22,
                  height: 22,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: reached ? color : AppColors.sand,
                    shape: BoxShape.circle,
                    border: Border.all(color: color, width: current ? 2 : 1),
                  ),
                  child: Text(
                    reached && !current ? '✓' : '${orderStages.indexOf(stage) + 1}',
                    style: TextStyle(
                      color: reached ? Colors.white : AppColors.muted,
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                if (!last)
                  Expanded(
                    child: Container(width: 2, color: reached ? color : AppColors.line),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    stage.label,
                    style: TextStyle(
                      fontWeight: current ? FontWeight.w800 : FontWeight.w600,
                      color: reached ? AppColors.ink : AppColors.muted,
                    ),
                  ),
                  Text(stage.detail, style: const TextStyle(color: AppColors.muted, fontSize: 12)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
