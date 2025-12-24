import 'dart:convert';
import 'package:http/http.dart' as http;

import '../models/media_item.dart';
import '../models/comment.dart';
import '../models/rating_summary.dart';
import 'api_config.dart';

class MediaApi {
  final _base = ApiConfig.baseUrl;

  Future<List<MediaItem>> listMedia({String query = '', int skip = 0, int take = 20}) async {
    final uri = Uri.parse('$_base/media')
        .replace(queryParameters: {
          'query': query,
          'skip': '$skip',
          'take': '$take',
        });

    final res = await http.get(uri);
    if (res.statusCode != 200) throw Exception('Failed to load media (${res.statusCode})');

    final data = json.decode(res.body) as Map<String, dynamic>;
    final items = (data['items'] as List?) ?? [];
    return items.map((e) => MediaItem.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<MediaItem> getMedia(String id) async {
    final uri = Uri.parse('$_base/media/$id');
    final res = await http.get(uri);
    if (res.statusCode != 200) throw Exception('Failed to load media details (${res.statusCode})');

    final data = json.decode(res.body) as Map<String, dynamic>;
    return MediaItem.fromJson(data['item'] as Map<String, dynamic>);
  }

  Future<List<CommentItem>> listComments(String mediaId) async {
    final uri = Uri.parse('$_base/media/$mediaId/comments');
    final res = await http.get(uri);
    if (res.statusCode != 200) throw Exception('Failed to load comments (${res.statusCode})');

    final data = json.decode(res.body) as Map<String, dynamic>;
    final items = (data['items'] as List?) ?? [];
    return items.map((e) => CommentItem.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<RatingSummary> getRatingSummary(String mediaId) async {
    final uri = Uri.parse('$_base/media/$mediaId/rating/summary');
    final res = await http.get(uri);
    if (res.statusCode != 200) return RatingSummary.empty();

    final data = json.decode(res.body) as Map<String, dynamic>;
    return RatingSummary.fromJson(data);
  }
}
