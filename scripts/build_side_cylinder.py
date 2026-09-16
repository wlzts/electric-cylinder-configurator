"""
Procedural stylized GLB for the side-moving vertical electric cylinder
(侧移电缸, stroke 200), reconstructed from user's reference screenshots.
Appearance only - not engineering-accurate geometry.
"""
import trimesh
import numpy as np

# colors (RGBA 0..1)
SILVER = [0.72, 0.73, 0.75, 1.0]
BLACK  = [0.05, 0.05, 0.055, 1.0]
GOLD   = [0.83, 0.62, 0.18, 1.0]   # brass/gold servo motor
CHROME = [0.85, 0.86, 0.88, 1.0]
DARKGRAY = [0.25, 0.26, 0.28, 1.0]

def box(size, pos, color):
    m = trimesh.creation.box(extents=size)
    m.apply_translation(pos)
    m.visual = trimesh.visual.ColorVisuals(m, face_colors=np.tile(color, (len(m.faces),1)))
    return m

def cyl(radius, height, pos, color, sections=32):
    m = trimesh.creation.cylinder(radius=radius, height=height, sections=sections)
    m.apply_translation(pos)
    m.visual = trimesh.visual.ColorVisuals(m, face_colors=np.tile(color, (len(m.faces),1)))
    return m

def sphere(radius, pos, color):
    m = trimesh.creation.icosphere(radius=radius, subdivisions=3)
    m.apply_translation(pos)
    m.visual = trimesh.visual.ColorVisuals(m, face_colors=np.tile(color, (len(m.faces),1)))
    return m

parts = []

# --- Main square aluminum body (vertical, along Y) ---
body = box([0.080, 0.460, 0.080], [0, 0.260, 0], SILVER)
parts.append(body)

# corner grooves / side rails (darker strips)
parts.append(box([0.010, 0.460, 0.082], [0.040, 0.260, 0], DARKGRAY))
parts.append(box([0.010, 0.460, 0.082], [-0.040, 0.260, 0], DARKGRAY))

# top black end cap
parts.append(box([0.090, 0.025, 0.090], [0, 0.5025, 0], BLACK))

# ball joint stud + ball (chrome)
parts.append(cyl(0.012, 0.030, [0, 0.532, 0], CHROME))
parts.append(sphere(0.032, [0, 0.565, 0], CHROME))

# --- Bottom black mounting base plate ---
parts.append(box([0.180, 0.025, 0.160], [0, 0.0125, 0], BLACK))
# base feet
parts.append(box([0.180, 0.020, 0.020], [0, -0.005, 0.070], BLACK))
parts.append(box([0.180, 0.020, 0.020], [0, -0.005, -0.070], BLACK))

# --- Bottom output rod (silver cylinder) ---
parts.append(cyl(0.022, 0.080, [0, -0.040, 0], SILVER))
parts.append(cyl(0.028, 0.020, [0, 0.005, 0], DARKGRAY))

# --- Gold servo motor on the left side (offset block) ---
# motor body (gold)
parts.append(box([0.060, 0.130, 0.070], [-0.095, 0.105, 0], GOLD))
# motor front cap
parts.append(box([0.010, 0.100, 0.060], [-0.130, 0.105, 0], BLACK))
# mounting bracket connecting motor to body
parts.append(box([0.055, 0.020, 0.080], [-0.065, 0.050, 0], BLACK))
# small connector block
parts.append(box([0.030, 0.030, 0.050], [-0.065, 0.080, 0], DARKGRAY))

scene = trimesh.Scene()
for p in parts:
    scene.add_geometry(p)

scene.export('public/models/side-cylinder.glb')
print('wrote public/models/side-cylinder.glb')
print('bounds:', scene.bounds)
