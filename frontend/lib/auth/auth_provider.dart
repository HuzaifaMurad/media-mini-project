import 'package:flutter/foundation.dart';
import 'auth_service.dart';
import 'auth_state.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _service;

  AuthState state = AuthState.unauthenticated;
  bool isLoading = false;

  AuthProvider(this._service);

  Future<void> load() async {
    isLoading = true;
    notifyListeners();

    try {
      state = await _service.fetchMe();
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}
