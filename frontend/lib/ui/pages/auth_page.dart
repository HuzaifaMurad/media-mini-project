import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:sass_cw2/auth/auth_button.dart';
import '../../auth/auth_provider.dart';
class AuthPage extends StatelessWidget {
  const AuthPage({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Sign in')),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 420),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: auth.isLoading
                  ? const Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        CircularProgressIndicator(),
                        SizedBox(height: 12),
                        Text('Checking session...'),
                      ],
                    )
                  : Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          auth.state.isAuthenticated ? 'You are signed in' : 'Welcome',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          auth.state.isAuthenticated
                              ? 'User: ${auth.state.userId ?? "-"}'
                              : 'Sign in to comment, rate, and (if Creator) upload media.',
                        ),
                        const SizedBox(height: 12),

                        if (auth.state.isAuthenticated) ...[
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              Chip(label: Text('Roles: ${auth.state.roles.join(", ")}')),
                              if (auth.state.isCreator)
                                const Chip(label: Text('Creator'), backgroundColor: Colors.greenAccent),
                              if (!auth.state.isCreator)
                                const Chip(label: Text('Consumer')),
                            ],
                          ),
                          const SizedBox(height: 12),
                          const AuthButtons(), // shows Logout too
                          const SizedBox(height: 12),
                          ElevatedButton(
                            onPressed: () {
                              Navigator.pop(context);
                            },
                            child: const Text('Continue to app'),
                          ),
                        ] else ...[
                          const AuthButtons(), // shows Login
                          const SizedBox(height: 12),
                          OutlinedButton(
                            onPressed: () => context.read<AuthProvider>().load(),
                            child: const Text('Refresh login status'),
                          ),
                        ],
                      ],
                    ),
            ),
          ),
        ),
      ),
    );
  }
}
