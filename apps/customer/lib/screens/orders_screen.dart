import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:laundry_customer/models/laundry_order.dart';
import 'package:laundry_customer/services/api_exception.dart';
import 'package:laundry_customer/session.dart';
import 'package:laundry_customer/theme/app_colors.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key, required this.session});

  final Session session;

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  List<LaundryOrder>? _orders;
  String? _error;
  bool _loading = true;

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

  List<LaundryOrder> _applyLive(List<LaundryOrder> orders) {
    final live = widget.session.realtime.liveStatus;
    if (live.isEmpty) return orders;
    return [
      for (final order in orders)
        live[order.id] == null || live[order.id] == order.status
            ? order
            : order.copyWith(status: live[order.id]),
    ];
  }

  void _onLive() {
    final orders = _orders;
    if (!mounted || orders == null) return;
    setState(() => _orders = _applyLive(orders));
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final orders = await widget.session.listOrders();
      widget.session.realtime.watch(orders.map((order) => order.id));
      if (!mounted) return;
      setState(() {
        _orders = _applyLive(orders);
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

  @override
  Widget build(BuildContext context) {
    final orders = _orders;
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          'Pesanan saya',
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
        ),
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _load,
        child: _loading
            ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
            : _error != null
            ? ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text(_error!, key: const Key('orders-error')),
                  ),
                ],
              )
            : orders == null || orders.isEmpty
            ? ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: const [
                  Padding(
                    padding: EdgeInsets.all(24),
                    child: Text(
                      'Belum ada pesanan.',
                      key: Key('orders-empty'),
                      style: TextStyle(color: AppColors.muted),
                    ),
                  ),
                ],
              )
            : ListView.separated(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                itemCount: orders.length,
                separatorBuilder: (_, _) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final order = orders[index];
                  return OrderCard(
                    order: order,
                    index: index,
                    onTap: () => context.push('/orders/${order.id}'),
                  );
                },
              ),
      ),
    );
  }
}

class OrderCard extends StatelessWidget {
  const OrderCard({super.key, required this.order, required this.index, this.onTap});

  final LaundryOrder order;
  final int index;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final itemName = order.items.isEmpty ? 'Laundry' : order.items.first.name;
    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        key: Key('order-open-$index'),
        borderRadius: BorderRadius.circular(18),
        onTap: onTap,
        child: Container(
          key: Key('order-card-$index'),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
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
                      key: Key('order-id-$index'),
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.sand,
                      borderRadius: BorderRadius.circular(999),
                      border: Border.all(color: AppColors.line),
                    ),
                    child: Text(
                      order.status,
                      key: Key('order-status-$index'),
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: AppColors.ink,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                statusLabel(order.status),
                style: const TextStyle(color: AppColors.muted, fontSize: 12),
              ),
              const SizedBox(height: 8),
              Text(
                itemName,
                style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.ink),
              ),
              const SizedBox(height: 4),
              Text(
                order.pickupAddress,
                style: const TextStyle(color: AppColors.muted, fontSize: 12),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    formatWhen(order.createdAt),
                    style: const TextStyle(color: AppColors.muted, fontSize: 11),
                  ),
                  Text(
                    formatRupiah(order.totalPrice),
                    style: const TextStyle(
                      color: AppColors.primaryDark,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
