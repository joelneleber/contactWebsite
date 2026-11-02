# Coherent viewers and bench layout

Requested: review every scene label and all viewer interfaces against the warm workshop; turn toward the side benches less fully; bring the microscope/board forward and central with two connected scope channels; organize the tool wall and compact the clamps; fix book top-left clipping. Additional steering: books on the top bookshelf, bigger whiteboard, relocated filament.

Implementation:
- Warm paper surfaces, olive controls and quiet brass accents shared across scene labels, dock, settings/help, book controls, workstation galleries, story readers, chapter navigation and software desktop/windows.
- Object-specific label offsets with current anchors for moved books. Keep the computer callout prominent. Verify legibility and collisions at desktop and phone sizes.
- Side overview camera azimuths reduced from 90° to 72° (80% of a quarter turn), preserving their workstation focus.
- Microscope/PCB assembly moved 0.34 toward aisle and 0.22 toward rear relative to the previous placement; separate scope cables terminate at two explicit PCB test pads with probes lifted clear of the base.
- Six aligned chisels on one rack; hammer, square and saw in separate slots; seven clamps compacted to a 1.2-wide row close to the wall.
- Books moved onto the main upper shelf; former book shelf removed; whiteboard enlarged to 1.70 × 1.20; filament in a countertop cradle beside the printer. Small palm moved to the upper shelf.
- Book clipping was the rectangular hover wash on perspective page hitboxes; remove that wash while retaining page clicks and side arrows.

Validation: full model export/build, asset/model checks, reviewer clearance audit, desktop/phone visual and interaction checks for room, side benches, book, reading panel and software.

Follow-up refinement: reuse the live scene's scanned worn-wood diffuse/roughness/normal maps with a walnut tint; share the diffuse map with runtime trim, shelves and stool. Replace the software bubble with a compact attached tab. Resolve legacy CSS specificity conflicts throughout paper panels, dock, chapter controls and software. Hide corner help/settings in detail views. Lamp and welcome-sign panels show a gallery immediately with a top Expand project control. Add missing reader typography and inline project photos; lead software case studies with imagery. Initialize chapter navigation on first render.

Verified: optimized model 1,986,928 bytes, 65 mesh groups, all interactive zones and desktop-screen metadata retained; no missing HTML assets; git diff whitespace check passes. Desktop room, both benches, software desktop/window, lamp gallery/expanded reader and book visually inspected. All four lamp photos load inline. Phone reader fits 390×844 without horizontal overflow, and help/settings are hidden in detail views. Existing vendored html2canvas duplicate-case build warning remains.
