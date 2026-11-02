# Warm workshop source

The approved warm workshop is implemented in the editable Blender derivative and the Three.js modules here. The root of this checkout is the packaged site.

Run `sh source/scripts/build-warm.sh` from the checkout to update the root JS bundle and synchronize loader size with the compressed room asset.

To also rebuild geometry, pass the original scene:

```
sh source/scripts/build-warm.sh /path/to/joey-command-center-browser-v13.blend
```

Blender defaults to the installed macOS application; override `BLENDER_BIN` for other installations. Node/npm and Python 3 are required. Blender includes NumPy. Compression uses glTF Transform 4.2.1 (Meshopt + WebP) with named groups and materials preserved for interactive screens and animations.

The original Blender file stays unchanged. The derived editable file is `source/scene/warm-workshop.blend`. Raw/backup model files are excluded from version control; the deployable model is `assets/cockpit/command-center-warm.glb`.

Run `python3 source/preview.py` and open http://127.0.0.1:49312/?mode=3d#room. This local-only server reloads pages when the packaged model, bundle or CSS changes. Production HTML has no reload script.

Root HTML/CSS/entry code matches the current source workshop shell. Public project data and contact assets are retained. The site has not been deployed.
