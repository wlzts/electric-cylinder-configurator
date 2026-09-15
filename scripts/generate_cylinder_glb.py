#!/usr/bin/env python3
"""
Generate a simple electric cylinder GLB model from primitives.
方缸筒电缸: square tube body + rod + rod end + base + servo motor + gearbox
"""
import trimesh
import numpy as np

# Materials (PBR)
aluminum = trimesh.visual.material.PBRMaterial(
    baseColorFactor=[0.75, 0.76, 0.78, 1.0],
    metallicFactor=0.85,
    roughnessFactor=0.35,
    name="aluminum",
)
dark_metal = trimesh.visual.material.PBRMaterial(
    baseColorFactor=[0.12, 0.12, 0.12, 1.0],
    metallicFactor=0.7,
    roughnessFactor=0.45,
    name="dark_metal",
)
black_plastic = trimesh.visual.material.PBRMaterial(
    baseColorFactor=[0.06, 0.06, 0.06, 1.0],
    metallicFactor=0.2,
    roughnessFactor=0.6,
    name="black_plastic",
)
steel = trimesh.visual.material.PBRMaterial(
    baseColorFactor=[0.6, 0.62, 0.65, 1.0],
    metallicFactor=0.9,
    roughnessFactor=0.25,
    name="steel",
)

meshes = []

# === 1. Square tube body (方缸筒) ===
# Vertical square extrusion: 60x60mm cross-section, 400mm tall
body_w = 0.060  # 60mm
body_h = 0.400  # 400mm
body = trimesh.creation.box(
    extents=[body_w, body_w, body_h],
    transform=trimesh.transformations.translation_matrix([0, 0, body_h / 2 + 0.04]),
)
body.visual.material = aluminum
meshes.append(body)

# Corner bolt holes (visual: small cylinders at 4 corners near top and bottom)
corner_offset = body_w / 2 - 0.006
for z_pos in [0.05, body_h + 0.03]:
    for dx in [-corner_offset, corner_offset]:
        for dy in [-corner_offset, corner_offset]:
            hole = trimesh.creation.cylinder(
                radius=0.002, height=0.003,
                transform=trimesh.transformations.translation_matrix([dx, dy, z_pos]),
            )
            hole.visual.material = dark_metal
            meshes.append(hole)

# === 2. Bottom mounting base ===
base = trimesh.creation.box(
    extents=[0.100, 0.100, 0.035],
    transform=trimesh.transformations.translation_matrix([0, 0, 0.0175]),
)
base.visual.material = black_plastic
meshes.append(base)

# Base mounting ears
for dx in [-0.055, 0.055]:
    ear = trimesh.creation.box(
        extents=[0.015, 0.080, 0.015],
        transform=trimesh.transformations.translation_matrix([dx, 0, 0.015]),
    )
    ear.visual.material = black_plastic
    meshes.append(ear)

# === 3. Piston rod (推杆) ===
rod_radius = 0.008
rod_length = 0.120
rod = trimesh.creation.cylinder(
    radius=rod_radius, height=rod_length,
    transform=trimesh.transformations.translation_matrix([0, 0, body_h + 0.04 + rod_length / 2]),
)
rod.visual.material = steel
meshes.append(rod)

# === 4. Spherical rod end (鱼眼关节) ===
rod_end_z = body_h + 0.04 + rod_length + 0.025
rod_end = trimesh.creation.icosphere(radius=0.025)
rod_end.apply_translation([0, 0, rod_end_z])
rod_end.visual.material = steel
meshes.append(rod_end)

# Inner hole in rod end
rod_end_hole = trimesh.creation.cylinder(
    radius=0.010, height=0.030,
    transform=trimesh.transformations.rotation_matrix(np.pi / 2, [1, 0, 0])
    .dot(trimesh.transformations.translation_matrix([0, 0, rod_end_z])),
)
rod_end_hole.visual.material = dark_metal
meshes.append(rod_end_hole)

# === 5. Servo motor on the side ===
motor_radius = 0.035
motor_length = 0.110
motor_x = body_w / 2 + motor_length / 2 + 0.012
motor = trimesh.creation.cylinder(
    radius=motor_radius, height=motor_length,
    transform=trimesh.transformations.rotation_matrix(np.pi / 2, [0, 1, 0])
    .dot(trimesh.transformations.translation_matrix([motor_x, 0, body_h * 0.4])),
)
motor.visual.material = black_plastic
meshes.append(motor)

# Motor front cap
motor_cap = trimesh.creation.cylinder(
    radius=motor_radius * 0.85, height=0.008,
    transform=trimesh.transformations.rotation_matrix(np.pi / 2, [0, 1, 0])
    .dot(trimesh.transformations.translation_matrix([motor_x + motor_length / 2 - 0.004, 0, body_h * 0.4])),
)
motor_cap.visual.material = dark_metal
meshes.append(motor_cap)

# === 6. Gearbox (减速机) between motor and body ===
gbx_radius = 0.028
gbx_length = 0.035
gbx_x = body_w / 2 + gbx_length / 2 + 0.004
gbx = trimesh.creation.cylinder(
    radius=gbx_radius, height=gbx_length,
    transform=trimesh.transformations.rotation_matrix(np.pi / 2, [0, 1, 0])
    .dot(trimesh.transformations.translation_matrix([gbx_x, 0, body_h * 0.4])),
)
gbx.visual.material = dark_metal
meshes.append(gbx)

# === Combine and export ===
combined = trimesh.util.concatenate(meshes)
combined.export("/home/user/Doubao/chats/38441126925920258/public/models/electric-cylinder.glb")
print(f"GLB exported: {len(meshes)} parts")
print(f"Bounds: {combined.bounds}")
