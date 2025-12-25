import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:provider/provider.dart';
import 'package:sass_cw2/provider/creator_upload_provider.dart';


class CreatorUploadPage extends StatefulWidget {
  const CreatorUploadPage({super.key});

  @override
  State<CreatorUploadPage> createState() => _CreatorUploadPageState();
}

class _CreatorUploadPageState extends State<CreatorUploadPage> {
  final _title = TextEditingController();
  final _caption = TextEditingController();
  final _location = TextEditingController();
  final _people = TextEditingController();

  PlatformFile? selectedFile;
  List<int>? bytes;
  String? contentType;

  Future<void> pickImage() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.image,
      withData: true,
    );

    if (result == null || result.files.isEmpty) return;

    final f = result.files.first;
    setState(() {
      selectedFile = f;
      bytes = f.bytes;
      contentType = _guessContentType(f.name);
    });
  }

  String _guessContentType(String fileName) {
    final lower = fileName.toLowerCase();
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    return 'image/jpeg';
  }

  @override
  void dispose() {
    _title.dispose();
    _caption.dispose();
    _location.dispose();
    _people.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final vm = context.watch<CreatorUploadProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Creator Upload')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(controller: _title, decoration: const InputDecoration(labelText: 'Title *')),
          const SizedBox(height: 12),
          TextField(controller: _caption, decoration: const InputDecoration(labelText: 'Caption')),
          const SizedBox(height: 12),
          TextField(controller: _location, decoration: const InputDecoration(labelText: 'Location')),
          const SizedBox(height: 12),
          TextField(
            controller: _people,
            decoration: const InputDecoration(labelText: 'People (comma separated)'),
          ),
          const SizedBox(height: 16),

          OutlinedButton.icon(
            onPressed: vm.isUploading ? null : pickImage,
            icon: const Icon(Icons.image),
            label: Text(selectedFile == null ? 'Pick image' : 'Picked: ${selectedFile!.name}'),
          ),

          const SizedBox(height: 16),

          if (vm.error != null)
            Text(vm.error!, style: const TextStyle(color: Colors.red)),

          ElevatedButton(
            onPressed: vm.isUploading
                ? null
                : () async {
                    if (bytes == null || selectedFile == null) return;
                    if (_title.text.trim().isEmpty) return;

                    final people = _people.text
                        .split(',')
                        .map((e) => e.trim())
                        .where((e) => e.isNotEmpty)
                        .toList();

                    await context.read<CreatorUploadProvider>().upload(
                          title: _title.text.trim(),
                          caption: _caption.text.trim(),
                          location: _location.text.trim(),
                          people: people,
                          fileName: selectedFile!.name,
                          contentType: contentType ?? 'image/jpeg',
                          bytes: bytes!,
                        );

                    if (mounted && context.read<CreatorUploadProvider>().error == null) {
                      Navigator.pop(context);
                    }
                  },
            child: vm.isUploading
                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('Upload & Publish'),
          ),
        ],
      ),
    );
  }
}
