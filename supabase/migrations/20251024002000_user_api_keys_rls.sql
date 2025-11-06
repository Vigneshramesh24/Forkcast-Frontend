-- Enable Row Level Security and add policies for user_api_keys

-- Require authenticated insert/update/select only for the owning user
alter table if exists public.user_api_keys enable row level security;

-- Allow only the owner to select their key
create policy if not exists "select_own_api_key" on public.user_api_keys
  for select using (auth.uid() = user_id);

-- Allow only the owner to insert or update their key (and ensure user_id matches auth.uid())
create policy if not exists "upsert_own_api_key" on public.user_api_keys
  for insert, update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Prevent others from deleting (no delete policy) -- only service role should delete if needed
