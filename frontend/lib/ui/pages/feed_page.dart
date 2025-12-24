import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:sass_cw2/provider/media_provider.dart';
import '../widgets/media_grid.dart';
import '../widgets/search_bar.dart';

class FeedPage extends StatelessWidget {
  const FeedPage({super.key});

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<MediaProvider>();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: SearchBarWidget(
            initialValue: vm.query,
            onSearch: (q) => context.read<MediaProvider>().load(newQuery: q),
          ),
        ),
        Expanded(
          child: vm.isLoading
              ? const Center(child: CircularProgressIndicator())
              : vm.error != null
                  ? Center(child: Text(vm.error!))
                  : MediaGrid(items: vm.items),
        ),
      ],
    );
  }
}
