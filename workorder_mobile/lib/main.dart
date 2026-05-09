import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import 'dart:convert';
import 'package:http/http.dart' as http;

// 🔥 Local notification instance
final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();

// 🔥 Background handler
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  print("🔥 Background message: ${message.messageId}");
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp();

  // 🔥 Initialize local notifications (COMPATIBLE VERSION)
  const AndroidInitializationSettings initializationSettingsAndroid =
      AndroidInitializationSettings('@mipmap/ic_launcher');

  const InitializationSettings initializationSettings = InitializationSettings(
    android: initializationSettingsAndroid,
  );

  // ✅ NO EXTRA PARAMS
  await flutterLocalNotificationsPlugin.initialize(initializationSettings);

  // 🔥 Create channel
  const AndroidNotificationChannel channel = AndroidNotificationChannel(
    'high_importance_channel',
    'High Importance Notifications',
    importance: Importance.max,
  );

  await flutterLocalNotificationsPlugin
      .resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin
      >()
      ?.createNotificationChannel(channel);

  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(debugShowCheckedModeBanner: false, home: WebApp());
  }
}

class WebApp extends StatefulWidget {
  const WebApp({super.key});

  @override
  State<WebApp> createState() => _WebAppState();
}

class _WebAppState extends State<WebApp> {
  bool isLoading = true;
  String? fcmToken;
  String? userId;
  String? role;

  InAppWebViewController? webViewController;

  @override
  void initState() {
    super.initState();
    initFirebase();
  }

  // 🔥 Firebase setup
  Future<void> initFirebase() async {
    FirebaseMessaging messaging = FirebaseMessaging.instance;

    await messaging.requestPermission();

    fcmToken = await messaging.getToken();
    print("🔥 MOBILE TOKEN: $fcmToken");

    // 🔥 FOREGROUND POPUP (COMPATIBLE VERSION)
    FirebaseMessaging.onMessage.listen((RemoteMessage message) async {
      print("🔥 Foreground message received");

      final notification = message.notification;

      if (notification != null) {
        await flutterLocalNotificationsPlugin.show(
          0, // id
          notification.title ?? "New Notification",
          notification.body ?? "",
          const NotificationDetails(
            android: AndroidNotificationDetails(
              'high_importance_channel',
              'High Importance Notifications',
              importance: Importance.max,
              priority: Priority.high,
            ),
          ),
        );
      }
    });

    // 🔥 Notification click
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      final route = message.data['route'];

      if (route != null && webViewController != null) {
        webViewController!.evaluateJavascript(
          source: "window.handlePushNavigation('$route')",
        );
      }
    });
  }

  // 🔥 Send token
  Future<void> sendTokenToBackend() async {
    if (fcmToken == null || userId == null) return;

    await http.post(
      Uri.parse("https://7pkhvg3q-5000.inc1.devtunnels.ms/api/save_token"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "user_id": userId,
        "fcm_token": fcmToken,
        "device_type": "android",
        "role": role ?? "INDIVIDUAL",
      }),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          InAppWebView(
            initialUrlRequest: URLRequest(
              url: WebUri("https://onboarding-frontend-two.vercel.app/?source=apk"),
            ),
            initialSettings: InAppWebViewSettings(
              javaScriptEnabled: true,
              allowFileAccessFromFileURLs: true,
              allowUniversalAccessFromFileURLs: true,
            ),

            onWebViewCreated: (controller) {
              webViewController = controller;

              controller.addJavaScriptHandler(
                handlerName: 'sendUserToFlutter',
                callback: (args) async {
                  userId = args[0].toString();
                  role = args.length > 1 ? args[1] : "INDIVIDUAL";
                  await sendTokenToBackend();
                },
              );
            },

            onLoadStop: (controller, url) {
              setState(() => isLoading = false);
            },
          ),

          if (isLoading) const Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }
}
