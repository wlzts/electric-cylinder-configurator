// Post-process side-cylinder.glb: apply PBR metallic/roughness so it
// has the same brushed-metal look as the other two models.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, KHRDracoMeshCompression } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
await io.registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule(),
});

const FILE = 'public/models/side-cylinder.glb';
const doc = await io.read(FILE);

const materials = [
  // [match predicate on (r,g,b), metallic, roughness]
  { test: ([r, g, b]) => r > 0.86, met: 1.0, rough: 0.12 },          // chrome
  { test: ([r, g, b]) => r > 0.65 && g > 0.45 && b < 0.35, met: 0.9, rough: 0.35 },  // gold/brass
  { test: ([r, g, b]) => r < 0.12 && g < 0.12 && b < 0.14, met: 0.2, rough: 0.6 }, // black matte
  { test: ([r, g, b]) => r > 0.25 && r < 0.4, met: 0.6, rough: 0.5 },   // dark gray
  { test: ([r, g, b]) => true, met: 0.9, rough: 0.35 },               // brushed aluminum
];

for (const mat of doc.getRoot().listMaterials()) {
  const f = mat.getBaseColorFactor();
  for (const rule of materials) {
    if (rule.test(f)) {
      mat.setMetallicFactor(rule.met);
      mat.setRoughnessFactor(rule.rough);
      break;
    }
  }
}

doc.createExtension(KHRDracoMeshCompression).setRequired(true).setEncoderOptions({
  method: KHRDracoMeshCompression.EncoderMethod.EDGEBREAKER,
  encodeSpeed: 5, decodeSpeed: 5,
});
await io.write(FILE, doc);
console.log('PBR materials applied to', FILE);
