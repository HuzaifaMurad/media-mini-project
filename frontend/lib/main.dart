import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:sass_cw2/provider/media_provider.dart';
import 'auth/auth_provider.dart';
import 'auth/auth_service.dart';
import 'home_shell.dart';
import 'api/media_api.dart';


void main() {
  const apiBaseUrl = 'http://localhost:7071/api'; // change to deployed later

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthProvider(AuthService(apiBaseUrl))..load(),
        ),
        ChangeNotifierProvider(
          create: (_) => MediaProvider(MediaApi())..load(),
        ),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Media Mini Project',
      home: const HomeShell(),
    );
  }
}
