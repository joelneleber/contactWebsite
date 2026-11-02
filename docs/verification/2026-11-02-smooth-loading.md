# First-use camera paths and loading animation

User reports Firefox stalls only on new paths. The former warmup selected one object per material and left frustum culling enabled, missing geometry and textures outside the starting view.

The release compiles all materials with compileAsync, then draws every visible renderable in bounded batches with frustum culling temporarily disabled. Original visibility/culling is restored in finally. Invisible labels no longer trigger measurements and SVG rewrites during transitions. Scope and hose updates run at 20 Hz while camera movement remains display-synchronized. Fixed-size monitor captures are no longer rebuilt on resize.

The loading sketch runs on an OffscreenCanvas worker when supported, retaining the existing canvas renderer as a compatibility fallback. A CSS transform animation supplies first-paint activity before JavaScript and sketch data arrive. The worker terminates when the loader closes.

Validation in BrowserOS: a deliberate 600 ms main-thread block still produced 78 worker frames (including startup and 40 ms drain), advancing the drawing from 0 to 0.484. First visits room→wood→lab→room compiled zero new programs; measured frame p95 9.3 ms, max 9.4 ms on this machine. This is not a benchmark of the reported Firefox PC. CPU throttling is unavailable in the connected browser tool. Build, scene asset verification, camera route checks, and JavaScript syntax checks passed.

### Connected transitions
- Monitor boot traces edges from the actual 1920×1080 desktop snapshot at half-resolution, then blends into that same image. Removed unrelated placeholder rectangles.
- Project sheets and software case studies animate in/out; reduced-motion skips these animations.
- Book closing keeps its textures until the cover finishes its 650 ms motion. Browser frame samples measured 3.142 → 1.934 → 0 radians over 104 samples.
- Added a two-mesh desk business card that lifts toward the current camera in 740 ms before opening a native contact dialog. Software's full-screen surface opens the dialog directly. Contact remains in the room; the standalone page still works.
- Browser verified embedded contact open, QR toggle, close/return, completed monitor boot, and lamp expansion (animation active, four images present).
- Bundle build, warm asset verifier, camera-path checks, syntax and whitespace checks passed. Existing upstream html2canvas duplicate-case warning remains.
