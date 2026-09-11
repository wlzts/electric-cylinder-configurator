import type { Configuration } from '@/types';

// Encode core configuration into a URL-safe base64 string for sharing.
// Only core IDs are encoded; full state remains in localStorage.
export function encodeConfigToShare(config: Configuration): string {
  const core = {
    c: config.cylinderId,
    t: config.transmission,
    s: config.screwId,
    b: config.beltId,
    m: config.motorId,
    d: config.driveId,
    e: config.encoderId,
    br: config.brake,
    sn: config.sensors,
    a: config.accessories,
    p: config.communicationId,
    st: config.stroke,
  };
  try {
    return btoa(encodeURIComponent(JSON.stringify(core)));
  } catch {
    return '';
  }
}

export function decodeConfigFromShare(encoded: string): Partial<Configuration> | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(encoded)));
    return {
      cylinderId: parsed.c ?? null,
      transmission: parsed.t ?? null,
      screwId: parsed.s ?? null,
      beltId: parsed.b ?? null,
      motorId: parsed.m ?? null,
      driveId: parsed.d ?? null,
      encoderId: parsed.e ?? null,
      brake: !!parsed.br,
      sensors: Array.isArray(parsed.sn) ? parsed.sn : [],
      accessories: Array.isArray(parsed.a) ? parsed.a : [],
      communicationId: parsed.p ?? null,
      stroke: typeof parsed.st === 'number' ? parsed.st : 0,
    };
  } catch {
    return null;
  }
}

export function buildShareLink(config: Configuration): string {
  const encoded = encodeConfigToShare(config);
  const base = `${window.location.origin}${window.location.pathname}${window.location.hash.split('?')[0]}`;
  return `${base}?cfg=${encoded}`;
}
