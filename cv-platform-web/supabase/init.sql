-- Enable the UUID extension
create extension if not exists "uuid-ossp";

-- 1. Projects Table
create table projects (
  id uuid primary key default uuid_generate_v4(),
  magic_token uuid default uuid_generate_v4(),
  email text not null,
  status text check (status in ('draft', 'published')) default 'draft',
  domain text,
  vibe jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Files Table
create table files (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade not null,
  path text not null,
  content text,
  updated_at timestamp with time zone default now(),
  unique(project_id, path)
);

-- 3. Enable RLS (Row Level Security)
alter table projects enable row level security;
alter table files enable row level security;

-- 4. Create Policies (OPEN FOR PROTOTYPE - We control access via Magic Link in App Logic)
-- In a production app, we would secure this by checking the auth.uid(), but for this
-- "Magic Link" architecture, we will allow the API (using server keys) to do what it needs.
create policy "Enable all access for now" on projects for all using (true);
create policy "Enable all access for now" on files for all using (true);

-- Sessions Table (for edit limits and authentication)
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  edits_remaining INTEGER DEFAULT 5,
  is_premium BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (managed by app logic)
CREATE POLICY "Enable all access for sessions" ON sessions
    FOR ALL USING (true) WITH CHECK (true);

-- Used Checkouts Table (for payment verification - prevents Typeform bypass)
CREATE TABLE IF NOT EXISTS used_checkouts (
  checkout_id TEXT PRIMARY KEY,
  email TEXT,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for used_checkouts
ALTER TABLE used_checkouts ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (managed by app logic)
CREATE POLICY "Enable all access for used_checkouts" ON used_checkouts
    FOR ALL USING (true) WITH CHECK (true);
