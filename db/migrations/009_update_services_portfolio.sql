-- Migration 009: Update services to match Brady Digital Service Portfolio (März 2026)
-- Adds category field and replaces all services with the new portfolio

-- Add category column
ALTER TABLE services ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Add short_description column for the bold one-liner
ALTER TABLE services ADD COLUMN IF NOT EXISTS short_description TEXT;

-- Add includes column for the "Inklusive:" line
ALTER TABLE services ADD COLUMN IF NOT EXISTS includes TEXT;

-- Deactivate all existing services (don't delete, in case they're linked to customers)
UPDATE services SET is_active = false;

-- Insert new portfolio services

-- ============================================
-- KATEGORIE 1: Web-Services
-- ============================================
INSERT INTO services (name, short_description, description, includes, base_price, price_model, type, category, sort_order) VALUES
(
  'Starter Website',
  'Eine einzelne Seite, die alles Wichtige über Ihr Unternehmen zeigt.',
  'Perfekt für Betriebe, die bisher keine Website haben. Die Seite enthält alle relevanten Infos auf einen Blick: Wer Sie sind, was Sie anbieten, Ihre Öffnungszeiten und ein Kontaktformular. Die Seite passt sich automatisch an Handys, Tablets und Computer an und erfüllt alle deutschen Datenschutz-Anforderungen (DSGVO).',
  'Design, Texterstellung, Kontaktformular, Impressum, Datenschutz, Mobiloptimierung, Einrichtung auf unserem Server',
  990.00, 'einmalig', 'paket', 'Web-Services', 100
),
(
  'Business Website',
  'Eine vollständige Website mit mehreren Unterseiten für Ihr Unternehmen.',
  'Für Betriebe, die sich ausführlicher präsentieren möchten. Sie erhalten 5 bis 8 Seiten — z.B. Startseite, Über uns, Leistungen, Referenzen und Kontakt. Jede Seite wird individuell gestaltet. Wir achten darauf, dass Ihre Website bei Google-Suchen in Ihrer Region auftaucht (SEO-Grundlagen).',
  'Individuelles Design, bis zu 8 Seiten, SEO-Grundoptimierung, Kontaktformular, Google Maps-Einbindung, Impressum & Datenschutz',
  2490.00, 'einmalig', 'paket', 'Web-Services', 101
),
(
  'Premium Website',
  'Eine maßgeschneiderte Website mit allen Extras — Ihr digitales Aushängeschild.',
  'Für Unternehmen, die online richtig Eindruck machen wollen. Mit professionellen Animationen, einem Blog-Bereich für regelmäßige Neuigkeiten, erweiterter Suchmaschinenoptimierung und detaillierten Besucherstatistiken. Wir erstellen ein komplett einzigartiges Design, das perfekt zu Ihrer Marke passt.',
  'Unbegrenzte Seiten, Animation & Effekte, Blog-System, erweiterte SEO, Google Analytics, Bildbearbeitung, Premium-Support',
  4990.00, 'einmalig', 'paket', 'Web-Services', 102
),
(
  'Online-Shop',
  'Ein vollständiger Webshop, über den Ihre Kunden direkt bei Ihnen einkaufen können.',
  'Ihre Produkte online verkaufen — rund um die Uhr, 7 Tage die Woche. Kunden können Produkte in den Warenkorb legen, sicher bezahlen (z.B. per Kreditkarte, PayPal oder Überweisung) und die Bestellung wird automatisch an Sie weitergeleitet. Sie verwalten Produkte, Preise und Bestellungen über ein einfaches Verwaltungssystem.',
  'Produktkatalog, Warenkorb, sichere Bezahlung, Versandanbindung, Bestellverwaltung, E-Mail-Benachrichtigungen',
  3990.00, 'einmalig', 'paket', 'Web-Services', 103
),
(
  'Website-Wartung',
  'Wir kümmern uns darum, dass Ihre Website immer aktuell, sicher und schnell bleibt.',
  'Wie ein Auto braucht auch eine Website regelmäßige Pflege. Wir aktualisieren die Technik im Hintergrund, erstellen Sicherungskopien (falls mal etwas schiefgeht), überwachen die Geschwindigkeit und beheben Probleme. Kleine Änderungen wie neue Öffnungszeiten oder ein neues Foto sind inklusive.',
  'Monatliche Updates, tägliche Backups, Sicherheitsüberwachung, kleine Text-/Bildänderungen, technischer Support per E-Mail',
  99.00, 'monatlich', 'addon', 'Web-Services', 104
),
(
  'Website-Redesign',
  'Ihre bestehende, veraltete Website wird modernisiert und aufgefrischt.',
  'Wenn Ihre Website schon einige Jahre alt ist, sieht sie auf modernen Handys oft schlecht aus und lädt zu langsam. Wir nehmen Ihre bestehenden Inhalte, geben ihnen ein frisches, zeitgemäßes Design und sorgen dafür, dass alles technisch auf dem neuesten Stand ist — ohne dass Sie bei null anfangen müssen.',
  'Analyse der bestehenden Seite, neues Design, Mobiloptimierung, Geschwindigkeitsverbesserung, SEO-Check',
  1490.00, 'einmalig', 'paket', 'Web-Services', 105
),

