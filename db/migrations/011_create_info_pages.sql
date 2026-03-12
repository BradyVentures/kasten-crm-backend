-- Info Center: editable content pages for sales team
CREATE TABLE info_pages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug            VARCHAR(100) UNIQUE NOT NULL,
    title           VARCHAR(255) NOT NULL,
    content         TEXT NOT NULL DEFAULT '',
    sort_order      INTEGER NOT NULL DEFAULT 0,
    updated_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed: Gespraechsleitfaden
INSERT INTO info_pages (slug, title, content, sort_order) VALUES
('gespraechsleitfaden', 'Gespraechsleitfaden', '## 1. Begruessung & Einstieg

Hallo [Name], hier ist [Ihr Name] von Brady Digital. Vielen Dank, dass Sie sich kurz Zeit nehmen.

Wir helfen lokalen Unternehmen in der Region dabei, online besser sichtbar zu werden und neue Kunden zu gewinnen. Ich wollte mich kurz vorstellen und hoeren, wie es bei Ihnen aktuell laeuft.

## 2. Bedarfsanalyse

Stellen Sie diese Fragen, um den Bedarf zu verstehen:

- Wie finden Ihre Kunden Sie aktuell? (Empfehlung, Google, Social Media?)
- Haben Sie eine Website? Wenn ja, wie zufrieden sind Sie damit?
- Nutzen Sie Google My Business / Google Unternehmensprofil?
- Wie laeuft die Terminbuchung bei Ihnen? (Telefon, Online, E-Mail?)
- Was ist Ihre groesste Herausforderung beim Thema Neukunden?
- Haben Sie schon mal mit einer Agentur zusammengearbeitet?

**Tipp:** Zuhoeren ist wichtiger als reden. Notieren Sie die Schmerzpunkte.

## 3. Ueberleitung zum Angebot

Basierend auf dem, was Sie mir erzaehlt haben, haette ich da ein paar konkrete Ideen, wie wir Ihnen helfen koennen...

**Faustregel:** Maximal 2-3 Services vorschlagen, die zum Problem passen. Nicht alles auf einmal.

## 4. Produktvorstellung

- Erklaeren Sie den Service in einfachen Worten (nutzen Sie den Service-Katalog)
- Zeigen Sie den konkreten Nutzen fuer den Kunden
- Nennen Sie wenn moeglich ein Beispiel oder eine Referenz
- Nennen Sie den Preis selbstbewusst und ohne zu zoegern

## 5. Abschluss

- Soll ich Ihnen ein konkretes Angebot zusammenstellen?
- Wann waere ein guter Zeitpunkt, um die naechsten Schritte zu besprechen?
- Ich schicke Ihnen eine kurze Zusammenfassung per E-Mail.

**Wichtig:** Immer einen konkreten naechsten Schritt vereinbaren. Nie das Gespraech offen enden lassen.', 1);

-- Seed: Einwandbehandlung
INSERT INTO info_pages (slug, title, content, sort_order) VALUES
('einwandbehandlung', 'Einwandbehandlung', '## Haeufige Einwaende und Antworten

### "Das ist mir zu teuer"

Das verstehe ich. Lassen Sie mich kurz erklaeren, was Sie dafuer bekommen und warum sich die Investition lohnt. Wenn wir Ihnen zum Beispiel nur 5 neue Kunden pro Monat bringen, hat sich das schnell gerechnet. Ausserdem bieten wir flexible Pakete an, die wir an Ihr Budget anpassen koennen.

### "Ich habe schon eine Website"

Super, dann haben Sie schon eine gute Grundlage. Darf ich mal einen Blick drauf werfen? Oft gibt es ein paar Stellschrauben, mit denen man deutlich mehr rausholen kann, zum Beispiel bei der Google-Sichtbarkeit oder der Ladegeschwindigkeit. Das koennen wir kostenlos pruefen.

### "Ich brauche keine Werbung, ich lebe von Empfehlungen"

Empfehlungen sind super und das zeigt, dass Sie gute Arbeit machen. Aber was passiert, wenn jemand Sie empfohlen bekommt und dann online nach Ihnen sucht? Finden die dann sofort Ihre Telefonnummer, Bewertungen und Oeffnungszeiten? Genau dabei helfen wir.

### "Ich habe schon mal schlechte Erfahrungen mit einer Agentur gemacht"

Das hoere ich leider oefter. Deswegen arbeiten wir transparent: Sie sehen jederzeit, was wir machen, und koennen monatlich kuendigen. Kein Kleingedrucktes, keine langen Vertraege.

### "Ich muss darueber nachdenken"

Natuerlich, nehmen Sie sich die Zeit. Darf ich Ihnen eine kurze Zusammenfassung per E-Mail schicken? Dann haben Sie alles schwarz auf weiss. Und wann waere ein guter Zeitpunkt, kurz nachzuhaken?

### "Mein Sohn / Neffe / Bekannter macht das"

Das ist praktisch. Kommt er denn dazu, sich regelmaessig darum zu kuemmern? Online-Marketing ist leider keine einmalige Sache. Wir koennen auch ergaenzend dazu arbeiten und die Dinge uebernehmen, die mehr Expertise oder Zeit brauchen.

### "Ich bin zu beschaeftigt dafuer"

Genau deswegen sind wir da. Wir uebernehmen alles und Sie muessen sich um nichts kuemmern. Einmal einrichten und dann laeuft es. Sie investieren jetzt 15 Minuten und sparen danach Stunden.', 2);

-- Seed: FAQ
INSERT INTO info_pages (slug, title, content, sort_order) VALUES
('faq', 'Haeufige Kundenfragen', '## Fragen die Kunden oft stellen

### Wie lange dauert es, bis meine Website fertig ist?

Eine Standard-Website ist in der Regel innerhalb von 2-3 Wochen fertig. Wir brauchen von Ihnen Texte und Bilder, den Rest machen wir. Bei einem Online-Shop kann es 4-6 Wochen dauern.

### Was kostet mich das pro Monat?

Das haengt davon ab, welche Services Sie brauchen. Eine einfache Website ist eine einmalige Investition. Laufende Services wie SEO oder Social Media starten ab 150 Euro pro Monat. Wir schnueren Ihnen ein Paket, das zu Ihrem Budget passt.

### Kann ich die Website selbst bearbeiten?

Ja, wir bauen Ihre Website so, dass Sie einfache Aenderungen wie Texte oder Bilder selbst machen koennen. Fuer groessere Aenderungen sind wir natuerlich da.

### Was passiert, wenn ich kuendigen will?

Bei monatlichen Services koennen Sie jederzeit zum Monatsende kuendigen. Keine langen Vertragslaufzeiten. Ihre Website gehoert natuerlich Ihnen.

### Brauche ich wirklich eine neue Website?

Nicht unbedingt. Manchmal reichen ein paar Optimierungen. Wir schauen uns Ihre aktuelle Website kostenlos an und sagen Ihnen ehrlich, ob eine neue sinnvoll ist oder ob Optimierungen reichen.

### Was ist SEO und brauche ich das?

SEO bedeutet Suchmaschinenoptimierung. Damit sorgen wir dafuer, dass Ihre Website bei Google gefunden wird, wenn jemand nach Ihren Dienstleistungen sucht. Fuer lokale Unternehmen ist das besonders wichtig und effektiv.

### Kann ich erst mal klein anfangen?

Absolut. Wir empfehlen sogar, mit den Basics anzufangen: Website und Google-Profil. Wenn Sie merken, dass es funktioniert, koennen wir jederzeit weitere Services dazunehmen.

### Wie messe ich, ob sich das lohnt?

Wir richten ein Analytics-Dashboard ein, das Ihnen zeigt, wie viele Besucher Ihre Website hat, woher sie kommen und welche Aktionen sie durchfuehren. So sehen Sie genau, was funktioniert.', 3);
