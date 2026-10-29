import 'dart:async';
import 'dart:io' show Platform;

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:laundry_customer/services/api_client.dart';

/// Registers this device with FCM and stores the FID via PATCH /api/users/me.
/// No-ops on desktop / when Firebase is not configured for the platform.
class PushNotifications {
  PushNotifications(this._api);

  final ApiClient _api;
  bool _ready = false;
  StreamSubscription<String>? _registeredSub;

  Future<void> ensureInitialized() async {
    if (_ready) return;
    if (kIsWeb) return;
    if (!(Platform.isAndroid || Platform.isIOS)) return;

    try {
      if (Firebase.apps.isEmpty) {
        await Firebase.initializeApp();
      }
      final messaging = FirebaseMessaging.instance;
      await messaging.requestPermission(alert: true, badge: true, sound: true);
      _ready = true;
    } catch (error, stack) {
      debugPrint('FCM init skipped: $error\n$stack');
    }
  }

  Future<void> syncToken() async {
    await ensureInitialized();
    if (!_ready) return;
    try {
      final messaging = FirebaseMessaging.instance;
      await _registeredSub?.cancel();
      _registeredSub = messaging.onRegistered.listen((fid) {
        if (fid.isEmpty) return;
        _api.updateFcmToken(fid).ignore();
      });
      await messaging.register();
    } catch (error, stack) {
      debugPrint('FCM token sync failed: $error\n$stack');
    }
  }

  Future<void> clearToken() async {
    if (!_ready) return;
    try {
      await _api.updateFcmToken(null);
      await FirebaseMessaging.instance.unregister();
    } catch (error, stack) {
      debugPrint('FCM token clear failed: $error\n$stack');
    }
  }
}
