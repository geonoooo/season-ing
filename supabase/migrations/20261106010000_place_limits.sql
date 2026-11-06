-- 브라우저가 보내는 값의 범위를 DB에서 막는다. 서비스 지역이 한국이라 좌표도 한국 안으로 제한한다
alter table public.places
  add constraint places_lat_in_korea check (lat between 33 and 39),
  add constraint places_lng_in_korea check (lng between 124 and 132),
  add constraint places_address_length check (char_length(address) between 1 and 200),
  add constraint places_name_length check (char_length(name) between 1 and 100),
  add constraint places_kakao_category_length check (char_length(kakao_category) <= 50),
  add constraint places_phone_length check (char_length(phone) <= 20),
  add constraint places_kakao_place_id_format check (kakao_place_id ~ '^[0-9]{1,20}$'),
  add constraint places_bundle_count_max check (bundle_count <= 100),
  add constraint places_bundle_price_max check (bundle_price <= 100000);

create or replace function public.places_in_area(
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
  -- 300곳이 넘을 때 호출마다 다른 일부가 나오지 않게 순서를 고정한다
  order by p.created_at desc, p.id
  limit 300;
$$;

create or replace function public.save_shop(
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
  select id into saved_place_id
  from public.places
  where category = p_category and kakao_place_id = p_kakao_place_id;
  if saved_place_id is not null then
    return saved_place_id;
  end if;

  -- 이미 저장된 가게는 세지 않고, 새로 저장하는 가게만 사용자별로 하루 30곳까지 받는다
  perform pg_advisory_xact_lock(hashtextextended(saver::text, 0));
  if (
    select count(*)
    from public.places
    where created_by = saver
      and kind = 'shop'
      and created_at >= date_trunc('day', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul'
  ) >= 30 then
    raise exception 'daily_save_limit';
  end if;

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

create or replace function public.set_tag(p_place_id uuid, p_label text, p_tagged boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  tagger uuid := private.require_user_id();
begin
  if not p_tagged then
    delete from public.place_tags where place_id = p_place_id and label = btrim(p_label) and user_id = tagger;
    return;
  end if;

  -- 한 사람이 장소 하나에 태그를 끝없이 달아 상세 화면을 덮지 못하게 5개까지만 받는다
  perform pg_advisory_xact_lock(hashtextextended(tagger::text, 0));
  if (
    select count(*)
    from public.place_tags
    where place_id = p_place_id and user_id = tagger and label <> btrim(p_label)
  ) >= 5 then
    raise exception 'tag_limit';
  end if;

  insert into public.place_tags (place_id, label, user_id)
  values (p_place_id, btrim(p_label), tagger)
  on conflict do nothing;
end;
$$;
