-- Update card_last_four column to accommodate encrypted values
-- Encrypted values are much longer than 4 characters
ALTER TABLE subscriptions 
ALTER COLUMN card_last_four TYPE VARCHAR(255);

-- Add comment to document the change
COMMENT ON COLUMN subscriptions.card_last_four IS 'Encrypted last 4 digits of card (stored as encrypted string)';
