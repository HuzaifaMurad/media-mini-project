class MediaItem {
  final String id;
  final String title;
  final String caption;
  final String location;
  final List<String> people;
  final String blobUrl;
  final String status;
  final DateTime createdAt;

  MediaItem({
    required this.id,
    required this.title,
    required this.caption,
    required this.location,
    required this.people,
    required this.blobUrl,
    required this.status,
    required this.createdAt,
  });

  factory MediaItem.fromJson(Map<String, dynamic> json) {
    return MediaItem(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      caption: json['caption'] ?? '',
      location: json['location'] ?? '',
      people: (json['people'] as List?)?.map((e) => e.toString()).toList() ?? [],
      blobUrl: json['blobUrl'] ?? '',
      status: json['status'] ?? '',
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}
