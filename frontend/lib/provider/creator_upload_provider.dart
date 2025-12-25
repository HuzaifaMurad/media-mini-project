import 'package:flutter/foundation.dart';
import '../api/media_api.dart';
import '../api/api_config.dart';

class CreatorUploadProvider extends ChangeNotifier {
  final MediaApi api;
  CreatorUploadProvider(this.api);

  bool isUploading = false;
  String? error;

  Future<void> upload({
    required String title,
    required String caption,
    required String location,
    required List<String> people,
    required String fileName,
    required String contentType,
    required List<int> bytes,
  }) async {
    isUploading = true;
    error = null;
    notifyListeners();

    try {
      // 1) create draft
      final created = await api.createMediaDraft(
        title: title,
        caption: caption,
        location: location,
        people: people,
        fileName: fileName,
        contentType: contentType,
      );

      final id = created['id'] as String;
      final upload = created['upload'] as Map<String, dynamic>;
      final blobUrl = upload['blobUrl'] as String;
      final uploadUrl = upload['uploadUrl'] as String;

      // blobName is last part of blobUrl
      final blobName = Uri.parse(blobUrl).pathSegments.last;

      // 2) upload bytes
      if (ApiConfig.isLocalDev) {
        await api.uploadLocalBlob(
          blobName: blobName,
          bytes: bytes,
          contentType: contentType,
        );
      } else {
        // Production SAS upload will be added in Step 16 (deployment hardening)
        await api.uploadToSasUrl(
          uploadUrl: uploadUrl,
          bytes: bytes,
          contentType: contentType,
        );

        throw Exception(
          'Production upload not enabled yet. Set isLocalDev=true for now.',
        );
      }

      // 3) finalize
      await api.finalizeMedia(id);
    } catch (e) {
      error = e.toString();
    } finally {
      isUploading = false;
      notifyListeners();
    }
  }
}
