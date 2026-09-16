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
  { test: ([r, g, b]) => r > 0.85, met: 1.0, rough: 0.12 },          // chrome
  { test: ([r, g, b]) => r > 0.6 && g > 0.45 && b < 0.3, met: 0.85, rough: 0.32 }, // gold
  { test: ([r, g, b]) => r < 0.12 && g < 0.12 && b < 0.13, met: 0.35, rough: 0.5 }, // black
  { test: ([r, g, b]) => r > 0.4 && r < 0.65, met: 0.7, rough: 0.45 },  // steel / dark silver
  { test: ([r, g, b]) => true, met: 0.95, rough: 0.3 },               // silver (fallback)
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