-- ============================================
-- KATEGORIE 2: Sichtbarkeit & lokales Marketing
-- ============================================
(
  'Google Unternehmensprofil',
  'Ihr Unternehmen erscheint bei Google Maps und in der lokalen Google-Suche.',
  'Wenn jemand z.B. nach einem Friseur in Ihrer Nähe googelt, erscheint rechts ein Kasten mit Bild, Adresse, Bewertungen und Öffnungszeiten — das ist das Google Unternehmensprofil. Wir richten es ein oder optimieren Ihr bestehendes Profil: mit professionellen Fotos, allen wichtigen Infos, den richtigen Kategorien und einer ansprechenden Beschreibung.',
  'Profilerstellung oder -optimierung, Fotos hochladen, Öffnungszeiten, Kategorien, Beschreibung, Verifizierung',
  299.00, 'einmalig', 'paket', 'Sichtbarkeit & Marketing', 200
),
(
  'Local SEO Paket',
  'Ihr Unternehmen wird in Ihrer Region bei Google besser gefunden.',
  'SEO steht für Suchmaschinenoptimierung — einfach gesagt: Wir sorgen dafür, dass Ihre Website weiter oben in den Google-Ergebnissen erscheint, wenn Leute in Ihrer Umgebung nach Ihren Dienstleistungen suchen. Dazu tragen wir Ihr Unternehmen in wichtige Online-Verzeichnisse ein, optimieren Ihre Website für lokale Suchbegriffe und erstellen monatliche Berichte.',
  'Keyword-Recherche, 20+ Branchenverzeichnisse, Google Maps-Optimierung, monatlicher Fortschrittsbericht',
  349.00, 'monatlich', 'paket', 'Sichtbarkeit & Marketing', 201
),
(
  'Bewertungsmanagement',
  'Mehr positive Google-Bewertungen bekommen und Ihren guten Ruf online schützen.',
  '90% der Kunden lesen Online-Bewertungen, bevor sie einen Betrieb kontaktieren. Wir helfen Ihnen, zufriedene Kunden aktiv um Bewertungen zu bitten (z.B. per SMS oder QR-Code nach dem Termin), antworten professionell auf alle Bewertungen und überwachen, was online über Sie gesagt wird.',
  'Bewertungs-Anfrage-System, Antworten auf Bewertungen, monatlicher Reputationsbericht, Benachrichtigung bei neuen Bewertungen',
  199.00, 'monatlich', 'addon', 'Sichtbarkeit & Marketing', 202
),
(
  'Social Media Management',
  'Regelmäßige Beiträge auf Facebook und Instagram — ohne dass Sie selbst posten müssen.',
  'Viele Ihrer Kunden sind täglich auf Facebook und Instagram unterwegs. Wir erstellen und veröffentlichen 8 bis 12 Beiträge pro Monat für Sie: z.B. Fotos Ihrer Arbeit, Tipps aus Ihrem Fachgebiet, Aktionen oder Einblicke hinter die Kulissen. Außerdem beantworten wir Kommentare und Nachrichten Ihrer Follower.',
  'Profil-Einrichtung, 8-12 Posts/Monat, Bild- und Texterstellung, Community-Management, monatlicher Bericht',
  449.00, 'monatlich', 'addon', 'Sichtbarkeit & Marketing', 203
),
(
  'Content-Erstellung (KI)',
  'Professionelle Texte für Ihre Website, Ihren Blog und Ihre Social-Media-Kanäle.',
  'Guter Content (Inhalt) hilft Ihnen, bei Google besser gefunden zu werden und als Experte in Ihrem Bereich wahrgenommen zu werden. Wir nutzen KI-Technologie, um schnell hochwertige Texte zu erstellen — Blogartikel, Social-Media-Posts, Website-Texte. Jeder Text wird von uns geprüft und auf Ihr Unternehmen angepasst, bevor er veröffentlicht wird.',
  '4 Blogartikel oder 12 Social-Media-Posts pro Monat, redaktionelle Überprüfung, SEO-optimiert',
  299.00, 'monatlich', 'addon', 'Sichtbarkeit & Marketing', 204
),
(
  'E-Mail-Marketing',
  'Regelmäßige Newsletter an Ihre Kunden — automatisch und professionell.',
  'E-Mail-Marketing ist einer der effektivsten Wege, Stammkunden zu halten und über Neuigkeiten zu informieren. Wir richten ein Newsletter-System ein, gestalten professionelle Vorlagen in Ihrem Design und verschicken regelmäßig E-Mails an Ihre Kundenliste. Automatische Kampagnen (z.B. Geburtstagsglückwünsche oder Erinnerungen) laufen ganz ohne Ihr Zutun.',
  'Newsletter-System, Vorlagen-Design, monatlicher Versand, automatische Kampagnen, Auswertung (Öffnungsrate etc.)',
  249.00, 'monatlich', 'addon', 'Sichtbarkeit & Marketing', 205
),

