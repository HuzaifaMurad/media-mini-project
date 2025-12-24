import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:sass_cw2/auth/auth_button.dart';

import 'auth/auth_provider.dart';

import 'ui/pages/feed_page.dart';

class HomeShell extends StatelessWidget {
  const HomeShell({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Media Mini'),
        actions: const [
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 12),
            child: AuthButtons(),
          )
        ],
      ),
      body: auth.isLoading
          ? const Center(child: CircularProgressIndicator())
          : const FeedPage(),
    );
  }
}
