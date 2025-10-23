-- Add OAuth support to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'email',
ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Make password_hash nullable for OAuth users
ALTER TABLE users 
ALTER COLUMN password_hash DROP NOT NULL;

-- Add unique constraint for provider + provider_id combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_id 
ON users(provider, provider_id) 
WHERE provider != 'email';

-- Add index for faster OAuth lookups
CREATE INDEX IF NOT EXISTS idx_users_provider 
ON users(provider);
