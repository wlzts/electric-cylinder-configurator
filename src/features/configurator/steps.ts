export const CONFIG_STEPS = [
  { id: 0, labelKey: 'cfg_req' as const, short: 'Req' },
  { id: 1, labelKey: 'cfg_platform' as const, short: 'Plat' },
  { id: 2, labelKey: 'cfg_transmission' as const, short: 'Tran' },
  { id: 3, labelKey: 'cfg_screw_belt' as const, short: 'Screw' },
  { id: 4, labelKey: 'cfg_motor' as const, short: 'Motor' },
  { id: 5, labelKey: 'cfg_drive' as const, short: 'Drive' },
  { id: 6, labelKey: 'cfg_enc_sensors' as const, short: 'I/O' },
  { id: 7, labelKey: 'cfg_accessories' as const, short: 'Acc' },
  { id: 8, labelKey: 'cfg_eng_check' as const, short: 'Check' },
  { id: 9, labelKey: 'cfg_review' as const, short: 'Rev' },
];

export const STEP_DESC_KEYS = [
  'desc_req', 'desc_platform', 'desc_transmission', 'desc_screw_belt',
  'desc_motor', 'desc_drive', 'desc_enc_sensors', 'desc_accessories',
  'desc_eng', 'desc_review',
] as const;
