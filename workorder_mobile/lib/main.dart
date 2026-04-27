import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import 'dart:convert';
import 'package:http/http.dart' as http;

// 🔥 Background handler
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  print("🔥 Background message: ${message.messageId}");
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp();

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

  @override
  void initState() {
    super.initState();
    initFirebase();
  }

  // 🔥 Firebase setup
  Future<void> initFirebase() async {
    FirebaseMessaging messaging = FirebaseMessaging.instance;

    // 🔔 Request permission
    NotificationSettings settings = await messaging.requestPermission();
    print("🔔 Permission: ${settings.authorizationStatus}");

    // 🔥 Get token
    fcmToken = await messaging.getToken();
    print("🔥 MOBILE TOKEN: $fcmToken");

    // 🔥 Foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print("🔥 Foreground message: ${message.notification?.title}");
    });
  }

  // 🔥 Send token after OTP
  Future<void> sendTokenToBackend(String userId) async {
    if (fcmToken == null) {
      print("❌ Token is null");
      return;
    }

    try {
      print("📡 Sending token to backend...");

      final response = await http.post(
        Uri.parse(
          "https://7pkhvg3q-5000.inc1.devtunnels.ms/api/save_token",
        ), // 🔁 CHANGE THIS
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "user_id": userId,
          "fcm_token": fcmToken,
          "device_type": "android",
        }),
      );

      print("📡 Response status: ${response.statusCode}");
      print("📡 Response body: ${response.body}");

      if (response.statusCode == 200) {
        print("✅ Token saved after OTP");
      } else {
        print("❌ Failed to save token");
      }
    } catch (e) {
      print("❌ Error sending token: $e");
    }
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
              mediaPlaybackRequiresUserGesture: false,
            ),

            // 🔥 BRIDGE (IMPORTANT)
            onWebViewCreated: (controller) {
              print("🔥 WebView Created");

              controller.addJavaScriptHandler(
                handlerName: 'saveToken',
                callback: (args) async {
                  print("🔥 Handler triggered");

                  final userId = args[0];
                  print("🔥 User ID from Web: $userId");

                  await sendTokenToBackend(userId);
                },
              );
            },

            androidOnPermissionRequest: (controller, origin, resources) async {
              return PermissionRequestResponse(
                resources: resources,
                action: PermissionRequestResponseAction.GRANT,
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
