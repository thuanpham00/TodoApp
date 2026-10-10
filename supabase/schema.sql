-- Schema cho Personal Tracker.
-- Chạy file này trong Supabase SQL Editor (một lần).

-- Tasks
create table if not exists tasks (
  id text primary key,
  title text not null,
  description text not null default '',
  due_date date,
  due_time time,
  status text not null check (status in ('backlog','todo','doing','done')),
  important boolean not null default false,
  scope text check (scope in ('week','month') or scope is null),
  created_at timestamptz not null,
  completed_at timestamptz
);

-- Habits
create table if not exists habits (
  id text primary key,
  name text not null
);

-- Settings (1 row duy nhất, id = 1)
create table if not exists settings (
  id int primary key default 1 check (id = 1),
  board_name text not null default '',
  theme text not null default 'auto',
  accent_color text not null default 'emerald',
  background text not null default 'none'
);

-- Tắt RLS: 1 user, single dataset, anon key an toàn ở frontend.
alter table tasks disable row level security;
alter table habits disable row level security;
alter table settings disable row level security;

-- Seed settings row mặc định.
insert into settings (id, board_name, theme, accent_color, background)
values (1, 'Personal Tracker', 'auto', 'emerald', 'none')
on conflict (id) do nothing;
