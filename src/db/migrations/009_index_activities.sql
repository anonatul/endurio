CREATE INDEX idx_activities_user_date
ON activities (user_id, sport_type, start_date_local);