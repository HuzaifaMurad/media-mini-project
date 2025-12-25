import 'package:flutter/material.dart';

class CommentInput extends StatefulWidget {
  final Future<void> Function(String) onSubmit;

  const CommentInput({super.key, required this.onSubmit});

  @override
  State<CommentInput> createState() => _CommentInputState();
}

class _CommentInputState extends State<CommentInput> {
  final _controller = TextEditingController();
  bool _loading = false;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: _controller,
            decoration: const InputDecoration(
              hintText: 'Add a comment...',
            ),
          ),
        ),
        _loading
            ? const Padding(
                padding: EdgeInsets.symmetric(horizontal: 12),
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : IconButton(
                icon: const Icon(Icons.send),
                onPressed: () async {
                  final text = _controller.text.trim();
                  if (text.isEmpty) return;

                  setState(() => _loading = true);
                  await widget.onSubmit(text);
                  _controller.clear();
                  setState(() => _loading = false);
                },
              ),
      ],
    );
  }
}