-- ============================================
-- KATEGORIE 3: KI-Workflows & Automatisierung
-- ============================================
(
  'KI-Chatbot',
  'Ein digitaler Assistent auf Ihrer Website, der Kundenfragen rund um die Uhr beantwortet.',
  'Stellen Sie sich einen freundlichen Mitarbeiter vor, der 24 Stunden am Tag, 7 Tage die Woche auf Ihrer Website sitzt und Fragen beantwortet — zu Ihren Leistungen, Preisen, Öffnungszeiten oder Verfügbarkeit. Genau das macht der KI-Chatbot. Er versteht natürliche Sprache, kann Termine vorschlagen und leitet komplexe Anfragen direkt an Sie weiter per E-Mail oder SMS.',
  'Einrichtung, Training mit Ihren Unternehmensdaten, monatliche Optimierung, unbegrenzte Gespräche, E-Mail-Weiterleitung',
  349.00, 'monatlich', 'paket', 'KI-Workflows', 300
),
(
  'KI-Telefonassistent',
  'Automatische Telefonannahme — in natürlicher Sprache, als wäre es ein echter Mitarbeiter.',
  'Wenn Sie gerade beim Kunden sind, auf der Baustelle oder im Feierabend, verpasst Ihr Betrieb oft Anrufe. Der KI-Telefonassistent nimmt diese Anrufe entgegen, beantwortet häufige Fragen (z.B. Öffnungszeiten, freie Termine), nimmt Rückrufwünsche auf und informiert Sie per SMS oder E-Mail. Der Anrufer merkt kaum, dass er mit einer KI spricht.',
  'Eigene Telefonnummer oder Weiterleitung, Sprachtraining mit Ihren Infos, Rückruf-Benachrichtigungen, monatliche Auswertung',
  499.00, 'monatlich', 'paket', 'KI-Workflows', 301
),
(
  'Smart Lead Generator',
  'Automatisch neue Kundenanfragen sammeln — von Website, Social Media und Formularen.',
  'Ein Lead ist ein potenzieller Kunde, der Interesse zeigt. Der Smart Lead Generator fängt diese Interessenten automatisch ein: über Kontaktformulare auf Ihrer Website, Anfrageformulare in sozialen Medien oder spezielle Landingpages. Alle Anfragen landen übersichtlich in einem System (CRM), und Sie werden sofort benachrichtigt, damit Sie schnell reagieren können.',
  'Formular-Erstellung, CRM-System, automatische Benachrichtigungen, Lead-Übersicht, monatlicher Bericht',
  399.00, 'monatlich', 'addon', 'KI-Workflows', 302
),
(
  'Termin-Automatisierung',
  'Kunden buchen Termine direkt online — ohne Anruf, ohne Hin-und-Her-Schreiben.',
  'Auf Ihrer Website erscheint ein Buchungskalender, in dem Kunden freie Zeiten sehen und direkt einen Termin buchen können. Der Termin erscheint automatisch in Ihrem Kalender (Google, Outlook etc.). Kunden erhalten automatisch eine Bestätigung und eine Erinnerung per SMS oder E-Mail — damit weniger Termine vergessen oder verpasst werden.',
  'Online-Buchungsseite, Kalender-Synchronisation, automatische Bestätigungen und Erinnerungen (SMS + E-Mail), Stornierungsmanagement',
  199.00, 'monatlich', 'addon', 'KI-Workflows', 303
),
(
  'Angebots-Automatisierung',
  'Kunden beschreiben ihren Bedarf online und erhalten sofort ein individuelles Angebot als PDF.',
  'Statt stundenlang Angebote zu schreiben, füllen Ihre Kunden ein einfaches Online-Formular aus. Die KI berechnet anhand Ihrer Preisliste automatisch ein professionelles Angebot und schickt es dem Kunden als PDF — innerhalb von Sekunden. Sie behalten die volle Kontrolle: Jedes Angebot kann vor dem Versand von Ihnen freigegeben werden.',
  'Online-Formular, KI-Preiskalkulation, PDF-Erstellung in Ihrem Design, E-Mail-Versand, optionale Freigabe durch Sie',
  449.00, 'monatlich', 'addon', 'KI-Workflows', 304
),
(
  'Rechnungs-Automatisierung',
  'Rechnungen werden automatisch erstellt, verschickt und bei Zahlungsverzug erinnert.',
  'Nach Abschluss eines Auftrags erstellt das System automatisch eine korrekte Rechnung mit allen Pflichtangaben und verschickt sie per E-Mail an Ihren Kunden. Wird nicht bezahlt, folgen automatische, freundliche Zahlungserinnerungen. Sie behalten den Überblick über alle offenen und bezahlten Rechnungen in einem übersichtlichen Dashboard.',
  'Rechnungsvorlagen in Ihrem Design, automatischer E-Mail-Versand, Zahlungserinnerungen, Übersichts-Dashboard, Export für Ihren Steuerberater',
  299.00, 'monatlich', 'addon', 'KI-Workflows', 305
),

