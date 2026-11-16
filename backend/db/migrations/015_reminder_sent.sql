-- Hari terakhir pengingat belajar terkirim (tanggal lokal REMINDER_TZ), agar tidak dobel dan tahan restart
ALTER TABLE notification_settings ADD COLUMN IF NOT EXISTS last_reminder_sent_on DATE;
