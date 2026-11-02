Room and software showcase refinement

- Software opens an ivory/olive editorial landing page and single full-page case study. Workshop back button remains visible, with a separate All software action that preserves landing scroll.
- Pet face anchors are recorded before static batching and follow each pet's breathing transform.
- Power supply and multimeter have routed paired leads and a small shared display atlas. All instrument displays use labSignal and the existing animation clock; reduced motion freezes the signal.
- Existing daylight intensities vary slowly; no additional lights/shadow maps were added.
- Loading blueprint is captured offline from the current scene by source/scripts/capture-blueprint.js and packed into entry.js.
- Static batching test verifies transformed bounds, shadow flags, transparency exclusion, and normalized integer geometry.

Validation: asset verifier passes, diff whitespace check passes, normalized/static geometry tests pass. Browser checked 1600x900 desktop and 390x844 emulated phone case study, no horizontal overflow or broken loaded project images. All software then Back to workshop restores overview interactivity and room view.

Earlier room benchmark at 1600x900 DPR1: 242 draw calls / median 1.7ms CPU render submission. After batching and model refinements, before adding the connected live-lab equipment: 167 calls / median 1.2ms, p95 1.7ms (40 samples). This is CPU submission timing, not GPU frame timing or a real low-end phone benchmark. Initial estimated uncompressed texture allocation fell from about 254MiB to 173MiB before the latest small display atlas; estimates are not actual GPU memory measurements. No room objects or forest texture resolution were removed.