-- ============================================
-- KATEGORIE 4: Analytics & Business Intelligence
-- ============================================
(
  'Website-Analytics',
  'Erfahren Sie, wie viele Besucher Ihre Website hat und woher sie kommen.',
  'Wie viele Menschen besuchen Ihre Website pro Monat? Welche Seiten schauen sie sich an? Kommen sie über Google, Facebook oder direkt? Diese Fragen beantwortet Website-Analytics. Sie erhalten jeden Monat einen verständlichen Bericht mit den wichtigsten Zahlen — ohne Fachchinesisch. So sehen Sie, ob sich Ihre Online-Investitionen lohnen.',
  'DSGVO-konformes Tracking (ohne Cookies), monatlicher Bericht per E-Mail, Besucher, Seitenaufrufe, Herkunft, beliebte Seiten',
  149.00, 'monatlich', 'addon', 'Analytics', 400
),
(
  'KI-Dashboard',
  'Alle Ihre Online-Daten auf einen Blick — Website, Social Media, Bewertungen, Anfragen.',
  'Statt sich in fünf verschiedene Systeme einzuloggen, sehen Sie alles Wichtige auf einem einzigen Bildschirm: Website-Besucher, Social-Media-Reichweite, neue Bewertungen, eingegangene Anfragen. Die KI erkennt Trends und gibt Ihnen konkrete Handlungsempfehlungen.',
  'Personalisiertes Dashboard, Daten aus allen Kanälen, KI-Empfehlungen, wöchentliche Zusammenfassung per E-Mail',
  299.00, 'monatlich', 'addon', 'Analytics', 401
),
(
  'Wettbewerbsanalyse',
  'Erfahren Sie, was Ihre Mitbewerber online machen — und was Sie besser machen können.',
  'Wir analysieren bis zu 5 Ihrer direkten Mitbewerber: Wie sehen deren Websites aus? Wie aktiv sind sie auf Social Media? Wie gut werden sie bei Google gefunden? Wie viele Bewertungen haben sie? Daraus leiten wir konkrete Empfehlungen ab, wie Sie sich von der Konkurrenz abheben können.',
  'Analyse von bis zu 5 Mitbewerbern, Website-Vergleich, SEO-Vergleich, Social-Media-Check, konkreter Maßnahmenplan',
  499.00, 'einmalig', 'addon', 'Analytics', 402
);
