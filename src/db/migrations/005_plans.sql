CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    goal TEXT NOT NULL,
    race_date DATE,
    duration_weeks INTEGER,
    current_week INTEGER DEFAULT 1,
    raw_plan JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, completed, or paused
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);