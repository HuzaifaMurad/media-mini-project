import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_state.dart';

class AuthService {
  // Use your deployed API base URL later
  // For local dev: http://localhost:7071/api
  final String apiBaseUrl;

  AuthService(this.apiBaseUrl);

  Future<AuthState> fetchMe() async {
    final uri = Uri.parse('$apiBaseUrl/me');
    final res = await http.get(uri);

    if (res.statusCode != 200) {
      return AuthState.unauthenticated;
    }

    final jsonMap = json.decode(res.body) as Map<String, dynamic>;

    final isAuth = (jsonMap['isAuthenticated'] as bool?) ?? false;
    final userId = jsonMap['userId'] as String?;
    final roles = (jsonMap['roles'] as List?)?.map((e) => e.toString()).toList() ?? [];

    return AuthState(isAuthenticated: isAuth, userId: userId, roles: roles);
  }
}
