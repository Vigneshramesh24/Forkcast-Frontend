-- Create table to store per-user API keys for Lovable/Gemini
create table if not exists user_api_keys (
  user_id uuid primary key,
  api_key text not null,
  updated_at timestamptz default now()
);

-- Optional: give RLS policies later to restrict access via Supabase authenticated role
