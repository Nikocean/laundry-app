import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:laundry_courier/models/laundry_order.dart';
import 'package:laundry_courier/models/status_step.dart';
import 'package:laundry_courier/services/api_exception.dart';
import 'package:laundry_courier/session.dart';
import 'package:laundry_courier/theme/app_colors.dart';

class TasksScreen extends StatefulWidget {
  const TasksScreen({super.key, required this.session});

  final Session session;

  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> {
  List<LaundryOrder>? _orders;
  String? _error;
  bool _loading = true;
  bool _ingesting = false;
  bool _ingestQueued = false;
  final _liveIds = <String>{};

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

  void _onLive() {
    if (!mounted) return;
    setState(() {});
    _ingest();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final orders = await widget.session.listMyOrders();
      if (!mounted) return;
      setState(() {
        _orders = orders;
        _loading = false;
      });
      await _ingest();
    } on ApiException catch (error) {
      if (!mounted) return;
      setState(() {
        _error = error.message;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _error = 'Gagal memuat tugas.';
        _loading = false;
      });
    }
  }

  Future<void> _ingest() async {
    if (_loading || _orders == null) return;
    if (_ingesting) {
      _ingestQueued = true;
      return;
    }
    _ingesting = true;
    try {
      final realtime = widget.session.realtime;
      final known = _orders!.map((order) => order.id).toSet();
      final missing = realtime.assignments.keys
          .where((id) => !known.contains(id))
          .toList();
      if (missing.isEmpty) {
        final next = [
          for (final order in _orders!)
            realtime.assignments[order.id] == null ||
                    realtime.assignments[order.id] == order.status
                ? order
                : order.copyWith(status: realtime.assignments[order.id]),
        ];
        final changed = [
          for (var i = 0; i < next.length; i++)
            next[i].status != _orders![i].status,
        ].any((item) => item);
        if (changed && mounted) setState(() => _orders = next);
        return;
      }

      final fetched = <LaundryOrder>[];
      for (final id in missing) {
        fetched.add(await widget.session.getOrder(id));
      }
      if (!mounted) return;
      setState(() {
        final current = _orders ?? const <LaundryOrder>[];
        _orders = [
          ...fetched.where(
            (order) => current.every((item) => item.id != order.id),
          ),
          ...current,
        ];
        _liveIds.addAll(fetched.map((order) => order.id));
      });
    } on ApiException catch (error) {
      if (mounted) setState(() => _error = error.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Gagal memuat tugas baru.');
    } finally {
      _ingesting = false;
      if (_ingestQueued) {
        _ingestQueued = false;
        await _ingest();
      }
    }
  }

  Future<void> _logout() async {
    await widget.session.logout();
  }

  @override
  Widget build(BuildContext context) {
    final orders = _orders;
    final name = widget.session.user?.name ?? 'Kurir';
    final realtime = widget.session.realtime;
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          'Tugas saya',
          key: Key('tasks-title'),
          style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
        ),
        actions: [
          if (realtime.isJoined)
            const Padding(
              padding: EdgeInsets.only(right: 4),
              child: Center(
                child: Text(
                  'Live',
                  key: Key('socket-joined'),
                  style: TextStyle(
                    color: AppColors.primary,
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ),
          IconButton(
            key: const Key('logout'),
            tooltip: 'Keluar',
            onPressed: _logout,
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _load,
        child: _loading
            ? const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              )
            : _error != null
            ? ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Text(_error!, key: const Key('tasks-error')),
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
                      'Belum ada tugas yang di-assign.',
                      key: Key('tasks-empty'),
                      style: TextStyle(color: AppColors.muted),
                    ),
                  ),
                ],
              )
            : ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                children: [
                  _CourierHeader(name: name),
                  if (_liveIds.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    const Text(
                      'Tugas baru masuk langsung',
                      key: Key('live-assignment'),
                      style: TextStyle(
                        color: AppColors.primaryDark,
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                  const SizedBox(height: 14),
                  for (final order in orders) ...[
                    TaskCard(
                      order: order,
                      onOpen: () async {
                        await context.push('/orders/${order.id}');
                        if (mounted) _load();
                      },
                    ),
                    const SizedBox(height: 12),
                  ],
                ],
              ),
      ),
    );
  }
}

class _CourierHeader extends StatelessWidget {
  const _CourierHeader({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    return Container(
      key: const Key('courier-name'),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.line),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.pedal_bike, color: Colors.white),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 15,
                  ),
                ),
                const SizedBox(height: 2),
                const Text(
                  'Order yang di-assign ke akun ini',
                  style: TextStyle(color: AppColors.muted, fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class TaskCard extends StatelessWidget {
  const TaskCard({super.key, required this.order, required this.onOpen});

  final LaundryOrder order;
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    final itemLabel = order.items.isEmpty
        ? 'Tanpa item'
        : order.items.map((item) => item.name).join(', ');
    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        key: Key('task-${order.id}'),
        borderRadius: BorderRadius.circular(16),
        onTap: onOpen,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.line),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    shortOrderId(order.id),
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w800,
                      fontSize: 13,
                      fontFamily: 'monospace',
                    ),
                  ),
                  const Spacer(),
                  _StatusChip(
                    key: Key('task-code-${order.id}-${order.status}'),
                    status: order.status,
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(
                    Icons.place_outlined,
                    size: 16,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      order.pickupAddress,
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 12,
                        height: 1.35,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 10,
                ),
                decoration: BoxDecoration(
                  color: AppColors.sand,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.line),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        itemLabel,
                        style: const TextStyle(
                          color: AppColors.muted,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    Text(
                      formatRupiah(order.totalPrice),
                      style: const TextStyle(
                        color: AppColors.primaryDark,
                        fontWeight: FontWeight.w800,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({super.key, required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final color = switch (status) {
      'washing' => AppColors.primary,
      'picked_up' => const Color(0xFF8C6600),
      'delivering' => AppColors.amber,
      'delivered' => const Color(0xFF3D7A49),
      _ => AppColors.muted,
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Text(
        statusLabel(status),
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}
