-- SQL INSERT statements for 9 ICR sample policies
-- Run these in pgAdmin or any PostgreSQL client connected to infosysprojectdb

-- Insert 9 ICR sample policies for Browse Policies 3x3 grid
INSERT INTO policies (name, provider, type, coverage_amount, premium, duration_months, created_at) VALUES
('ICR Health Shield Plus', 'ICR Health', 'Health', 500000, 12000, 12, NOW()),
('ICR Health Shield Family', 'ICR Health', 'Health', 1000000, 18500, 12, NOW()),
('ICR Smart Life Secure', 'ICR Life', 'Life', 2500000, 15000, 120, NOW()),
('ICR Term Protect 1Cr', 'ICR Life', 'Life', 10000000, 9999, 360, NOW()),
('ICR Motor Protect Plus', 'ICR General', 'Motor', 500000, 8000, 12, NOW()),
('ICR Motor Zero-Dep', 'ICR General', 'Motor', 750000, 11500, 12, NOW()),
('ICR Senior Care Shield', 'ICR Health', 'Health', 750000, 22000, 12, NOW()),
('ICR Child Education Guard', 'ICR Life', 'Life', 1500000, 13500, 180, NOW()),
('ICR Income Secure Plan', 'ICR Life', 'Life', 2000000, 17000, 240, NOW())
ON CONFLICT (name) DO NOTHING;

-- Verify the policies were inserted
SELECT 
    id, 
    name, 
    provider, 
    type, 
    coverage_amount, 
    premium, 
    duration_months
FROM policies 
WHERE provider LIKE 'ICR%'
ORDER BY id;