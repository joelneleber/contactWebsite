#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
cd "$ROOT"
# Supply the original editable scene to rebuild geometry; omit to rebundle JS only.
if [ "$#" -gt 0 ]; then
 BLENDER_BIN=${BLENDER_BIN:-/Applications/Blender.app/Contents/MacOS/Blender}
 "$BLENDER_BIN" --background "$1" --python source/scene/redesign_warm.py
 "$BLENDER_BIN" --background source/scene/warm-workshop.blend --python source/scene/export_warm.py
 npx --yes @gltf-transform/cli@4.2.1 optimize assets/cockpit/command-center-warm-raw.glb assets/cockpit/command-center-warm-compressed.glb --compress meshopt --texture-compress webp --texture-size 1024 --join false --palette false --simplify false --instance false
 mv assets/cockpit/command-center-warm-compressed.glb assets/cockpit/command-center-warm.glb
fi
python3 - <<'PY'
from pathlib import Path
import re
p=Path('source/cockpit.js');s=p.read_text();size=Path('assets/cockpit/command-center-warm.glb').stat().st_size
s,n=re.subn(r'ROOM_MODEL_BYTES=\d+',f'ROOM_MODEL_BYTES={size}',s);assert n==1
p.write_text(s);print(f'Warm room model: {size:,} bytes')
PY
npx --yes esbuild@0.25.12 source/cockpit.js --bundle --minify --format=esm --alias:three=./source/vendor/three.module.js --outfile=cockpit.bundle.js
