import 'dart:convert';
import 'package:http/http.dart' as http;

import '../models/media_item.dart';
import '../models/comment.dart';
import '../models/rating_summary.dart';
import 'api_config.dart';

class MediaApi {
  final _base = ApiConfig.baseUrl;

  Future<List<MediaItem>> listMedia({
    String query = '',
    int skip = 0,
    int take = 20,
  }) async {
    final uri = Uri.parse('$_base/media').replace(
      queryParameters: {'query': query, 'skip': '$skip', 'take': '$take'},
    );

    final res = await http.get(uri);
    if (res.statusCode != 200)
      throw Exception('Failed to load media (${res.statusCode})');

    final data = json.decode(res.body) as Map<String, dynamic>;
    final items = (data['items'] as List?) ?? [];
    return items
        .map((e) => MediaItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<MediaItem> getMedia(String id) async {
    final uri = Uri.parse('$_base/media/$id');
    final res = await http.get(uri);
    if (res.statusCode != 200)
      throw Exception('Failed to load media details (${res.statusCode})');

    final data = json.decode(res.body) as Map<String, dynamic>;
    return MediaItem.fromJson(data['item'] as Map<String, dynamic>);
  }

  Future<List<CommentItem>> listComments(String mediaId) async {
    final uri = Uri.parse('$_base/media/$mediaId/comments');
    final res = await http.get(uri);
    if (res.statusCode != 200)
      throw Exception('Failed to load comments (${res.statusCode})');

    final data = json.decode(res.body) as Map<String, dynamic>;
    final items = (data['items'] as List?) ?? [];
    return items
        .map((e) => CommentItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<RatingSummary> getRatingSummary(String mediaId) async {
    final uri = Uri.parse('$_base/media/$mediaId/rating/summary');
    final res = await http.get(uri);
    if (res.statusCode != 200) return RatingSummary.empty();

    final data = json.decode(res.body) as Map<String, dynamic>;
    return RatingSummary.fromJson(data);
  }

  Future<void> addComment(String mediaId, String text) async {
    final uri = Uri.parse('$_base/media/$mediaId/comments');
    final res = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'text': text}),
    );

    if (res.statusCode != 201) {
      throw Exception('Failed to add comment (${res.statusCode})');
    }
  }

  Future<void> setRating(String mediaId, int value) async {
    final uri = Uri.parse('$_base/media/$mediaId/rating');
    final res = await http.put(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'value': value}),
    );

    if (res.statusCode != 200) {
      throw Exception('Failed to set rating (${res.statusCode})');
    }
  }

  Future<Map<String, dynamic>> createMediaDraft({
    required String title,
    required String caption,
    required String location,
    required List<String> people,
    required String fileName,
    required String contentType,
  }) async {
    final uri = Uri.parse('$_base/media');

    final res = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'title': title,
        'caption': caption,
        'location': location,
        'people': people,
        'fileName': fileName,
        'contentType': contentType,
      }),
    );

    if (res.statusCode != 201) {
      throw Exception('Create media failed (${res.statusCode}): ${res.body}');
    }

    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  Future<void> uploadLocalBlob({
    required String blobName,
    required List<int> bytes,
    required String contentType,
  }) async {
    final uri = Uri.parse('$_base/dev/upload/$blobName');

    final res = await http.post(
      uri,
      headers: {'Content-Type': contentType},
      body: bytes,
    );

    if (res.statusCode != 200) {
      throw Exception('Local upload failed (${res.statusCode}): ${res.body}');
    }
  }

  Future<void> finalizeMedia(String id) async {
    final uri = Uri.parse('$_base/media/$id/finalize');
    final res = await http.post(uri);

    if (res.statusCode != 200) {
      throw Exception('Finalize failed (${res.statusCode}): ${res.body}');
    }
  }

  Future<void> uploadToSasUrl({
    required String uploadUrl,
    required List<int> bytes,
    required String contentType,
  }) async {
    final uri = Uri.parse(uploadUrl);

    final res = await http.put(
      uri,
      headers: {'x-ms-blob-type': 'BlockBlob', 'Content-Type': contentType},
      body: bytes,
    );

    // Azure Blob often returns 201 Created on success
    if (res.statusCode != 201 && res.statusCode != 200) {
      throw Exception('SAS upload failed (${res.statusCode}): ${res.body}');
    }
  }
}
