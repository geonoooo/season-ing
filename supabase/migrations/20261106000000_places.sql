create type public.place_kind as enum ('stall', 'shop');
create type public.place_category as enum ('bungeoppang', 'bangeo');
create type public.weekday as enum ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');

create table public.places (
  id uuid primary key default gen_random_uuid(),
  kind public.place_kind not null,
  category public.place_category not null,
  lat double precision not null,
  lng double precision not null,
  address text not null,
  bundle_count integer check (bundle_count > 0),
  bundle_price integer check (bundle_price > 0),
  open_days public.weekday[] not null default '{}',
  kakao_place_id text,
  name text,
  kakao_category text,
  phone text,
  created_by uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  check (kind <> 'stall' or (category = 'bungeoppang' and bundle_count is not null and bundle_price is not null)),
  check (kind <> 'shop' or (kakao_place_id is not null and name is not null and kakao_category is not null)),
  unique (category, kakao_place_id)
);

create index places_area_idx on public.places (category, lat, lng);
create index places_reporter_idx on public.places (created_by, created_at);

create table public.place_likes (
  place_id uuid not null references public.places on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  primary key (place_id, user_id)
);

create table public.place_tags (
  place_id uuid not null references public.places on delete cascade,
  label text not null check (char_length(label) between 1 and 12),
  user_id uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  primary key (place_id, label, user_id)
);

create table public.stall_checks (
  place_id uuid not null references public.places on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  checked_on date not null,
  is_still_there boolean not null,
  checked_at timestamptz not null default now(),
  primary key (place_id, user_id, checked_on)
);

-- 테이블은 아무도 직접 읽고 쓰지 못하게 막고, 아래 함수로만 다룬다
alter table public.places enable row level security;
alter table public.place_likes enable row level security;
alter table public.place_tags enable row level security;
alter table public.stall_checks enable row level security;
revoke all on public.places, public.place_likes, public.place_tags, public.stall_checks
  from anon, authenticated;

create schema private;

create function private.require_user_id()
returns uuid
language plpgsql
stable
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  return auth.uid();
end;
$$;

create function public.places_in_area(
  p_category public.place_category,
  p_south double precision,
  p_west double precision,
  p_north double precision,
  p_east double precision
)
returns table (
  id uuid,
  kind public.place_kind,
  category public.place_category,
  lat double precision,
  lng double precision,
  address text,
  bundle_count integer,
  bundle_price integer,
  open_days public.weekday[],
  kakao_place_id text,
  name text,
  kakao_category text,
  phone text,
  like_count integer,
  is_liked boolean,
  tags jsonb,
  last_confirmed_at timestamptz,
  gone_count integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id,
    p.kind,
    p.category,
    p.lat,
    p.lng,
    p.address,
    p.bundle_count,
    p.bundle_price,
    p.open_days,
    p.kakao_place_id,
    p.name,
    p.kakao_category,
    p.phone,
    (select count(*)::integer from public.place_likes l where l.place_id = p.id),
    exists (select 1 from public.place_likes l where l.place_id = p.id and l.user_id = auth.uid()),
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object('label', t.label, 'count', t.tag_count, 'isMine', t.is_mine)
          order by t.tag_count desc, t.label
        )
        from (
          select
            label,
            count(*)::integer as tag_count,
            coalesce(bool_or(user_id = auth.uid()), false) as is_mine
          from public.place_tags
          where place_id = p.id
          group by label
        ) t
      ),
      '[]'::jsonb
    ),
    confirmed.last_confirmed_at,
    (
      select count(*)::integer
      from public.stall_checks g
      where g.place_id = p.id and not g.is_still_there and g.checked_at > confirmed.last_confirmed_at
    )
  from public.places p
  cross join lateral (
    select greatest(p.created_at, max(s.checked_at)) as last_confirmed_at
    from public.stall_checks s
    where s.place_id = p.id and s.is_still_there
  ) confirmed
  where p.category = p_category
    and p.lat between p_south and p_north
    and p.lng between p_west and p_east
  limit 300;
$$;

