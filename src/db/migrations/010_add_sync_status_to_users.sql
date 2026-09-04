ALTER TABLE users
ADD COLUMN initial_sync_status BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN last_sync_status DATE DEFAULT null;