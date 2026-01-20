-- Sample claims for testing Claims Status Tracking
-- Run after creating claims tables and having users/policies

-- Insert sample claims (assuming user_id=1 and policy_id=1 exist)
INSERT INTO claims (user_id, policy_id, claim_type, incident_date, location, amount_requested, description, status, created_at) VALUES
(1, 1, 'Health', '2024-01-10', 'Mumbai, Maharashtra', 50000.00, 'Emergency surgery for appendicitis', 'pending', NOW() - INTERVAL '2 days'),
(1, 2, 'Motor', '2024-01-08', 'Delhi, India', 25000.00, 'Vehicle accident damage repair', 'approved', NOW() - INTERVAL '5 days'),
(1, 3, 'Health', '2024-01-05', 'Bangalore, Karnataka', 75000.00, 'Cancer treatment expenses', 'paid', NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- Verify claims were inserted
SELECT 
    claim_id,
    claim_type,
    amount_requested,
    status,
    created_at,
    location
FROM claims 
ORDER BY created_at DESC;