class RatingSummary {
  final double avg;
  final int count;

  RatingSummary({required this.avg, required this.count});

  factory RatingSummary.fromJson(Map<String, dynamic> json) {
    return RatingSummary(
      avg: (json['avg'] is int) ? (json['avg'] as int).toDouble() : (json['avg'] as num?)?.toDouble() ?? 0.0,
      count: json['count'] ?? 0,
    );
  }

  static RatingSummary empty() => RatingSummary(avg: 0.0, count: 0);
}
