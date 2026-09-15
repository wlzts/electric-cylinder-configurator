#!/usr/bin/env python3
"""
Generate a detailed electric cylinder GLB model.
方缸筒电缸: square aluminum extrusion + rod + rod end + base + servo motor + gearbox
Built from trimesh primitives with PBR materials.
"""
import trimesh
import numpy as np

# ---- PBR Materials ----
def mat(color, metallic=0.0, roughness=0.5, name=""):
    return trimesh.visual.material.PBRMaterial(
        baseColorFactor=color, metallicFactor=metallic, roughnessFactor=roughness, name=name
    )

aluminum = mat([0.72, 0.73, 0.75, 1.0], 0.85, 0.3, "aluminum")
aluminum_dark = mat([0.45, 0.46, 0.48, 1.0], 0.8, 0.4, "aluminum_dark")
steel = mat([0.65, 0.66, 0.68, 1.0], 0.9, 0.2, "steel")
dark_metal = mat([0.15, 0.15, 0.16, 1.0], 0.7, 0.45, "dark_metal")
black_plastic = mat([0.08, 0.08, 0.08, 1.0], 0.1, 0.55, "black_plastic")
rubber = mat([0.05, 0.05, 0.05, 1.0], 0.0, 0.8, "rubber")

meshes = []

def add(mesh, material):
    mesh.visual.material = material
    meshes.append(mesh)

def translate(mesh, x, y, z):
    mesh.apply_translation([x, y, z])
    return mesh

def cyl_x(radius, length, x, y, z):
    """Cylinder along X axis."""
    c = trimesh.creation.cylinder(radius, length)
    c.apply_transform(trimesh.transformations.rotation_matrix(np.pi/2, [0, 1, 0]))
    return translate(c, x, y, z)

# ---- Dimensions (meters) ----
BODY_W = 0.060
BODY_H = 0.420
BASE_Z = 0.030
CENTER_Z = BASE_Z + BODY_H / 2

# === 1. Base ===
add(translate(trimesh.creation.box([0.110, 0.110, BASE_Z]), 0, 0, BASE_Z / 2), black_plastic)
add(translate(trimesh.creation.box([0.120, 0.080, 0.012]), 0, 0, BASE_Z + 0.006), dark_metal)
for dx in [-0.042, 0.042]:
    for dy in [-0.042, 0.042]:
        add(translate(trimesh.creation.cylinder(0.003, 0.005), dx, dy, BASE_Z + 0.003), dark_metal)

# === 2. Square aluminum body ===
add(translate(trimesh.creation.box([BODY_W, BODY_W, BODY_H]), 0, 0, CENTER_Z), aluminum)
add(translate(trimesh.creation.box([BODY_W + 0.004, BODY_W + 0.004, 0.012]), 0, 0, BASE_Z + BODY_H + 0.006), dark_metal)
add(translate(trimesh.creation.box([BODY_W + 0.004, BODY_W + 0.004, 0.010]), 0, 0, BASE_Z + 0.005), dark_metal)

# Corner bolts
for dx in [-BODY_W/2 + 0.005, BODY_W/2 - 0.005]:
    for dy in [-BODY_W/2 + 0.005, BODY_W/2 - 0.005]:
        add(translate(trimesh.creation.cylinder(0.0025, 0.004), dx, dy, BASE_Z + BODY_H - 0.008), steel)
        add(translate(trimesh.creation.cylinder(0.0025, 0.004), dx, dy, BASE_Z + 0.012), steel)

# Guide rail on side
add(translate(trimesh.creation.box([0.004, 0.012, BODY_H - 0.04]), BODY_W/2 + 0.002, 0, CENTER_Z), aluminum_dark)

# === 3. Piston rod ===
ROD_R = 0.008
ROD_LEN = 0.130
rod_z = BASE_Z + BODY_H + ROD_LEN / 2
add(translate(trimesh.creation.cylinder(ROD_R, ROD_LEN), 0, 0, rod_z), steel)
add(translate(trimesh.creation.cylinder(0.012, 0.018), 0, 0, BASE_Z + BODY_H + 0.012), dark_metal)

