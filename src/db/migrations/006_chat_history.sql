CREATE TABLE IF NOT EXISTS chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user' or 'assistant',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);