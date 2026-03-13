-- Alle bestehenden Leads ohne Bundesland auf Schleswig-Holstein setzen
-- (Alle 272 geseedeten Leads sind Kreis Stormarn / Landkreis Harburg)
UPDATE leads SET bundesland = 'Schleswig-Holstein' WHERE bundesland IS NULL;
