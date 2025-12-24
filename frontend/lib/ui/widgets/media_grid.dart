import 'package:flutter/material.dart';
import '../../models/media_item.dart';
import '../pages/media_detail_page.dart';

class MediaGrid extends StatelessWidget {
  final List<MediaItem> items;
  const MediaGrid({super.key, required this.items});

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const Center(child: Text('No media yet.'));
    }

    return GridView.builder(
      padding: const EdgeInsets.all(12),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1,
      ),
      itemCount: items.length,
      itemBuilder: (context, i) {
        final item = items[i];
        return InkWell(
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => MediaDetailPage(id: item.id)),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.network(item.blobUrl, fit: BoxFit.cover),
          ),
        );
      },
    );
  }
}
