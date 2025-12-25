import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:sass_cw2/provider/media_detail_provider.dart';

import '../../api/media_api.dart';
import '../widgets/star_rating.dart';
import '../widgets/comment_input.dart';

class MediaDetailPage extends StatelessWidget {
  final String id;
  const MediaDetailPage({super.key, required this.id});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => MediaDetailProvider(MediaApi())..load(id),
      child: const _Body(),
    );
  }
}

class _Body extends StatelessWidget {
  const _Body();

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<MediaDetailProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Details')),
      body:
          vm.isLoading
              ? const Center(child: CircularProgressIndicator())
              : vm.error != null
              ? Center(child: Text(vm.error!))
              : vm.item == null
              ? const Center(child: Text('Not found'))
              : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: Image.network(vm.item!.blobUrl),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      vm.item!.title,
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    if (vm.item!.caption.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Text(vm.item!.caption),
                    ],
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        if (vm.item!.location.isNotEmpty)
                          Chip(label: Text(vm.item!.location)),
                        ...vm.item!.people.map((p) => Chip(label: Text(p))),
                      ],
                    ),
                  //  const SizedBox(height: 12),
                    // Text('Rating: ${vm.rating.avg} (${vm.rating.count})'),
                    // const SizedBox(height: 16),
                    // Text('Comments', style: Theme.of(context).textTheme.titleMedium),
                    // const SizedBox(height: 8),
                    // if (vm.comments.isEmpty)
                    //   const Text('No comments yet.')
                    // else
                    //   ...vm.comments.map((c) => ListTile(
                    //         title: Text(c.text),
                    //         subtitle: Text(c.createdAt.toLocal().toString()),
                    //       )),
                    const SizedBox(height: 12),
                    Text('Rating: ${vm.rating.avg} (${vm.rating.count})'),
                    StarRating(
                      current: vm.rating.avg.round(),
                      onSelect: (v) => vm.setRating(v),
                    ),

                    const SizedBox(height: 16),
                    Text(
                      'Comments',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),

                    CommentInput(onSubmit: (text) => vm.addComment(text)),

                    const SizedBox(height: 12),

                    if (vm.comments.isEmpty)
                      const Text('No comments yet.')
                    else
                      ...vm.comments.map(
                        (c) => ListTile(
                          title: Text(c.text),
                          subtitle: Text(c.createdAt.toLocal().toString()),
                        ),
                      ),
                  ],
                ),
              ),
    );
  }
}





