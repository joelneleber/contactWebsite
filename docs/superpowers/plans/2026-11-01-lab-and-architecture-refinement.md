# Lab and architecture refinement

User requested a researched electronics bench layout, more cabinets, intentional desk object placement, visible dog, subtle outdoor movement, more plants, less white walls, repaired ceiling/corners/trim/counter overhang, and studio speakers beside the monitor.

## Research applied

- [Corgitronics' bench](https://corgitronics.com/the-bench/): rear instrument shelf, corner-mounted inspection equipment, separate storage.
- [Cavelab's workbench](https://www.cavelab.dev/posts/workbench-shelves-lights-soldering-station/): raise instruments and route cables to reclaim workspace.
- [element14 workbench build](https://community.element14.com/challenges-projects/element14-presents/project-videos/w/documents/72020/building-a-practical-electronics-workbench-for-makers-and-engineers----episode-698): arrange tools by working sequence and frequency of use.

## Implementation

- Shared `source/lab-layout.json` moves complete instrument assemblies and the live scope overlay together. Scope, supply and multimeter face the aisle on a supported shelf; inspection and soldering are grouped beside a clear mat. Four upper cabinets and three small component drawers add storage.
- Woodshop tools share a tray; loose offcuts and unused supplies are put away.
- Counter geometry and carcasses have matching bounds, supported front ends and a small inner-edge overhang; the central counter joins the side counters without overlapping faces.
- `cockpit-shell.js` replaces overlapping wall/window pieces with a full-height shell, matched corner/crown trim, and muted putty walls with a darker ceiling.
- Six supported plants, two studio speakers on the monitor riser, and a chair parked off center retain a clear view of the dog in its original sleeping spot.
- Seven drifting outdoor leaves use the existing motion clock, so Motion off and reduced motion freeze them.

## Verification

- Full Blender/export/compression/bundle pipeline succeeds.
- Packaged links, byte accounting, live screen/motion group presence, JS syntax and first-party whitespace checks pass.
- Browser verification passed: room/wood/lab/software, aligned live scope screen, visible dog on desktop and mobile, no phone overflow or missing assets, no console errors. Leaf positions change with motion on and remain identical with Motion off.
- Independent review identified shared PSU/scope screw names and a 3 cm pedestal gap; both fixed before the final full build.
