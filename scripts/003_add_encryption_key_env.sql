-- This is a reminder to add ENCRYPTION_KEY to your environment variables
-- You can use the JWT_SECRET as fallback, but it's recommended to have a separate key
-- Generate a secure key with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

-- No SQL changes needed, just a reminder for environment configuration
SELECT 'Remember to add ENCRYPTION_KEY to your environment variables' AS reminder;
