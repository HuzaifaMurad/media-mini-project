import 'package:flutter/material.dart';

class SearchBarWidget extends StatefulWidget {
  final String initialValue;
  final void Function(String) onSearch;

  const SearchBarWidget({
    super.key,
    required this.initialValue,
    required this.onSearch,
  });

  @override
  State<SearchBarWidget> createState() => _SearchBarWidgetState();
}

class _SearchBarWidgetState extends State<SearchBarWidget> {
  late final TextEditingController _c;

  @override
  void initState() {
    super.initState();
    _c = TextEditingController(text: widget.initialValue);
  }

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: _c,
      decoration: InputDecoration(
        hintText: 'Search by title, caption, location, people...',
        prefixIcon: const Icon(Icons.search),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        suffixIcon: IconButton(
          icon: const Icon(Icons.arrow_forward),
          onPressed: () => widget.onSearch(_c.text),
        ),
      ),
      onSubmitted: widget.onSearch,
    );
  }
}
