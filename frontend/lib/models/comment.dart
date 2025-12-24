class CommentItem {
  final String id;
  final String text;
  final DateTime createdAt;

  CommentItem({required this.id, required this.text, required this.createdAt});

  factory CommentItem.fromJson(Map<String, dynamic> json) {
    return CommentItem(
      id: json['id'] ?? '',
      text: json['text'] ?? '',
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}
