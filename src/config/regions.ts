export interface Region {
  id: string;
  name: string;
  plzFrom: string;
  plzTo: string;
  bundesland: string;
  landkreis: string;
}

export const REGIONS: Region[] = [
  // ── Niedersachsen ─────────────────────────────────────────────

  // Landkreis Cuxhaven
  { id: 'cuxhaven-sued', name: 'Hemmoor, Hechthausen & Oste-Region', plzFrom: '21745', plzTo: '21789', bundesland: 'Niedersachsen', landkreis: 'Landkreis Cuxhaven' },
  { id: 'cuxhaven-stadt', name: 'Cuxhaven', plzFrom: '27472', plzTo: '27478', bundesland: 'Niedersachsen', landkreis: 'Landkreis Cuxhaven' },
  { id: 'cuxhaven-geestland', name: 'Geestland, Beverstedt & Loxstedt', plzFrom: '27607', plzTo: '27639', bundesland: 'Niedersachsen', landkreis: 'Landkreis Cuxhaven' },

  // Landkreis Harburg
  { id: 'seevetal-rosengarten', name: 'Seevetal & Rosengarten', plzFrom: '21217', plzTo: '21228', bundesland: 'Niedersachsen', landkreis: 'Landkreis Harburg' },
  { id: 'buchholz-nordheide', name: 'Buchholz & Nordheide', plzFrom: '21244', plzTo: '21279', bundesland: 'Niedersachsen', landkreis: 'Landkreis Harburg' },
  { id: 'stelle-winsen', name: 'Stelle, Winsen & Elbmarsch', plzFrom: '21423', plzTo: '21449', bundesland: 'Niedersachsen', landkreis: 'Landkreis Harburg' },

  // Heidekreis
  { id: 'soltau-schneverdingen', name: 'Soltau & Schneverdingen', plzFrom: '29614', plzTo: '29649', bundesland: 'Niedersachsen', landkreis: 'Heidekreis' },
  { id: 'walsrode-fallingbostel', name: 'Walsrode & Bad Fallingbostel', plzFrom: '29664', plzTo: '29699', bundesland: 'Niedersachsen', landkreis: 'Heidekreis' },

  // Landkreis Luechow-Dannenberg
  { id: 'luechow-dannenberg', name: 'Lüchow, Dannenberg & Wendland', plzFrom: '29439', plzTo: '29499', bundesland: 'Niedersachsen', landkreis: 'Landkreis Lüchow-Dannenberg' },

  // Landkreis Lueneburg
  { id: 'lueneburg', name: 'Lüneburg & Umgebung', plzFrom: '21335', plzTo: '21409', bundesland: 'Niedersachsen', landkreis: 'Landkreis Lüneburg' },

  // Landkreis Osterholz
  { id: 'osterholz', name: 'Osterholz-Scharmbeck, Ritterhude & Worpswede', plzFrom: '27711', plzTo: '27729', bundesland: 'Niedersachsen', landkreis: 'Landkreis Osterholz' },

  // Landkreis Rotenburg (Wuemme)
  { id: 'rotenburg-suedost', name: 'Rotenburg, Scheeßel & Sottrum', plzFrom: '27356', plzTo: '27389', bundesland: 'Niedersachsen', landkreis: 'Landkreis Rotenburg (Wümme)' },
  { id: 'rotenburg-nordwest', name: 'Sittensen, Zeven & Bremerverde', plzFrom: '27404', plzTo: '27449', bundesland: 'Niedersachsen', landkreis: 'Landkreis Rotenburg (Wümme)' },

  // Landkreis Stade
  { id: 'buxtehude-neuwulmstorf', name: 'Buxtehude & Neu Wulmstorf', plzFrom: '21614', plzTo: '21629', bundesland: 'Niedersachsen', landkreis: 'Landkreis Stade' },
  { id: 'stade-altesland', name: 'Stade & Altes Land', plzFrom: '21635', plzTo: '21744', bundesland: 'Niedersachsen', landkreis: 'Landkreis Stade' },

  // Landkreis Uelzen
  { id: 'uelzen', name: 'Uelzen & Umgebung', plzFrom: '29525', plzTo: '29581', bundesland: 'Niedersachsen', landkreis: 'Landkreis Uelzen' },

  // Landkreis Verden
  { id: 'verden-achim', name: 'Verden, Achim & Langwedel', plzFrom: '27239', plzTo: '27330', bundesland: 'Niedersachsen', landkreis: 'Landkreis Verden' },

  // ── Bremen ────────────────────────────────────────────────────

  // Stadt Bremerhaven
  { id: 'bremerhaven', name: 'Bremerhaven', plzFrom: '27568', plzTo: '27580', bundesland: 'Bremen', landkreis: 'Stadt Bremerhaven' },

  // ── Schleswig-Holstein ────────────────────────────────────────

  // Kreis Dithmarschen
  { id: 'dithmarschen-nord', name: 'Heide, Büsum & Wesselburen', plzFrom: '25746', plzTo: '25899', bundesland: 'Schleswig-Holstein', landkreis: 'Kreis Dithmarschen' },
  { id: 'dithmarschen-sued', name: 'Meldorf, Brunsbüttel & Burg', plzFrom: '25693', plzTo: '25745', bundesland: 'Schleswig-Holstein', landkreis: 'Kreis Dithmarschen' },

  // Kreis Herzogtum Lauenburg
  { id: 'geesthacht-schwarzenbek', name: 'Geesthacht, Schwarzenbek & Lauenburg', plzFrom: '21465', plzTo: '21529', bundesland: 'Schleswig-Holstein', landkreis: 'Kreis Herzogtum Lauenburg' },
  { id: 'moelln-ratzeburg', name: 'Mölln & Ratzeburg', plzFrom: '23879', plzTo: '23919', bundesland: 'Schleswig-Holstein', landkreis: 'Kreis Herzogtum Lauenburg' },

  // Kreis Ostholstein
  { id: 'ostholstein', name: 'Eutin, Neustadt & Bad Schwartau', plzFrom: '23600', plzTo: '23779', bundesland: 'Schleswig-Holstein', landkreis: 'Kreis Ostholstein' },

  // Kreis Pinneberg
  { id: 'pinneberg-elmshorn', name: 'Pinneberg, Elmshorn & Wedel', plzFrom: '25335', plzTo: '25592', bundesland: 'Schleswig-Holstein', landkreis: 'Kreis Pinneberg' },

  // Kreis Segeberg
  { id: 'segeberg-kaltenkirchen', name: 'Kaltenkirchen, Norderstedt & Bad Segeberg', plzFrom: '22844', plzTo: '24649', bundesland: 'Schleswig-Holstein', landkreis: 'Kreis Segeberg' },

  // Kreis Steinburg
  { id: 'steinburg', name: 'Itzehoe, Glückstadt & Wilster', plzFrom: '25524', plzTo: '25599', bundesland: 'Schleswig-Holstein', landkreis: 'Kreis Steinburg' },

  // Kreis Stormarn
  { id: 'stormarn', name: 'Ahrensburg, Reinbek & Bad Oldesloe', plzFrom: '22926', plzTo: '23858', bundesland: 'Schleswig-Holstein', landkreis: 'Kreis Stormarn' },

  // Hansestadt Lübeck
  { id: 'luebeck', name: 'Hansestadt Lübeck', plzFrom: '23539', plzTo: '23570', bundesland: 'Schleswig-Holstein', landkreis: 'Hansestadt Lübeck' },

  // Stadt Neumünster
  { id: 'neumuenster', name: 'Neumünster', plzFrom: '24534', plzTo: '24539', bundesland: 'Schleswig-Holstein', landkreis: 'Stadt Neumünster' },

  // ── Mecklenburg-Vorpommern ────────────────────────────────────

  // Landkreis Nordwestmecklenburg
  { id: 'nordwestmecklenburg', name: 'Wismar, Grevesmühlen & Schönberg', plzFrom: '23936', plzTo: '23999', bundesland: 'Mecklenburg-Vorpommern', landkreis: 'Landkreis Nordwestmecklenburg' },

  // Landkreis Ludwigslust-Parchim (westlicher Teil)
  { id: 'ludwigslust-hagenow', name: 'Ludwigslust, Hagenow & Boizenburg', plzFrom: '19230', plzTo: '19300', bundesland: 'Mecklenburg-Vorpommern', landkreis: 'Landkreis Ludwigslust-Parchim' },
];

export function getRegionForPlz(plz: string): string | null {
  const region = REGIONS.find(r => plz >= r.plzFrom && plz <= r.plzTo);
  return region ? region.id : null;
}