create function public.report_stall(
  p_category public.place_category,
  p_lat double precision,
  p_lng double precision,
  p_address text,
  p_bundle_count integer,
  p_bundle_price integer,
  p_open_days public.weekday[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  reporter uuid := private.require_user_id();
  new_place_id uuid;
begin
  -- 같은 기기에서 동시에 보내도 하루 3번을 넘지 않게 사용자별로 줄을 세운다
  perform pg_advisory_xact_lock(hashtextextended(reporter::text, 0));
  if (
    select count(*)
    from public.places
    where created_by = reporter
      and kind = 'stall'
      and created_at >= date_trunc('day', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul'
  ) >= 3 then
    raise exception 'daily_report_limit';
  end if;

  insert into public.places (kind, category, lat, lng, address, bundle_count, bundle_price, open_days, created_by)
  values ('stall', p_category, p_lat, p_lng, p_address, p_bundle_count, p_bundle_price, p_open_days, reporter)
  returning id into new_place_id;
  return new_place_id;
end;
$$;

create function public.save_shop(
  p_category public.place_category,
  p_kakao_place_id text,
  p_name text,
  p_kakao_category text,
  p_phone text,
  p_address text,
  p_lat double precision,
  p_lng double precision
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  saver uuid := private.require_user_id();
  saved_place_id uuid;
begin
  insert into public.places (kind, category, lat, lng, address, kakao_place_id, name, kakao_category, phone, created_by)
  values ('shop', p_category, p_lat, p_lng, p_address, p_kakao_place_id, p_name, p_kakao_category, nullif(p_phone, ''), saver)
  on conflict (category, kakao_place_id) do nothing
  returning id into saved_place_id;

  if saved_place_id is null then
    select id into saved_place_id
    from public.places
    where category = p_category and kakao_place_id = p_kakao_place_id;
  end if;
  return saved_place_id;
end;
$$;

create function public.set_like(p_place_id uuid, p_liked boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  liker uuid := private.require_user_id();
begin
  if p_liked then
    insert into public.place_likes (place_id, user_id) values (p_place_id, liker) on conflict do nothing;
  else
    delete from public.place_likes where place_id = p_place_id and user_id = liker;
  end if;
end;
$$;

create function public.set_tag(p_place_id uuid, p_label text, p_tagged boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  tagger uuid := private.require_user_id();
begin
  if p_tagged then
    insert into public.place_tags (place_id, label, user_id)
    values (p_place_id, btrim(p_label), tagger)
    on conflict do nothing;
  else
    delete from public.place_tags where place_id = p_place_id and label = btrim(p_label) and user_id = tagger;
  end if;
end;
$$;

create function public.check_stall(p_place_id uuid, p_is_still_there boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  checker uuid := private.require_user_id();
begin
  if not exists (select 1 from public.places where id = p_place_id and kind = 'stall') then
    raise exception 'not_a_stall';
  end if;

  insert into public.stall_checks (place_id, user_id, checked_on, is_still_there)
  values (p_place_id, checker, (now() at time zone 'Asia/Seoul')::date, p_is_still_there)
  on conflict (place_id, user_id, checked_on)
  do update set is_still_there = excluded.is_still_there, checked_at = now();
end;
$$;

revoke execute on function
  public.places_in_area(public.place_category, double precision, double precision, double precision, double precision),
  public.report_stall(public.place_category, double precision, double precision, text, integer, integer, public.weekday[]),
  public.save_shop(public.place_category, text, text, text, text, text, double precision, double precision),
  public.set_like(uuid, boolean),
  public.set_tag(uuid, text, boolean),
  public.check_stall(uuid, boolean)
from public, anon;

-- 둘러보기는 로그인 없이도 되고, 쓰기는 익명 로그인한 사용자만 한다
grant execute on function
  public.places_in_area(public.place_category, double precision, double precision, double precision, double precision)
to anon;

grant execute on function
  public.places_in_area(public.place_category, double precision, double precision, double precision, double precision),
  public.report_stall(public.place_category, double precision, double precision, text, integer, integer, public.weekday[]),
  public.save_shop(public.place_category, text, text, text, text, text, double precision, double precision),
  public.set_like(uuid, boolean),
  public.set_tag(uuid, text, boolean),
  public.check_stall(uuid, boolean)
to authenticated;
