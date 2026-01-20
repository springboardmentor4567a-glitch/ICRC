-- INSUREZ Claims Status Tracking - Database Setup & Test Script
-- Run this script to ensure Claims Status Tracking works properly

-- 1. Ensure claims table exists
CREATE TABLE IF NOT EXISTS claims (
    claim_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    policy_id INTEGER NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    claim_type VARCHAR(100) NOT NULL,
    incident_date DATE NOT NULL,
    location TEXT NOT NULL,
    amount_requested NUMERIC(10,2) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);

-- 3. Insert sample claims for testing (adjust user_id and policy_id as needed)
-- First, check what users and policies exist
SELECT 'Users:' as info;
SELECT id, email FROM users LIMIT 5;

SELECT 'Policies:' as info;
SELECT id, name, provider FROM policies LIMIT 5;

-- Insert sample claims (replace user_id=1 and policy_id values with actual IDs from above)
INSERT INTO claims (user_id, policy_id, claim_type, incident_date, location, amount_requested, description, status, created_at) VALUES
(1, 1, 'Health', '2024-01-10', 'Mumbai, Maharashtra', 50000.00, 'Emergency surgery for appendicitis', 'pending', NOW() - INTERVAL '2 days'),
(1, 2, 'Motor', '2024-01-08', 'Delhi, India', 25000.00, 'Vehicle accident damage repair', 'approved', NOW() - INTERVAL '5 days'),
(1, 3, 'Health', '2024-01-05', 'Bangalore, Karnataka', 75000.00, 'Cancer treatment expenses', 'paid', NOW() - INTERVAL '10 days'),
(1, 1, 'Life', '2024-01-12', 'Chennai, Tamil Nadu', 100000.00, 'Critical illness claim', 'pending', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- 4. Verify claims were inserted
SELECT 'Sample Claims Created:' as info;
SELECT 
    claim_id,
    claim_type,
    amount_requested,
    status,
    location,
    created_at
FROM claims 
ORDER BY created_at DESC;

-- 5. Test the API endpoint data structure
SELECT 'API Response Structure Test:' as info;
SELECT 
    claim_id,
    user_id,
    policy_id,
    claim_type,
    incident_date,
    location,
    amount_requested,
    description,
    status,
    created_at,
    updated_at
FROM claims 
WHERE user_id = 1
ORDER BY created_at DESC;

-- 6. Test status filtering
SELECT 'Status Counts:' as info;
SELECT 
    status,
    COUNT(*) as count
FROM claims 
WHERE user_id = 1
GROUP BY status
ORDER BY status;

COMMENT ON TABLE claims IS 'Fixed Claims Status Tracking - Production Ready';