export interface Region {
  id: string;
  name: string;
  plzFrom: string;
  plzTo: string;
  bundesland: string;
  landkreis: string;
}

// WICHTIG: PLZ-Bereiche duerfen sich NICHT ueberlappen!
// Jede PLZ gehoert genau EINER Region.
// Sortiert nach plzFrom innerhalb jedes Bundeslandes.

export const REGIONS: Region[] = [
  // ── Niedersachsen ─────────────────────────────────────────────

  // Landkreis Harburg
  { id: 'seevetal-rosengarten', name: 'Seevetal & Rosengarten', plzFrom: '21217', plzTo: '21228', bundesland: 'Niedersachsen', landkreis: 'Landkreis Harburg' },
  { id: 'buchholz-nordheide', name: 'Buchholz & Nordheide', plzFrom: '21244', plzTo: '21279', bundesland: 'Niedersachsen', landkreis: 'Landkreis Harburg' },
  { id: 'stelle-winsen', name: 'Stelle, Winsen & Elbmarsch', plzFrom: '21423', plzTo: '21449', bundesland: 'Niedersachsen', landkreis: 'Landkreis Harburg' },

  // Landkreis Lueneburg
  { id: 'lueneburg', name: 'Lüneburg & Umgebung', plzFrom: '21335', plzTo: '21409', bundesland: 'Niedersachsen', landkreis: 'Landkreis Lüneburg' },

  // Landkreis Stade
  { id: 'buxtehude-neuwulmstorf', name: 'Buxtehude & Neu Wulmstorf', plzFrom: '21614', plzTo: '21629', bundesland: 'Niedersachsen', landkreis: 'Landkreis Stade' },
  { id: 'stade-altesland', name: 'Stade & Altes Land', plzFrom: '21635', plzTo: '21744', bundesland: 'Niedersachsen', landkreis: 'Landkreis Stade' },

  // Landkreis Cuxhaven
  { id: 'cuxhaven-sued', name: 'Hemmoor, Hechthausen & Oste-Region', plzFrom: '21745', plzTo: '21789', bundesland: 'Niedersachsen', landkreis: 'Landkreis Cuxhaven' },
  { id: 'cuxhaven-stadt', name: 'Cuxhaven', plzFrom: '27472', plzTo: '27478', bundesland: 'Niedersachsen', landkreis: 'Landkreis Cuxhaven' },
  { id: 'cuxhaven-geestland', name: 'Geestland, Beverstedt & Loxstedt', plzFrom: '27607', plzTo: '27639', bundesland: 'Niedersachsen', landkreis: 'Landkreis Cuxhaven' },

  // Landkreis Verden
  { id: 'verden-achim', name: 'Verden, Achim & Langwedel', plzFrom: '27239', plzTo: '27330', bundesland: 'Niedersachsen', landkreis: 'Landkreis Verden' },

  // Landkreis Rotenburg (Wuemme)
  { id: 'rotenburg-suedost', name: 'Rotenburg, Scheeßel & Sottrum', plzFrom: '27356', plzTo: '27389', bundesland: 'Niedersachsen', landkreis: 'Landkreis Rotenburg (Wümme)' },
  { id: 'rotenburg-nordwest', name: 'Sittensen, Zeven & Bremerverde', plzFrom: '27404', plzTo: '27449', bundesland: 'Niedersachsen', landkreis: 'Landkreis Rotenburg (Wümme)' },

  // Landkreis Osterholz
  { id: 'osterholz', name: 'Osterholz-Scharmbeck, Ritterhude & Worpswede', plzFrom: '27711', plzTo: '27729', bundesland: 'Niedersachsen', landkreis: 'Landkreis Osterholz' },

  // Landkreis Luechow-Dannenberg
  { id: 'luechow-dannenberg', name: 'Lüchow, Dannenberg & Wendland', plzFrom: '29439', plzTo: '29499', bundesland: 'Niedersachsen', landkreis: 'Landkreis Lüchow-Dannenberg' },

  // Landkreis Uelzen
  { id: 'uelzen', name: 'Uelzen & Umgebung', plzFrom: '29525', plzTo: '29581', bundesland: 'Niedersachsen', landkreis: 'Landkreis Uelzen' },

  // Heidekreis
  { id: 'soltau-schneverdingen', name: 'Soltau & Schneverdingen', plzFrom: '29614', plzTo: '29649', bundesland: 'Niedersachsen', landkreis: 'Heidekreis' },
  { id: 'walsrode-fallingbostel', name: 'Walsrode & Bad Fallingbostel', plzFrom: '29664', plzTo: '29699', bundesland: 'Niedersachsen', landkreis: 'Heidekreis' },

  // ── Bremen ────────────────────────────────────────────────────

  // Stadt Bremerhaven
  { id: 'bremerhaven', name: 'Bremerhaven', plzFrom: '27568', plzTo: '27580', bundesland: 'Bremen', landkreis: 'Stadt Bremerhaven' },

  // ── Schleswig-Holstein ────────────────────────────────────────

  // Kreis Herzogtum Lauenburg (Suedteil: Geesthacht/Schwarzenbek)
  { id: 'geesthacht-schwarzenbek', name: 'Geesthacht, Schwarzenbek & Lauenburg', plzFrom: '21465', plzTo: '21529', bundesland: 'Schleswig-Holstein', landkreis: 'Kreis Herzogtum Lauenburg' },

  // Kreis Segeberg — Norderstedt (22844-22925, vor Stormarn)
  { id: 'segeberg-norderstedt', name: 'Norderstedt', plzFrom: '22844', plzTo: '22925', bundesland: 'Schleswig-Holstein', landkreis: 'Kreis Segeberg' },

  // Kreis Stormarn — Sued (Ahrensburg, Bargteheide, Trittau)
  { id: 'stormarn', name: 'Ahrensburg, Bargteheide & Trittau', plzFrom: '22926', plzTo: '23538', bundesland: 'Schleswig-Holstein', landkreis: 'Kreis Stormarn' },

  // Hansestadt Luebeck
  { id: 'luebeck', name: 'Hansestadt Lübeck', plzFrom: '23539', plzTo: '23599', bundesland: 'Schleswig-Holstein', landkreis: 'Hansestadt Lübeck' },

  // Kreis Ostholstein
  { id: 'ostholstein', name: 'Eutin, Neustadt & Bad Schwartau', plzFrom: '23600', plzTo: '23779', bundesland: 'Schleswig-Holstein', landkreis: 'Kreis Ostholstein' },

  // Kreis Stormarn — Nord (Bad Oldesloe, Reinfeld)
  { id: 'stormarn-nord', name: 'Bad Oldesloe & Reinfeld', plzFrom: '23780', plzTo: '23878', bundesland: 'Schleswig-Holstein', landkreis: 'Kreis Stormarn' },

  // Kreis Herzogtum Lauenburg (Nordteil: Moelln/Ratzeburg)
  { id: 'moelln-ratzeburg', name: 'Mölln & Ratzeburg', plzFrom: '23879', plzTo: '23935', bundesland: 'Schleswig-Holstein', landkreis: 'Kreis Herzogtum Lauenburg' },

  // Stadt Neumuenster
  { id: 'neumuenster', name: 'Neumünster', plzFrom: '24534', plzTo: '24539', bundesland: 'Schleswig-Holstein', landkreis: 'Stadt Neumünster' },

  // Kreis Segeberg — Kaltenkirchen/Bad Bramstedt (24540-24649, nach Neumuenster)
  { id: 'segeberg-kaltenkirchen', name: 'Kaltenkirchen, Henstedt-Ulzburg & Bad Bramstedt', plzFrom: '24540', plzTo: '24649', bundesland: 'Schleswig-Holstein', landkreis: 'Kreis Segeberg' },

  // Kreis Pinneberg (25335-25523, vor Steinburg)
  { id: 'pinneberg-elmshorn', name: 'Pinneberg, Elmshorn & Wedel', plzFrom: '25335', plzTo: '25523', bundesland: 'Schleswig-Holstein', landkreis: 'Kreis Pinneberg' },

  // Kreis Steinburg (25524-25599, nach Pinneberg)
  { id: 'steinburg', name: 'Itzehoe, Glückstadt & Wilster', plzFrom: '25524', plzTo: '25599', bundesland: 'Schleswig-Holstein', landkreis: 'Kreis Steinburg' },

  // Kreis Dithmarschen
  { id: 'dithmarschen-sued', name: 'Meldorf, Brunsbüttel & Burg', plzFrom: '25693', plzTo: '25745', bundesland: 'Schleswig-Holstein', landkreis: 'Kreis Dithmarschen' },
  { id: 'dithmarschen-nord', name: 'Heide, Büsum & Wesselburen', plzFrom: '25746', plzTo: '25899', bundesland: 'Schleswig-Holstein', landkreis: 'Kreis Dithmarschen' },

  // ── Mecklenburg-Vorpommern ────────────────────────────────────

  // Landkreis Ludwigslust-Parchim (westlicher Teil)
  { id: 'ludwigslust-hagenow', name: 'Ludwigslust, Hagenow & Boizenburg', plzFrom: '19230', plzTo: '19300', bundesland: 'Mecklenburg-Vorpommern', landkreis: 'Landkreis Ludwigslust-Parchim' },

  // Landkreis Nordwestmecklenburg
  { id: 'nordwestmecklenburg', name: 'Wismar, Grevesmühlen & Schönberg', plzFrom: '23936', plzTo: '23999', bundesland: 'Mecklenburg-Vorpommern', landkreis: 'Landkreis Nordwestmecklenburg' },
];

export function getRegionForPlz(plz: string): string | null {
  const region = REGIONS.find(r => plz >= r.plzFrom && plz <= r.plzTo);
  return region ? region.id : null;
}
