export interface Region {
  id: string;
  name: string;
  plzFrom: string;
  plzTo: string;
}

export const REGIONS: Region[] = [
  { id: 'stelle-winsen', name: 'Stelle, Winsen & Elbmarsch', plzFrom: '21423', plzTo: '21449' },
  { id: 'seevetal-rosengarten', name: 'Seevetal & Rosengarten', plzFrom: '21217', plzTo: '21228' },
  { id: 'buchholz-nordheide', name: 'Buchholz & Nordheide', plzFrom: '21244', plzTo: '21279' },
  { id: 'lueneburg', name: 'Lüneburg & Umgebung', plzFrom: '21335', plzTo: '21409' },
  { id: 'buxtehude-neuwulmstorf', name: 'Buxtehude & Neu Wulmstorf', plzFrom: '21614', plzTo: '21629' },
  { id: 'stade-altesland', name: 'Stade & Altes Land', plzFrom: '21635', plzTo: '21789' },
];

export function getRegionForPlz(plz: string): string | null {
  const region = REGIONS.find(r => plz >= r.plzFrom && plz <= r.plzTo);
  return region ? region.id : null;
}
