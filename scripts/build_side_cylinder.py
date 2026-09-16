"""
Refined stylized GLB for the side-moving vertical electric cylinder
(侧移电缸, stroke 200), reconstructed from reference screenshots.
"""
import trimesh
import numpy as np

SILVER   = [0.74, 0.75, 0.77, 1.0]
SILVER_D = [0.55, 0.56, 0.58, 1.0]
BLACK    = [0.05, 0.05, 0.06, 1.0]
GOLD     = [0.80, 0.58, 0.16, 1.0]
GOLD_D   = [0.62, 0.42, 0.10, 1.0]
CHROME   = [0.88, 0.89, 0.91, 1.0]
DARKGRAY = [0.22, 0.23, 0.25, 1.0]
STEEL    = [0.60, 0.61, 0.63, 1.0]

def _colored(mesh, color):
    mesh.visual = trimesh.visual.ColorVisuals(
        mesh, face_colors=np.tile(color, (len(mesh.faces), 1)))
    return mesh

def box(size, pos, color):
    m = trimesh.creation.box(extents=size)
    m.apply_translation(pos)
    return _colored(m, color)

def cyl(radius, height, pos, color, sections=40):
    m = trimesh.creation.cylinder(radius=radius, height=height, sections=sections)
    m.apply_translation(pos)
    return _colored(m, color)

def sphere(radius, pos, color):
    m = trimesh.creation.icosphere(radius=radius, subdivisions=4)
    m.apply_translation(pos)
    return _colored(m, color)

def torus(major, minor, pos, color):
    m = trimesh.creation.torus(major_radius=major, minor_radius=minor,
                               major_segments=40, minor_segments=12)
    m.apply_translation(pos)
    return _colored(m, color)

parts = []

# ===== Main square aluminum body (vertical along Y) =====
BW, BD, BH = 0.080, 0.080, 0.440   # body width, depth, height
body_y = 0.250
parts.append(box([BW, BH, BD], [0, body_y, 0], SILVER))

# front T-slot grooves (recessed dark vertical strips on front face z+)
for x in [-0.026, 0, 0.026]:
    parts.append(box([0.010, BH*0.92, 0.004], [x, body_y, BD/2 + 0.001], DARKGRAY))
# side grooves
parts.append(box([0.004, BH*0.92, 0.020], [BW/2 + 0.001, body_y, 0], DARKGRAY))
parts.append(box([0.004, BH*0.92, 0.020], [-BW/2 - 0.001, body_y, 0], DARKGRAY))

# small gold sensor port on left side near top
parts.append(box([0.012, 0.020, 0.012], [-BW/2 - 0.006, 0.440, 0.020], GOLD))

# circular gold button on front face
parts.append(cyl(0.006, 0.004, [0.015, 0.300, BD/2 + 0.002], GOLD_D, sections=20))

# ===== Top black end cap =====
parts.append(box([0.092, 0.028, 0.092], [0, 0.486, 0], BLACK))
# brass nut ring above cap
parts.append(cyl(0.020, 0.014, [0, 0.507, 0], GOLD, sections=24))
# black threaded stud
parts.append(cyl(0.010, 0.020, [0, 0.524, 0], BLACK, sections=16))
# chrome ball joint
parts.append(sphere(0.030, [0, 0.552, 0], CHROME))

# ===== Bottom transition collar =====
parts.append(box([0.092, 0.040, 0.092], [0, 0.040, 0], SILVER_D))

# ===== Black mounting base plate =====
parts.append(box([0.190, 0.026, 0.170], [0, 0.005, 0], BLACK))
# feet rails
parts.append(box([0.190, 0.018, 0.018], [0, -0.006, 0.076], BLACK))
parts.append(box([0.190, 0.018, 0.018], [0, -0.006, -0.076], BLACK))
# mounting bolt holes (small dark circles on top of base)
for sx in [-0.075, 0.075]:
    for sz in [-0.065, 0.065]:
        parts.append(cyl(0.006, 0.002, [sx, 0.019, sz], DARKGRAY, sections=16))

# ===== Bottom output rod with eye end =====
parts.append(cyl(0.020, 0.050, [0, -0.030, 0], STEEL, sections=24))
# clevis eye ring at bottom
parts.append(torus(0.018, 0.007, [0, -0.062, 0], CHROME))

# ===== Gold servo motor on left =====
# motor top block
parts.append(box([0.062, 0.080, 0.072], [-0.105, 0.180, 0], GOLD))
# step detail on top
parts.append(box([0.050, 0.020, 0.060], [-0.105, 0.225, 0], GOLD))
# middle smaller section
parts.append(box([0.052, 0.045, 0.060], [-0.105, 0.115, 0], GOLD_D))
# motor bottom block
parts.append(box([0.062, 0.055, 0.072], [-0.105, 0.060, 0], GOLD))
# black connector plug on motor front
parts.append(box([0.020, 0.030, 0.030], [-0.142, 0.160, 0.015], BLACK))
# motor mounting bracket to body
parts.append(box([0.040, 0.025, 0.080], [-0.062, 0.080, 0], BLACK))
parts.append(box([0.030, 0.020, 0.060], [-0.062, 0.030, 0], DARKGRAY))

scene = trimesh.Scene()
for p in parts:
    scene.add_geometry(p)

scene.export('public/models/side-cylinder.glb')
print('wrote public/models/side-cylinder.glb')
print('bounds:', scene.bounds)
