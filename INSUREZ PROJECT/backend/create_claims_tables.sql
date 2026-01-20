-- Migration: Add Claims and Claim Documents tables
-- Run this script to add the new tables for the Claims Filing feature

-- Create claims table
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

-- Create claim_documents table
CREATE TABLE IF NOT EXISTS claim_documents (
    document_id SERIAL PRIMARY KEY,
    claim_id INTEGER NOT NULL REFERENCES claims(claim_id) ON DELETE CASCADE,
    s3_key VARCHAR(500) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    size_bytes BIGINT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_policy_id ON claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claim_documents_claim_id ON claim_documents(claim_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_claims_updated_at 
    BEFORE UPDATE ON claims 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE claims IS 'Insurance claims filed by users';
COMMENT ON TABLE claim_documents IS 'Documents uploaded for insurance claims';