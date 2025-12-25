import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:sass_cw2/ui/pages/auth_page.dart';
import 'package:sass_cw2/ui/pages/creator_upload_page.dart';
import 'package:sass_cw2/auth/auth_provider.dart';
import 'package:sass_cw2/ui/pages/feed_page.dart';

class HomeShell extends StatelessWidget {
  const HomeShell({super.key});

  Future<void> _openAuthPage(BuildContext context) async {
    await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const AuthPage()),
    );

    // ✅ When user comes back (after login/logout), refresh auth state
    if (context.mounted) {
      await context.read<AuthProvider>().load();
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Media Mini'),
        actions: [
          IconButton(
            tooltip: 'Account',
            icon: Icon(auth.state.isAuthenticated ? Icons.verified_user : Icons.person),
            onPressed: () => _openAuthPage(context),
          ),
        ],
      ),

      // ✅ Proper FloatingActionButton
      floatingActionButton: auth.state.isCreator
          ? FloatingActionButton.extended(
              icon: const Icon(Icons.cloud_upload),
              label: const Text('Upload'),
              onPressed: () async {
                await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const CreatorUploadPage()),
                );

                // Optional: refresh feed after upload
                // You can call MediaProvider.load() here later if you want.
              },
            )
          : null,

      body: auth.isLoading
          ? const Center(child: CircularProgressIndicator())
          : const FeedPage(),
    );
  }
}
