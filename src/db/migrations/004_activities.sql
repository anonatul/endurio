CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    strava_activity_id TEXT UNIQUE NOT NULL,
    sport_type TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    start_date_local TIMESTAMPTZ NOT NULL,
    distance FLOAT NOT NULL,
    moving_time INTEGER NOT NULL,
    elapsed_time INTEGER NOT NULL,
    average_speed FLOAT NOT NULL,
    max_speed FLOAT NOT NULL,
    average_heartrate FLOAT,
    max_heartrate FLOAT,
    total_elevation_gain FLOAT NOT NULL,
    workout_type INTEGER NOT NULL,
    raw_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);