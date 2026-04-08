CREATE TABLE offer_number_sequence (
    year    INTEGER PRIMARY KEY,
    counter INTEGER NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION next_offer_number() RETURNS VARCHAR(50) AS $$
DECLARE
    current_year INTEGER := EXTRACT(YEAR FROM NOW());
    next_num INTEGER;
BEGIN
    INSERT INTO offer_number_sequence (year, counter) VALUES (current_year, 1)
    ON CONFLICT (year) DO UPDATE SET counter = offer_number_sequence.counter + 1
    RETURNING counter INTO next_num;

    RETURN 'BK-' || current_year || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
