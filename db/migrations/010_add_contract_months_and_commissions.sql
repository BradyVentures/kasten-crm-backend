-- Add contract_months to customer_services for subscription commission calculation
ALTER TABLE customer_services ADD COLUMN IF NOT EXISTS contract_months INTEGER;

-- Set default commission rates for all services
UPDATE services SET commission_rate = 10 WHERE category = 'Web-Services';
UPDATE services SET commission_rate = 10 WHERE category = 'Sichtbarkeit & Marketing';
UPDATE services SET commission_rate = 15 WHERE category = 'KI-Workflows';
UPDATE services SET commission_rate = 10 WHERE category = 'Analytics';