# === 4. Rod end (spherical bearing) ===
RE_Z = BASE_Z + BODY_H + ROD_LEN + 0.030
ball = translate(trimesh.creation.icosphere(radius=0.028), 0, 0, RE_Z)
add(ball, steel)
hole = trimesh.creation.cylinder(0.011, 0.050)
hole.apply_transform(trimesh.transformations.rotation_matrix(np.pi/2, [0, 1, 0]))
hole = translate(hole, 0, 0, RE_Z)
add(hole, dark_metal)

# === 5. Servo motor ===
MOTOR_R = 0.036
MOTOR_L = 0.120
motor_y = 0
motor_x = BODY_W/2 + MOTOR_L/2 + 0.025
motor_z = BASE_Z + BODY_H * 0.45
add(cyl_x(MOTOR_R, MOTOR_L, motor_x, motor_y, motor_z), black_plastic)
add(cyl_x(0.042, 0.010, motor_x + MOTOR_L/2 - 0.005, motor_y, motor_z), dark_metal)
add(cyl_x(0.030, 0.008, motor_x - MOTOR_L/2 + 0.004, motor_y, motor_z), dark_metal)

# Motor connector
conn = trimesh.creation.box([0.025, 0.020, 0.030])
add(translate(conn, motor_x + MOTOR_L/2 - 0.015, motor_y - MOTOR_R - 0.005, motor_z), dark_metal)

# Cooling fins
for i in range(5):
    fx = motor_x - MOTOR_L/2 + 0.02 + i * 0.022
    add(cyl_x(MOTOR_R + 0.001, 0.003, fx, motor_y, motor_z), dark_metal)

# === 6. Gearbox ===
GBX_R = 0.028
GBX_L = 0.040
gbx_x = BODY_W/2 + GBX_L/2 + 0.008
add(cyl_x(GBX_R, GBX_L, gbx_x, motor_y, motor_z), dark_metal)
add(cyl_x(0.034, 0.008, BODY_W/2 + 0.004, motor_y, motor_z), steel)

# === 7. Cable ===
cable_path = [
    (motor_x + MOTOR_L/2, motor_y - MOTOR_R * 0.5, motor_z + 0.02),
    (motor_x + MOTOR_L/2 + 0.015, motor_y - MOTOR_R * 0.5, motor_z - 0.02),
    (motor_x + MOTOR_L/2 + 0.010, motor_y - MOTOR_R * 0.5, motor_z - 0.06),
    (motor_x + MOTOR_L/2 + 0.020, motor_y - MOTOR_R * 0.5, motor_z - 0.10),
]
for i in range(len(cable_path) - 1):
    p1 = np.array(cable_path[i])
    p2 = np.array(cable_path[i+1])
    mid = (p1 + p2) / 2
    length = np.linalg.norm(p2 - p1)
    seg = trimesh.creation.cylinder(0.003, length)
    direction = p2 - p1
    direction_norm = direction / np.linalg.norm(direction)
    axis = np.array([0, 0, 1])
    rot_vec = np.cross(axis, direction_norm)
    if np.linalg.norm(rot_vec) > 0.001:
        angle = np.arccos(np.clip(np.dot(axis, direction_norm), -1, 1))
        rot = trimesh.transformations.rotation_matrix(angle, rot_vec)
        seg.apply_transform(rot)
    seg = translate(seg, mid[0], mid[1], mid[2])
    add(seg, rubber)

# === Export ===
combined = trimesh.util.concatenate(meshes)
out = "/home/user/Doubao/chats/38441126925920258/public/models/electric-cylinder.glb"
combined.export(out)
print(f"Exported: {len(meshes)} parts -> {out}")
import os
print(f"Size: {os.path.getsize(out)/1024:.0f} KB")
print(f"Bounds: {combined.bounds}")
