-- SQL INSERT statements to seed realistic insurance policies
-- Run these in pgAdmin or any PostgreSQL client connected to your infosysprojectdb database

-- Clear existing policies (optional - remove this line if you want to keep existing data)
-- DELETE FROM policies;

-- Insert sample insurance policies
INSERT INTO policies (name, provider, type, coverage_amount, premium, duration_months, created_at) VALUES
('Comprehensive Health Shield', 'Star Health Insurance', 'Health', 500000, 12000, 12, NOW()),
('Family Floater Plus', 'HDFC ERGO', 'Health', 1000000, 18500, 12, NOW()),
('Term Life Secure', 'LIC of India', 'Life', 2500000, 15000, 240, NOW()),
('Motor Complete Protection', 'Bajaj Allianz', 'Motor', 800000, 8500, 12, NOW()),
('Critical Illness Cover', 'Max Bupa', 'Health', 750000, 22000, 12, NOW()),
('Two Wheeler Insurance', 'ICICI Lombard', 'Motor', 150000, 3500, 12, NOW()),
('Whole Life Premium', 'SBI Life', 'Life', 5000000, 45000, 300, NOW()),
('Senior Citizen Health', 'Oriental Insurance', 'Health', 300000, 16000, 12, NOW())
ON CONFLICT (name) DO NOTHING;

-- Verify the data was inserted
SELECT 
    id, 
    name, 
    provider, 
    type, 
    coverage_amount, 
    premium, 
    duration_months,
    created_at
FROM policies 
ORDER BY created_at DESC;