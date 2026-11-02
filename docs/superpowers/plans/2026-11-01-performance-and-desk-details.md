# Performance and desk details

User reported severe lag and asked to crop unseen exterior, plus connected lab leads, page-edge arrows, stool, nixie clock and natural moving daylight in place of the hanging sign.

- Crop the original 8K photo to two window sightline sectors (rear and side), retaining native texel density. Upload 10.20M rather than 33.55M pixels; downloads total about 3.6 MB rather than 14 MB. Remove full 8K runtime asset.
- Batch static plant geometry by material per plant. Measured room draw calls fall from 439 to 274 after the complete changes, without removing plant variety.
- Subtle upper-canopy UV motion and light-shaft variation use the existing reduced-motion-aware clock; no animated shadow-map pass.
- Replace chair with oak stool. Add a six-tube local-time clock with HH:MM:SS separators in the left monitor-riser bay; texture redraws once per second.
- Put desktop and mobile page-turn arrows across their page edges with viewport clamps.
- Rebuild scope/iron cables using measured instrument bounds. Add actual plugs, park the scope probe on the mat, clear the shelf/drawer front and notebook.

Validation: full Blender export/build, local assets and GLB checks, browser console and visual checks across room/woodshop/lab/book and phone. Confirm final cable clearance and page-turn interaction before commit.
