// Colorize COZE40: motor/housing black, body silver aluminum, rod polished steel.
// Also keep Rz(90) reorientation so the cylinder stands vertical.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, KHRDracoMeshCompression } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
await io.registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule(),
});

const SRC = '/home/user/.doubao/agent_mode/workspace/.sessions/38441126925920258/attachments/COZE-40-1205-S50-D-M-2M-B20_0.glb';
const OUT = 'public/models/electric-cylinder.glb';

const doc = await io.read(SRC);

// Rz(90deg): +X -> +Y (rod up)
const R = [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
function multiply(Rm, Mm) {
  const out = new Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    out[c * 4 + r] = Rm[r] * Mm[c * 4] + Rm[4 + r] * Mm[c * 4 + 1] + Rm[8 + r] * Mm[c * 4 + 2] + Rm[12 + r] * Mm[c * 4 + 3];
  }
  return out;
}
for (const scene of doc.getRoot().listScenes()) {
  for (const node of scene.listChildren()) node.setMatrix(multiply(R, node.getMatrix()));
}

const root = doc.getRoot();
const black = doc.createMaterial('motor-black').setBaseColorFactor([0.05, 0.05, 0.055, 1]).setMetallicFactor(0.5).setRoughnessFactor(0.45);
const silver = doc.createMaterial('body-silver').setBaseColorFactor([0.72, 0.73, 0.75, 1]).setMetallicFactor(0.95).setRoughnessFactor(0.32);
const steel = doc.createMaterial('rod-steel').setBaseColorFactor([0.82, 0.83, 0.85, 1]).setMetallicFactor(1).setRoughnessFactor(0.18);
const dark = doc.createMaterial('base-dark').setBaseColorFactor([0.02, 0.025, 0.035, 1]).setMetallicFactor(0.4).setRoughnessFactor(0.6);

for (const mesh of root.listMeshes()) {
  const name = mesh.getName().toLowerCase();
  for (const prim of mesh.listPrimitives()) {
    if (name.includes('motor')) prim.setMaterial(black);
    else if (name.includes('rod')) prim.setMaterial(steel);
    else if (name.includes('body')) {
      // second primitive (was dark navy) -> black base; first -> silver
      prim.setMaterial(prim.getMaterial()?.getName() === '' ? silver : prim.getMaterial()?.getBaseColorFactor?.()[2] > 0.3 ? dark : silver);
    }
  }
}
// simpler: re-detect body primitives by original material index color
for (const mesh of root.listMeshes()) {
  const name = mesh.getName().toLowerCase();
  if (!name.includes('body')) continue;
  const prims = mesh.listPrimitives();
  prims.forEach((prim, i) => {
    // the dark-blue primitive is the base cap
    const f = prim.getMaterial().getBaseColorFactor();
    prim.setMaterial(f[2] > 0.3 ? dark : silver);
  });
}

doc.createExtension(KHRDracoMeshCompression).setRequired(true).setEncoderOptions({
  method: KHRDracoMeshCompression.EncoderMethod.EDGEBREAKER,
  encodeSpeed: 5, decodeSpeed: 5,
});
await io.write(OUT, doc);
console.log('wrote', OUT);
