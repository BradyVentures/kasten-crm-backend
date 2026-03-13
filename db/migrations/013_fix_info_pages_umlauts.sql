-- Migration 013: Fix umlauts in info_pages content (ae→ä, oe→ö, ue→ü, etc.)

-- Gesprächsleitfaden
UPDATE info_pages SET
  title = 'Gesprächsleitfaden',
  content = '## 1. Begrüßung & Einstieg

Hallo [Name], hier ist [Ihr Name] von Brady Digital. Vielen Dank, dass Sie sich kurz Zeit nehmen.

Wir helfen lokalen Unternehmen in der Region dabei, online besser sichtbar zu werden und neue Kunden zu gewinnen. Ich wollte mich kurz vorstellen und hören, wie es bei Ihnen aktuell läuft.

## 2. Bedarfsanalyse

Stellen Sie diese Fragen, um den Bedarf zu verstehen:

- Wie finden Ihre Kunden Sie aktuell? (Empfehlung, Google, Social Media?)
- Haben Sie eine Website? Wenn ja, wie zufrieden sind Sie damit?
- Nutzen Sie Google My Business / Google Unternehmensprofil?
- Wie läuft die Terminbuchung bei Ihnen? (Telefon, Online, E-Mail?)
- Was ist Ihre größte Herausforderung beim Thema Neukunden?
- Haben Sie schon mal mit einer Agentur zusammengearbeitet?

**Tipp:** Zuhören ist wichtiger als reden. Notieren Sie die Schmerzpunkte.

## 3. Überleitung zum Angebot

Basierend auf dem, was Sie mir erzählt haben, hätte ich da ein paar konkrete Ideen, wie wir Ihnen helfen können...

**Faustregel:** Maximal 2-3 Services vorschlagen, die zum Problem passen. Nicht alles auf einmal.

## 4. Produktvorstellung

- Erklären Sie den Service in einfachen Worten (nutzen Sie den Service-Katalog)
- Zeigen Sie den konkreten Nutzen für den Kunden
- Nennen Sie wenn möglich ein Beispiel oder eine Referenz
- Nennen Sie den Preis selbstbewusst und ohne zu zögern

## 5. Abschluss

- Soll ich Ihnen ein konkretes Angebot zusammenstellen?
- Wann wäre ein guter Zeitpunkt, um die nächsten Schritte zu besprechen?
- Ich schicke Ihnen eine kurze Zusammenfassung per E-Mail.

**Wichtig:** Immer einen konkreten nächsten Schritt vereinbaren. Nie das Gespräch offen enden lassen.'
WHERE slug = 'gespraechsleitfaden';

-- Einwandbehandlung
UPDATE info_pages SET
  title = 'Einwandbehandlung',
  content = '## Häufige Einwände und Antworten

### "Das ist mir zu teuer"

Das verstehe ich. Lassen Sie mich kurz erklären, was Sie dafür bekommen und warum sich die Investition lohnt. Wenn wir Ihnen zum Beispiel nur 5 neue Kunden pro Monat bringen, hat sich das schnell gerechnet. Außerdem bieten wir flexible Pakete an, die wir an Ihr Budget anpassen können.

### "Ich habe schon eine Website"

Super, dann haben Sie schon eine gute Grundlage. Darf ich mal einen Blick drauf werfen? Oft gibt es ein paar Stellschrauben, mit denen man deutlich mehr rausholen kann, zum Beispiel bei der Google-Sichtbarkeit oder der Ladegeschwindigkeit. Das können wir kostenlos prüfen.

### "Ich brauche keine Werbung, ich lebe von Empfehlungen"

Empfehlungen sind super und das zeigt, dass Sie gute Arbeit machen. Aber was passiert, wenn jemand Sie empfohlen bekommt und dann online nach Ihnen sucht? Finden die dann sofort Ihre Telefonnummer, Bewertungen und Öffnungszeiten? Genau dabei helfen wir.

### "Ich habe schon mal schlechte Erfahrungen mit einer Agentur gemacht"

Das höre ich leider öfter. Deswegen arbeiten wir transparent: Sie sehen jederzeit, was wir machen, und können monatlich kündigen. Kein Kleingedrucktes, keine langen Verträge.

### "Ich muss darüber nachdenken"

Natürlich, nehmen Sie sich die Zeit. Darf ich Ihnen eine kurze Zusammenfassung per E-Mail schicken? Dann haben Sie alles schwarz auf weiß. Und wann wäre ein guter Zeitpunkt, kurz nachzuhaken?

### "Mein Sohn / Neffe / Bekannter macht das"

Das ist praktisch. Kommt er denn dazu, sich regelmäßig darum zu kümmern? Online-Marketing ist leider keine einmalige Sache. Wir können auch ergänzend dazu arbeiten und die Dinge übernehmen, die mehr Expertise oder Zeit brauchen.

### "Ich bin zu beschäftigt dafür"

Genau deswegen sind wir da. Wir übernehmen alles und Sie müssen sich um nichts kümmern. Einmal einrichten und dann läuft es. Sie investieren jetzt 15 Minuten und sparen danach Stunden.'
WHERE slug = 'einwandbehandlung';

-- FAQ
UPDATE info_pages SET
  title = 'Häufige Kundenfragen',
  content = '## Fragen die Kunden oft stellen

### Wie lange dauert es, bis meine Website fertig ist?

Eine Standard-Website ist in der Regel innerhalb von 2-3 Wochen fertig. Wir brauchen von Ihnen Texte und Bilder, den Rest machen wir. Bei einem Online-Shop kann es 4-6 Wochen dauern.

### Was kostet mich das pro Monat?

Das hängt davon ab, welche Services Sie brauchen. Eine einfache Website ist eine einmalige Investition. Laufende Services wie SEO oder Social Media starten ab 150 Euro pro Monat. Wir schnüren Ihnen ein Paket, das zu Ihrem Budget passt.

### Kann ich die Website selbst bearbeiten?

Ja, wir bauen Ihre Website so, dass Sie einfache Änderungen wie Texte oder Bilder selbst machen können. Für größere Änderungen sind wir natürlich da.

### Was passiert, wenn ich kündigen will?

Bei monatlichen Services können Sie jederzeit zum Monatsende kündigen. Keine langen Vertragslaufzeiten. Ihre Website gehört natürlich Ihnen.

### Brauche ich wirklich eine neue Website?

Nicht unbedingt. Manchmal reichen ein paar Optimierungen. Wir schauen uns Ihre aktuelle Website kostenlos an und sagen Ihnen ehrlich, ob eine neue sinnvoll ist oder ob Optimierungen reichen.

### Was ist SEO und brauche ich das?

SEO bedeutet Suchmaschinenoptimierung. Damit sorgen wir dafür, dass Ihre Website bei Google gefunden wird, wenn jemand nach Ihren Dienstleistungen sucht. Für lokale Unternehmen ist das besonders wichtig und effektiv.

### Kann ich erst mal klein anfangen?

Absolut. Wir empfehlen sogar, mit den Basics anzufangen: Website und Google-Profil. Wenn Sie merken, dass es funktioniert, können wir jederzeit weitere Services dazunehmen.

### Wie messe ich, ob sich das lohnt?

Wir richten ein Analytics-Dashboard ein, das Ihnen zeigt, wie viele Besucher Ihre Website hat, woher sie kommen und welche Aktionen sie durchführen. So sehen Sie genau, was funktioniert.'
WHERE slug = 'faq';
