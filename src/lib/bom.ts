import type { Configuration, BOMItem } from '@/types';
import {
  cylinderSeries,
  ballScrews,
  timingBelts,
  motors,
  drives,
  encoders,
  sensors,
  accessories,
  protocols,
} from '@/data';

export function generateBOM(config: Configuration): BOMItem[] {
  const bom: BOMItem[] = [];

  const cyl = cylinderSeries.find((c) => c.id === config.cylinderId);
  if (cyl) {
    bom.push({
      partNumber: `${cyl.model}-BODY`,
      description: `Cylinder Body — ${cyl.positioning}`,
      brand: 'Generic',
      qty: 1,
      status: 'included',
    });
  }

  if (config.transmission === 'timing_belt') {
    const belt = timingBelts.find((b) => b.id === config.beltId);
    if (belt) {
      bom.push({
        partNumber: belt.id,
        description: `Timing Belt — ${belt.series} ${belt.pitch} ${belt.width}mm ${belt.material}`,
        brand: 'Generic',
        qty: 1,
        status: 'included',
      });
    }
  } else {
    const screw = ballScrews.find((s) => s.id === config.screwId);
    if (screw) {
      bom.push({
        partNumber: screw.model,
        description: `Ball Screw — Ø${screw.diameter} Lead ${screw.lead} ${screw.accuracy}`,
        brand: 'Generic',
        qty: 1,
        status: 'included',
      });
    }
  }

  const motor = motors.find((m) => m.id === config.motorId);
  if (motor) {
    bom.push({
      partNumber: motor.model,
      description: `${motor.name} — ${motor.power}W${config.brake ? ' with Brake' : ''}`,
      brand: motor.brand,
      qty: 1,
      status: 'included',
    });
  }

  const drive = drives.find((d) => d.id === config.driveId);
  if (drive) {
    bom.push({
      partNumber: drive.model,
      description: `${drive.name} — ${drive.voltage}`,
      brand: drive.brand,
      qty: 1,
      status: 'included',
    });
  }

  const encoder = encoders.find((e) => e.id === config.encoderId);
  if (encoder) {
    bom.push({
      partNumber: encoder.id,
      description: `Encoder — ${encoder.name} (${encoder.resolution})`,
      brand: 'Generic',
      qty: 1,
      status: 'included',
    });
  }

  config.sensors.forEach((sid) => {
    const s = sensors.find((x) => x.id === sid);
    if (s) {
      bom.push({
        partNumber: s.id,
        description: s.name,
        brand: 'Generic',
        qty: 1,
        status: 'included',
      });
    }
  });

  config.accessories.forEach((aid) => {
    const a = accessories.find((x) => x.id === aid);
    if (a) {
      bom.push({
        partNumber: a.id,
        description: `${a.name} — ${a.description}`,
        brand: 'Generic',
        qty: 1,
        status: 'optional',
      });
    }
  });

  const proto = protocols.find((p) => p.id === config.communicationId);
  if (proto) {
    bom.push({
      partNumber: proto.code,
      description: `Communication — ${proto.name}`,
      brand: 'Generic',
      qty: 1,
      status: 'included',
    });
  }

  return bom;
}

export function bomToCSV(bom: BOMItem[]): string {
  const header = 'Part Number,Description,Brand,Qty,Status';
  const rows = bom.map(
    (b) =>
      `${b.partNumber},"${b.description.replace(/"/g, '""')}",${b.brand},${b.qty},${b.status}`,
  );
  return [header, ...rows].join('\n');
}
