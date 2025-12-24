class AuthState {
  final bool isAuthenticated;
  final String? userId;
  final List<String> roles;

  const AuthState({
    required this.isAuthenticated,
    required this.userId,
    required this.roles,
  });

  bool get isCreator => roles.contains('Creator');
  bool get isConsumer => roles.contains('Consumer');

  static const unauthenticated = AuthState(
    isAuthenticated: false,
    userId: null,
    roles: [],
  );
}
