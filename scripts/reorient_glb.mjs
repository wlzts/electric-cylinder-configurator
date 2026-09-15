// Reorient GLB: rotate cylinder long axis (X) to world Y (vertical),
// so model-viewer turntable auto-rotate spins around the cylinder's own axis.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, KHRDracoMeshCompression } from '@gltf-transform/extensions';
import draco3d from 'draco3dgltf';

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
await io.registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule(),
});

// Rz(90deg) column-major: maps axis X -> Y
const R = [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

function multiply(Rm, Mm) {
  const out = new Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] =
        Rm[r] * Mm[c * 4 + 0] +
        Rm[4 + r] * Mm[c * 4 + 1] +
        Rm[8 + r] * Mm[c * 4 + 2] +
        Rm[12 + r] * Mm[c * 4 + 3];
    }
  }
  return out;
}

const files = [
  ['public/models/electric-cylinder.glb', 'public/models/electric-cylinder.v2.glb'],
  ['public/models/dmc160.glb', 'public/models/dmc160.v2.glb'],
];

for (const [inp, outp] of files) {
  const doc = await io.read(inp);
  for (const scene of doc.getRoot().listScenes()) {
    for (const node of scene.listChildren()) {
      node.setMatrix(multiply(R, node.getMatrix()));
    }
  }
  doc
    .createExtension(KHRDracoMeshCompression)
    .setRequired(true)
    .setEncoderOptions({
      method: KHRDracoMeshCompression.EncoderMethod.EDGEBREAKER,
      encodeSpeed: 5,
      decodeSpeed: 5,
    });
  await io.write(outp, doc);
  console.log('wrote', outp);
}
