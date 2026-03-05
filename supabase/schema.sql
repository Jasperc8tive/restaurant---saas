-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Menu Categories
create table menu_categories (
  id uuid default gen_random_uuid() primary key,
  restaurant_id uuid not null,
  name text not null,
  sort_order integer default 0
);

-- Menu Items
create table menu_items (
  id uuid default gen_random_uuid() primary key,
  restaurant_id uuid not null,
  category_id uuid references menu_categories(id) on delete set null,
  name text not null,
  description text,
  price decimal(10,2) not null,
  image_url text,
  available boolean default true,
  created_at timestamptz default now()
);

-- Tables
create table tables (
  id uuid default gen_random_uuid() primary key,
  restaurant_id uuid not null,
  table_number integer not null,
  created_at timestamptz default now(),
  unique(restaurant_id, table_number)
);

-- Orders
create table orders (
  id uuid default gen_random_uuid() primary key,
  restaurant_id uuid not null,
  table_id uuid references tables(id),
  table_number integer not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'preparing', 'ready', 'completed')),
  total decimal(10,2) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Order Items
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  name text not null,
  price decimal(10,2) not null,
  quantity integer not null,
  notes text
);

-- Auto-update updated_at on orders
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger orders_updated_at
  before update on orders
  for each row execute procedure update_updated_at();

-- Enable Row Level Security (allow all for now — add auth later)
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
alter table tables enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "Public read menu_categories" on menu_categories for select using (true);
create policy "Public read menu_items" on menu_items for select using (true);
create policy "Public read tables" on tables for select using (true);
create policy "Public insert orders" on orders for insert with check (true);
create policy "Public read orders" on orders for select using (true);
create policy "Public update orders" on orders for update using (true);
create policy "Public insert order_items" on order_items for insert with check (true);
create policy "Public read order_items" on order_items for select using (true);

-- Service role full access (for API routes)
create policy "Service role all menu_categories" on menu_categories using (true) with check (true);
create policy "Service role all menu_items" on menu_items using (true) with check (true);
create policy "Service role all tables" on tables using (true) with check (true);
create policy "Service role all orders" on orders using (true) with check (true);
create policy "Service role all order_items" on order_items using (true) with check (true);

-- -----------------------------------------------
-- Seed data (replace RESTAURANT_ID with a real UUID)
-- -----------------------------------------------
-- INSERT INTO menu_categories (id, restaurant_id, name, sort_order) VALUES
--   ('cat-1-uuid', 'YOUR_RESTAURANT_ID', 'Starters', 1),
--   ('cat-2-uuid', 'YOUR_RESTAURANT_ID', 'Mains', 2),
--   ('cat-3-uuid', 'YOUR_RESTAURANT_ID', 'Drinks', 3);
