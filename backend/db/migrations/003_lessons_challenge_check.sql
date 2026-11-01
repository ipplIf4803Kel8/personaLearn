ALTER TABLE lessons ADD COLUMN IF NOT EXISTS video_url TEXT NOT NULL DEFAULT '';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';

ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_period_check;
ALTER TABLE challenges ADD CONSTRAINT challenges_period_check CHECK (ends_at >= starts_at);
