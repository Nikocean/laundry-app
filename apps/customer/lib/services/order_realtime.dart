import 'package:flutter/foundation.dart';
import 'package:laundry_customer/config/api_config.dart';
import 'package:laundry_customer/models/order_status_event.dart';
import 'package:laundry_customer/services/token_store.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

/// Customer Socket.io client.
/// Joins `order:{orderId}` only. `orders:all` is admin-only on the server.
class OrderRealtime extends ChangeNotifier {
  OrderRealtime(this._tokens);

  final TokenStore _tokens;

  io.Socket? _socket;
  String? _token;
  bool _closed = true;
  final _rooms = <String>{};
  final _joining = <String>{};

  String state = 'idle';
  String? errorMessage;
  final joined = <String>{};
  final liveStatus = <String, String>{};

  String? statusFor(String orderId) => liveStatus[orderId];

  bool isJoined(String orderId) => joined.contains(orderId);

  Future<void> connect() async {
    final token = await _tokens.readToken();
    if (token == null || token.isEmpty) return;
    if (_socket != null && _token == token && !_closed && state != 'error') return;

    final rooms = Set<String>.from(_rooms);
    _closeSocket();
    _rooms.addAll(rooms);
    _token = token;
    _closed = false;
    state = 'connecting';
    errorMessage = null;
    notifyListeners();

    final options = io.OptionBuilder()
        .setTransports(['websocket'])
        .disableAutoConnect()
        .setAuth({'token': token})
        .build();
    options['forceNew'] = true;
    final socket = io.io(normalizedApiBaseUrl(), options);
    _socket = socket;

    socket.onConnect((_) {
      if (_closed) return;
      state = 'connected';
      errorMessage = null;
      joined.clear();
      _joining.clear();
      for (final orderId in _rooms) {
        _emitJoin(orderId);
      }
      notifyListeners();
    });

    socket.onConnectError((dynamic error) {
      if (_closed) return;
      state = 'error';
      errorMessage = '$error';
      debugPrint('FASE_B_CONNECT_ERROR $error');
      notifyListeners();
    });

    socket.onDisconnect((_) {
      if (_closed) return;
      state = 'connecting';
      joined.clear();
      _joining.clear();
      notifyListeners();
    });

    socket.on('order:status_changed', (dynamic data) {
      final event = OrderStatusEvent.tryParse(data);
      if (event == null || _closed) return;
      liveStatus[event.orderId] = event.status;
      debugPrint('FASE_B_EVENT orderId=${event.orderId} status=${event.status}');
      notifyListeners();
    });

    socket.connect();
  }

  void watch(Iterable<String> orderIds) {
    _rooms.addAll(orderIds);
    if (state == 'connected') {
      for (final orderId in orderIds) {
        _emitJoin(orderId);
      }
    } else {
      connect();
    }
  }

  void disconnect() {
    _rooms.clear();
    liveStatus.clear();
    _closeSocket();
    _token = null;
    state = 'idle';
    errorMessage = null;
    notifyListeners();
  }

  void _emitJoin(String orderId) {
    final socket = _socket;
    if (socket == null || joined.contains(orderId) || _joining.contains(orderId)) {
      return;
    }
    _joining.add(orderId);
    socket.emitWithAck(
      'join',
      'order:$orderId',
      ack: (dynamic data) {
        _joining.remove(orderId);
        if (_closed) return;
        final ack = ackPayload(data);
        if (ack?['ok'] == true) {
          joined.add(orderId);
          debugPrint('FASE_B_JOINED orderId=$orderId');
        } else {
          errorMessage = ack?['error']?.toString() ?? 'Gagal masuk room order';
          debugPrint('FASE_B_JOIN_FAIL orderId=$orderId error=$errorMessage');
        }
        notifyListeners();
      },
    );
  }

  void _closeSocket() {
    _closed = true;
    joined.clear();
    _joining.clear();
    final socket = _socket;
    _socket = null;
    if (socket != null) {
      socket.dispose();
    }
  }
}
