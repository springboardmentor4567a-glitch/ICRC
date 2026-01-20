-- SQL script to clean duplicate policies and insert unique ICR policies
-- Run this in pgAdmin connected to infosysprojectdb database

-- Step 1: Remove all existing policies to eliminate duplicates
DELETE FROM policies;

-- Step 2: Insert 10 unique ICR policies
INSERT INTO policies (name, provider, type, coverage_amount, premium, duration_months, created_at) VALUES
('ICR Health Shield Plus', 'ICR Health', 'Health', 500000, 12000, 12, NOW()),
('ICR Health Shield Family', 'ICR Health', 'Health', 1000000, 18500, 12, NOW()),
('ICR Senior Care Shield', 'ICR Health', 'Health', 750000, 22000, 12, NOW()),
('ICR Smart Life Secure', 'ICR Life', 'Life', 2500000, 15000, 120, NOW()),
('ICR Term Protect 1Cr', 'ICR Life', 'Life', 10000000, 9999, 360, NOW()),
('ICR Child Education Guard', 'ICR Life', 'Life', 1500000, 13500, 180, NOW()),
('ICR Income Secure Plan', 'ICR Life', 'Life', 2000000, 17000, 240, NOW()),
('ICR Motor Protect Plus', 'ICR General', 'Motor', 500000, 8000, 12, NOW()),
('ICR Motor Zero-Dep', 'ICR General', 'Motor', 750000, 11500, 12, NOW()),
('ICR Travel Guard', 'ICR General', 'Travel', 200000, 5000, 12, NOW());

-- Step 3: Verify unique policies were inserted
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
ORDER BY type, name;

-- Step 4: Check for any duplicates (should return 0 rows)
SELECT name, provider, type, COUNT(*) as duplicate_count
FROM policies 
GROUP BY name, provider, type 
HAVING COUNT(*) > 1;