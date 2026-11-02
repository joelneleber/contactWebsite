# Warm Workshop Implementation Plan

**Goal:** Apply the user-approved warm workshop mockup: continuous oak counters, olive cabinets, cream walls, clear window, restrained warm lighting and purposeful stations.
**Architecture:** Preserve the existing Three.js interactions and equipment coordinates; rebuild noninteractive architecture in a derived Blender scene, export the same named interactive mesh groups, and simplify runtime furnishings.
**Tech stack:** Blender Python, Three.js, esbuild, glTF Meshopt.
**Spec:** Approved warm workshop image in conversation (oak, olive, calmer layout).

- [x] Derive a new scene from browser-v13, retaining original. Replace noisy materials and cabinet grids, clear window/ceiling clutter, preserve interactive equipment positions.
- [x] Simplify runtime decor and align lighting, bundle and export compressed scene into this isolated release worktree.
- [x] Verify desktop and portrait room, wood/lab/software navigation, model load, console errors and static links. Inspect review screenshots.

Review focus: screen alignment; CNC/printer animation groups; pets and project access; portrait framing; material readability and texture seams.

Execution: inline under existing user authorization. Visual/material changes verified with scene assertions and actual browser previews; no implementation-mirroring tests. Source retained alongside packaged runtime for reproducibility.

## Verification results

Full Blender export + Meshopt/WebP build succeeded. Final room asset: 2,057,352 bytes. Static HTML asset checks, loader size check, interactive glTF zone/screen checks, JavaScript syntax checks and first-party git whitespace check pass. Browser review at 1600×900 and 390×844: room loads, no missing resources, no horizontal overflow on phone, and no console errors or warnings. Woodshop, electronics and software navigation checked; all three pets and seven moving mesh groups remain.

Independent read-only review caught a stale build path; fixed with `source/scripts/build-warm.sh`. Removed upper cabinet overlap with the tool rack, orphaned drawer labels, decorative monitor overlays and redundant monitor arms during visual review.

Known build warning: pre-existing duplicate case in vendored html2canvas (bundle succeeds). Preview-only auto refresh served by `source/preview.py`; live site unchanged. Source and derived Blender scene retained in isolated `warm-workshop` branch.
