-- SQL script to verify unique policies in infosysprojectdb
-- Run these queries in pgAdmin to verify the data

-- 1. Check for duplicate policies (should return 0 rows)
SELECT name, type, provider, COUNT(*) as duplicate_count
FROM policies 
GROUP BY name, type, provider 
HAVING COUNT(*) > 1;

-- 2. View all policies grouped by type
SELECT 
    type,
    COUNT(*) as policy_count
FROM policies 
GROUP BY type
ORDER BY type;

-- 3. View all policies with details
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

-- 4. Check total count
SELECT COUNT(*) as total_policies FROM policies;