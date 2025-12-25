import 'package:flutter/material.dart';

class StarRating extends StatelessWidget {
  final int current;
  final void Function(int) onSelect;

  const StarRating({
    super.key,
    required this.current,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(5, (i) {
        final value = i + 1;
        return IconButton(
          icon: Icon(
            value <= current ? Icons.star : Icons.star_border,
            color: Colors.amber,
          ),
          onPressed: () => onSelect(value),
        );
      }),
    );
  }
}
