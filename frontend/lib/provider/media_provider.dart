import 'package:flutter/foundation.dart';
import '../api/media_api.dart';
import '../models/media_item.dart';

class MediaProvider extends ChangeNotifier {
  final MediaApi api;
  MediaProvider(this.api);

  bool isLoading = false;
  String query = '';
  List<MediaItem> items = [];
  String? error;

  Future<void> load({String? newQuery}) async {
    isLoading = true;
    error = null;
    if (newQuery != null) query = newQuery;
    notifyListeners();

    try {
      items = await api.listMedia(query: query);
    } catch (e) {
      error = e.toString();
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }
}
