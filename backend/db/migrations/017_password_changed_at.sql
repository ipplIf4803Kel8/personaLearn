-- Token yang terbit sebelum waktu ini tidak berlaku lagi (dicek di requireAuth)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;
