import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class AuthButtons extends StatelessWidget {
  const AuthButtons({super.key});

  Future<void> _open(String path) async {
    final uri = Uri.parse(path);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      throw Exception('Could not open $path');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        ElevatedButton(
          onPressed: () => _open('/.auth/login/aad'),
          child: const Text('Login'),
        ),
        const SizedBox(width: 12),
        OutlinedButton(
          onPressed: () => _open('/.auth/logout'),
          child: const Text('Logout'),
        ),
      ],
    );
  }
}
