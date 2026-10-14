import 'package:flutter/foundation.dart';
import 'package:laundry_courier/config/api_config.dart';
import 'package:laundry_courier/models/order_assigned_event.dart';
import 'package:laundry_courier/services/token_store.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

/// Joins only `courier:{courierId}`. `orders:all` stays admin-only.
class CourierRealtime extends ChangeNotifier {
  CourierRealtime(this._tokens);

  final TokenStore _tokens;

  io.Socket? _socket;
  String? _token;
  String? _courierId;
  bool _closed = true;
  bool _joining = false;

  String state = 'idle';
  String? errorMessage;
  String? joinedRoom;

  /// orderId -> status from `order:assigned` for this courier.
  final assignments = <String, String>{};

  bool get isJoined =>
      _courierId != null && joinedRoom == 'courier:$_courierId';

  Future<void> connect(String courierId) async {
    if (courierId.isEmpty) return;
    final token = await _tokens.readToken();
    if (token == null || token.isEmpty) return;
    _courierId = courierId;
    if (_socket != null && _token == token && !_closed && state != 'error') {
      _emitJoin();
      return;
    }

    _closeSocket();
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
      joinedRoom = null;
      _joining = false;
      _emitJoin();
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
      joinedRoom = null;
      _joining = false;
      notifyListeners();
    });

    socket.on('order:assigned', (dynamic data) {
      final event = OrderAssignedEvent.tryParse(data);
      if (event == null || _closed || event.courierId != _courierId) return;
      assignments[event.orderId] = event.status;
      debugPrint(
        'FASE_B_EVENT orderId=${event.orderId} status=${event.status}',
      );
      notifyListeners();
    });

    socket.connect();
  }

  void disconnect() {
    assignments.clear();
    _courierId = null;
    _closeSocket();
    _token = null;
    state = 'idle';
    errorMessage = null;
    notifyListeners();
  }

  void _emitJoin() {
    final socket = _socket;
    final courierId = _courierId;
    if (socket == null || courierId == null || courierId.isEmpty) return;
    final room = 'courier:$courierId';
    if (joinedRoom == room || _joining) return;
    _joining = true;
    socket.emitWithAck(
      'join',
      room,
      ack: (dynamic data) {
        _joining = false;
        if (_closed) return;
        final ack = ackPayload(data);
        if (ack?['ok'] == true) {
          joinedRoom = room;
          debugPrint('FASE_B_JOINED room=$room');
        } else {
          joinedRoom = null;
          errorMessage = ack?['error']?.toString() ?? 'Gagal masuk room kurir';
          debugPrint('FASE_B_JOIN_FAIL room=$room error=$errorMessage');
        }
        notifyListeners();
      },
    );
  }

  void _closeSocket() {
    _closed = true;
    joinedRoom = null;
    _joining = false;
    final socket = _socket;
    _socket = null;
    if (socket != null) {
      socket.dispose();
    }
  }
}
