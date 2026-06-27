-- Game Foundry Studio Supabase identity bootstrap DDL
-- Scope: Supabase account identity tables only.
-- Product data uses the configured server product-data connection.
-- No password tables are created here; passwords remain owned by Supabase Auth.
-- users.key is the authoritative ownership reference for app records.

begin;

create table if not exists public.users (
    key text primary key,
    "displayName" text not null default 'Creator',
    email text,
    "authProvider" text,
    "authProviderUserId" text,
    "isActive" boolean not null default true,
    "createdAt" timestamptz not null default now(),
    "updatedAt" timestamptz not null default now(),
    "createdBy" text references public.users(key) on delete set null,
    "updatedBy" text references public.users(key) on delete set null,
    constraint users_auth_identity_unique unique ("authProvider", "authProviderUserId"),
    constraint users_no_mock_auth_provider check ("authProvider" is null or "authProvider" <> 'mock')
);

create unique index if not exists idx_users_email_unique_not_null
    on public.users (lower(email))
    where email is not null;

create index if not exists idx_users_createdby on public.users ("createdBy");
create index if not exists idx_users_updatedby on public.users ("updatedBy");

create table if not exists public.roles (
    key text primary key,
    "roleSlug" text not null unique,
    name text not null,
    description text not null default '',
    "isSystemRole" boolean not null default false,
    "isActive" boolean not null default true,
    "createdAt" timestamptz not null default now(),
    "updatedAt" timestamptz not null default now(),
    "createdBy" text not null references public.users(key),
    "updatedBy" text not null references public.users(key)
);

create index if not exists idx_roles_createdby on public.roles ("createdBy");
create index if not exists idx_roles_updatedby on public.roles ("updatedBy");

create table if not exists public.user_roles (
    key text primary key,
    "userKey" text not null references public.users(key) on delete cascade,
    "roleKey" text not null references public.roles(key) on delete cascade,
    "createdAt" timestamptz not null default now(),
    "updatedAt" timestamptz not null default now(),
    "createdBy" text not null references public.users(key),
    "updatedBy" text not null references public.users(key),
    constraint user_roles_user_role_unique unique ("userKey", "roleKey")
);

create index if not exists idx_user_roles_userkey on public.user_roles ("userKey");
create index if not exists idx_user_roles_rolekey on public.user_roles ("roleKey");
create index if not exists idx_user_roles_createdby on public.user_roles ("createdBy");
create index if not exists idx_user_roles_updatedby on public.user_roles ("updatedBy");

alter table public.users enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;

revoke all on public.users from anon, authenticated;
revoke all on public.roles from anon, authenticated;
revoke all on public.user_roles from anon, authenticated;

grant select, insert, update, delete on public.users to service_role;
grant select, insert, update, delete on public.roles to service_role;
grant select, insert, update, delete on public.user_roles to service_role;

notify pgrst, 'reload schema';

commit;
