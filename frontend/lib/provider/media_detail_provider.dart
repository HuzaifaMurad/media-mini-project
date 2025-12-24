import 'package:flutter/foundation.dart';
import '../api/media_api.dart';
import '../models/media_item.dart';
import '../models/comment.dart';
import '../models/rating_summary.dart';

class MediaDetailProvider extends ChangeNotifier {
  final MediaApi api;
  MediaDetailProvider(this.api);

  bool isLoading = false;
  String? error;

  MediaItem? item;
  List<CommentItem> comments = [];
  RatingSummary rating = RatingSummary.empty();

  Future<void> load(String id) async {
    isLoading = true;
    error = null;
    notifyListeners();

    try {
      item = await api.getMedia(id);
      comments = await api.listComments(id);
      rating = await api.getRatingSummary(id);
    } catch (e) {
      error = e.toString();
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}
