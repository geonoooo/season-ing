import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const envPath = path.join(rootDir, ".env.local");
const envText = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
const kakaoKey =
  process.env.NEXT_PUBLIC_KAKAO_MAP_KEY ??
  envText.match(/^NEXT_PUBLIC_KAKAO_MAP_KEY=(.+)$/m)?.[1]?.trim();

if (!kakaoKey) {
  throw new Error("NEXT_PUBLIC_KAKAO_MAP_KEY가 설정되어 있지 않습니다 (.env.local 확인)");
}

const headers = {
  Authorization: `KakaoAK ${kakaoKey}`,
  KA: "sdk/4.4.19 os/javascript lang/ko-KR device/MacIntel origin/http%3A%2F%2Flocalhost%3A3000",
  Referer: "http://localhost:3000/",
  Origin: "http://localhost:3000",
};

async function searchKeyword(query, extraParams = {}) {
  const params = new URLSearchParams({ query, size: "15", ...extraParams });
  const res = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?${params}`, {
    headers,
  });
  if (!res.ok) {
    throw new Error(`Kakao API error (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  return data.documents ?? [];
}

async function coord2Address(lat, lng) {
  const params = new URLSearchParams({ x: String(lng), y: String(lat) });
  const res = await fetch(`https://dapi.kakao.com/v2/local/geo/coord2address.json?${params}`, {
    headers,
  });
  if (!res.ok) return null;
  const data = await res.json();
  const best = data.documents?.[0];
  return best?.road_address?.address_name || best?.address?.address_name || null;
}

const lastCategorySegment = (categoryName) =>
  categoryName.split(">").at(-1)?.trim() || categoryName || "회";

const isSeafoodPlace = (doc) =>
  /회|수산|해물|생선|일식|초밥|일본식주점|포장마차|어시장/.test(doc.category_name || "");

// 1. 서울 주요 붕어빵 노점 제보 목록 (시청·광화문·종로 도심권 + 역세권/유명 성지)
const STALL_TARGETS = [
  {
    query: "신한은행 종로지점",
    offsetLat: 0.0001,
    offsetLng: 0.0001,
    bundleCount: 3,
    bundlePrice: 2000,
    openDays: ["mon", "tue", "wed", "thu", "fri"],
    tags: ["팥 · 슈크림", "계좌이체 가능", "직장인 간식", "바삭해요"],
    likes: 18,
  },
  {
    query: "광화문역 5번출구",
    offsetLat: -0.00015,
    offsetLng: 0.0001,
    bundleCount: 3,
    bundlePrice: 2000,
    openDays: ["mon", "tue", "wed", "thu", "fri"],
    tags: ["팥 듬뿍", "슈크림 있어요", "퇴근길 성지"],
    likes: 14,
  },
  {
    query: "시청역 8번출구",
    offsetLat: 0.0001,
    offsetLng: -0.0001,
    bundleCount: 3,
    bundlePrice: 2000,
    openDays: ["mon", "tue", "wed", "thu", "fri"],
    tags: ["겉바속촉", "현금 · 이체", "따뜻해요"],
    likes: 16,
  },
  {
    query: "덕수궁 돌담길",
    offsetLat: 0.0002,
    offsetLng: 0.0001,
    bundleCount: 2,
    bundlePrice: 2000,
    openDays: ["tue", "wed", "thu", "fri", "sat", "sun"],
    tags: ["팥 · 슈크림", "산책길 간식", "계좌이체 가능"],
    likes: 12,
  },
  {
    query: "을지로입구역 3번출구",
    offsetLat: 0.0001,
    offsetLng: 0.00015,
    bundleCount: 3,
    bundlePrice: 2000,
    openDays: ["mon", "tue", "wed", "thu", "fri"],
    tags: ["슈크림 맛집", "계좌이체 가능", "줄 서서 먹어요"],
    likes: 21,
  },
  {
    query: "을지로3가역 1번출구",
    offsetLat: -0.0001,
    offsetLng: 0.0001,
    bundleCount: 3,
    bundlePrice: 2000,
    openDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
    tags: ["옛날 붕어빵", "팥이 꽉 찼어요", "현금만 가능"],
    likes: 9,
  },
  {
    query: "회현역 5번출구",
    offsetLat: 0.0001,
    offsetLng: -0.0001,
    bundleCount: 3,
    bundlePrice: 2000,
    openDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
    tags: ["남대문 명물", "팥 · 슈크림", "현금 · 이체"],
    likes: 15,
  },
  {
    query: "명동역 6번출구",
    offsetLat: 0.00015,
    offsetLng: 0.0001,
    bundleCount: 1,
    bundlePrice: 1500,
    openDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    tags: ["크림치즈 붕어", "피자붕어빵", "계좌이체 가능"],
    likes: 11,
  },
  {
    query: "광장시장 총각네붕어빵",
    fallbackQuery: "종로구 창경궁로 88",
    offsetLat: 0,
    offsetLng: 0,
    bundleCount: 1,
    bundlePrice: 1500,
    openDays: ["tue", "wed", "thu", "sat", "sun"],
    tags: ["팥 · 호두", "고구마크림치즈", "줄 서서 먹어요", "계좌이체 가능"],
    likes: 34,
  },
  {
    query: "안국역 1번출구",
    offsetLat: 0.0001,
    offsetLng: -0.0001,
    bundleCount: 3,
    bundlePrice: 2000,
    openDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
    tags: ["팥 · 슈크림", "겉바속촉", "계좌이체 가능"],
    likes: 13,
  },
  {
    query: "서대문역 4번출구",
    offsetLat: 0.0001,
    offsetLng: 0.0001,
    bundleCount: 3,
    bundlePrice: 2000,
    openDays: ["mon", "tue", "wed", "thu", "fri"],
    tags: ["팥 듬뿍", "슈크림 있어요", "계좌이체 가능"],
    likes: 10,
  },
  {
    query: "서울역 12번출구",
    offsetLat: -0.0001,
    offsetLng: 0.0001,
    bundleCount: 3,
    bundlePrice: 2000,
    openDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
    tags: ["팥 · 슈크림", "굽는 속도 빨라요", "계좌이체 가능"],
    likes: 14,
  },
  {
    query: "용산구 청파로 252",
    offsetLat: 0,
    offsetLng: 0,
    bundleCount: 3,
    bundlePrice: 2000,
    openDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
    tags: ["팥 폭탄", "행복한잉어빵", "줄 서서 먹어요", "얇고 바삭해요"],
    likes: 42,
  },
  {
    query: "용산구 효창원로 142",
    offsetLat: 0,
    offsetLng: 0,
    bundleCount: 3,
    bundlePrice: 1000,
    openDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
    tags: ["3개 천원 혜자", "김치붕어빵", "팥 · 슈크림", "효공잉어빵"],
    likes: 39,
  },
  {
    query: "공덕역 5번출구",
    offsetLat: 0.0001,
    offsetLng: 0.0001,
    bundleCount: 3,
    bundlePrice: 2000,
    openDays: ["mon", "tue", "wed", "thu", "fri"],
    tags: ["팥 · 슈크림", "계좌이체 가능", "퇴근길 성지"],
    likes: 12,
  },
  {
    query: "홍대입구역 8번출구",
    offsetLat: 0.00015,
    offsetLng: 0.00015,
    bundleCount: 6,
    bundlePrice: 3000,
    openDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    tags: ["미니 붕어빵", "팥 · 슈크림", "계좌이체 가능", "한입 크기"],
    likes: 23,
  },
  {
    query: "마포구 동교로 220",
    offsetLat: 0,
    offsetLng: 0,
    bundleCount: 3,
    bundlePrice: 2000,
    openDays: ["tue", "wed", "thu", "fri", "sat", "sun"],
    tags: ["연트럴파크", "슈크림 맛집", "계좌이체 가능"],
    likes: 17,
  },
  {
    query: "마포구 망원로 78",
    offsetLat: 0,
    offsetLng: 0,
    bundleCount: 1,
    bundlePrice: 1000,
    openDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    tags: ["팥호두붕어빵", "망원시장 입구", "속이 꽉 찼어요"],
    likes: 25,
  },
  {
    query: "마포구 양화로 56",
    offsetLat: 0.0001,
    offsetLng: -0.0001,
    bundleCount: 3,
    bundlePrice: 2000,
    openDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
    tags: ["팥 · 슈크림", "겉바속촉", "계좌이체 가능"],
    likes: 14,
  },
  {
    query: "신촌역 3번출구",
    offsetLat: 0.00015,
    offsetLng: 0.0001,
    bundleCount: 3,
    bundlePrice: 2000,
    openDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    tags: ["팥 · 슈크림", "고구마붕어빵", "계좌이체 가능"],
    likes: 19,
  },
  {
    query: "혜화역 4번출구",
    offsetLat: 0.0001,
    offsetLng: -0.0001,
    bundleCount: 4,
    bundlePrice: 2000,
    openDays: ["tue", "wed", "thu", "fri", "sat", "sun"],
    tags: ["김치치즈 붕어", "테두리 바삭함", "고구마붕어빵", "혜화 명물"],
    likes: 31,
  },
  {
    query: "성북구 보문로34길 94",
    offsetLat: 0,
    offsetLng: 0,
    bundleCount: 1,
    bundlePrice: 2000,
    openDays: ["tue", "wed", "thu", "fri", "sat", "sun"],
    tags: ["크림치즈팥", "앙버터 붕어빵", "수제 반죽"],
    likes: 22,
  },
  {
    query: "동대문구 왕산로 205",
    offsetLat: 0,
    offsetLng: 0,
    bundleCount: 3,
    bundlePrice: 2000,
    openDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    tags: ["청량리역 3출", "팥 · 슈크림", "현금 · 이체"],
    likes: 16,
  },
  {
    query: "성수역 3번출구",
    offsetLat: -0.0002,
    offsetLng: 0.0001,
    bundleCount: 3,
    bundlePrice: 2000,
    openDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
    tags: ["팥 · 슈크림", "계좌이체 가능", "겉바속촉"],
    likes: 20,
  },
  {
    query: "건대입구역 2번출구",
    offsetLat: 0.0001,
    offsetLng: 0.0001,
    bundleCount: 3,
    bundlePrice: 2000,
    openDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    tags: ["자색고구마", "팥 · 슈크림", "계좌이체 가능"],
    likes: 26,
  },
  {
    query: "성동구 행당로 133",
    offsetLat: 0,
    offsetLng: 0,
    bundleCount: 3,
    bundlePrice: 2000,
    openDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
    tags: ["앙금 묵직해요", "피자붕어빵", "줄 서서 먹어요"],
    likes: 24,
  },
  {
    query: "강남역 5번출구",
    offsetLat: -0.0002,
    offsetLng: 0.0001,
    bundleCount: 1,
    bundlePrice: 1000,
    openDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
    tags: ["호두팥붕어빵", "아몬드슈크림", "김치 · 피자"],
    likes: 28,
  },
  {
    query: "신림역 1번출구",
    offsetLat: 0.0001,
    offsetLng: -0.0001,
    bundleCount: 3,
    bundlePrice: 2000,
    openDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    tags: ["슈크림 듬뿍", "현금 · 이체", "늦게까지 해요"],
    likes: 19,
  },
  {
    query: "대림역 9번출구",
    offsetLat: 0.0001,
    offsetLng: 0.0001,
    bundleCount: 3,
    bundlePrice: 1000,
    openDays: ["mon", "tue", "wed", "thu", "fri", "sat"],
    tags: ["3개 천원 혜자", "팥 · 슈크림", "계좌이체 가능"],
    likes: 33,
  },
  {
    query: "노량진역 3번출구",
    offsetLat: 0.0001,
    offsetLng: 0.00015,
    bundleCount: 3,
    bundlePrice: 1000,
    openDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    tags: ["고시촌 가성비", "팥 · 슈크림", "현금 · 이체"],
    likes: 29,
  },
  {
    query: "여의도역 5번출구",
    offsetLat: 0.00015,
    offsetLng: -0.0001,
    bundleCount: 3,
    bundlePrice: 2000,
    openDays: ["mon", "tue", "wed", "thu", "fri"],
    tags: ["팥 · 슈크림", "계좌이체 가능", "직장인 간식"],
    likes: 15,
  },
  {
    query: "잠실역 8번출구",
    offsetLat: 0.0001,
    offsetLng: 0.0001,
    bundleCount: 3,
    bundlePrice: 2000,
    openDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    tags: ["팥 · 슈크림", "겉바속촉", "계좌이체 가능"],
    likes: 18,
  },
];

// 2. 서울 전역 대표 대방어 맛집 목록
const SHOP_TARGETS = [
  {
    query: "을지로 숙성회",
    tags: ["숙성 대방어", "을지로 와인 · 회", "웨이팅 맛집"],
    likes: 27,
  },
  {
    query: "종각 대찬횟집",
    tags: ["두툼하게 썰어줌", "종각 회식 성지", "가성비 좋아요"],
    likes: 29,
  },
  {
    query: "다동 미진일식",
    tags: ["숙성 대방어", "깔끔한 상차림", "시청 직장인 맛집"],
    likes: 18,
  },
  {
    query: "종로 제주바당",
    tags: ["대방어 · 고등어", "신선도 최고", "종각역 근처"],
    likes: 22,
  },
  {
    query: "바다회사랑 서교",
    tags: ["서울 대방어 성지", "두툼한 대방어", "지하 대기실", "포장 빨라요"],
    likes: 64,
  },
  {
    query: "합정광안리",
    tags: ["10kg 특대방어", "숙성회 맛집", "기름기 좔좔"],
    likes: 35,
  },
  {
    query: "망원 우리바다수산",
    tags: ["뱃살 비율 높음", "가성비 대방어", "동네 숨은 성지"],
    likes: 31,
  },
  {
    query: "논현 보물섬",
    tags: ["특수부위 최고", "가마살 · 배꼽살", "김치찜 별미"],
    likes: 45,
  },
  {
    query: "신논현 자매수산",
    tags: ["두툼한 식감", "웨이팅 맛집", "매운탕 맛있어요"],
    likes: 38,
  },
  {
    query: "강남 만원수산",
    tags: ["가성비 최고", "대방어 모둠", "양 푸짐해요"],
    likes: 26,
  },
  {
    query: "사당 바다당",
    tags: ["숙성 대방어", "고등어봉초밥", "웨이팅 필수"],
    likes: 41,
  },
  {
    query: "사당 우리회포차",
    tags: ["두툼하게 썰어줌", "사당 모임 성지", "묵은지 조합"],
    likes: 33,
  },
  {
    query: "노량진 형제상회",
    tags: ["특대방어 성지", "특수부위 푸짐", "포장 · 초장집"],
    likes: 58,
  },
  {
    query: "노량진 전라상회",
    tags: ["기름진 뱃살", "두께 선택 가능", "노량진 1티어"],
    likes: 52,
  },
  {
    query: "노량진 일성수산",
    tags: ["특대방어 전문", "부위별 구성", "신선도 최고"],
    likes: 34,
  },
  {
    query: "석계 남해바다마차",
    tags: ["9kg 이상 대방어", "두툼한 숙성회", "웨이팅 필수"],
    likes: 44,
  },
  {
    query: "성수 싱싱횟집",
    tags: ["묵은지 대방어", "뚝도시장 맛집", "두툼하게 썰어줌"],
    likes: 28,
  },
  {
    query: "성수 푸른바다횟집",
    tags: ["제철 대방어", "해산물 스끼다시", "성수 로컬 맛집"],
    likes: 21,
  },
  {
    query: "자양동 바다회포차",
    tags: ["건대 대방어", "양 푸짐해요", "가성비 좋아요"],
    likes: 25,
  },
  {
    query: "중곡 백일도",
    tags: ["압도적인 두께", "가성비 성지", "포장 인기"],
    likes: 36,
  },
  {
    query: "잠실 파도집",
    tags: ["숙성 대방어", "기름기 꽉 참", "송리단길 맛집"],
    likes: 32,
  },
  {
    query: "완도산회포장마차 송파",
    tags: ["두툼한 대방어", "분위기 좋아요", "신선해요"],
    likes: 19,
  },
];

const AREA_RECTS = [
  "126.960,37.555,127.000,37.580", // 시청/광화문/종각/을지로/명동
  "126.910,37.545,126.935,37.568", // 홍대/연남/합정
  "127.020,37.495,127.040,37.512", // 강남/신논현/역삼
];

console.log("1. 붕어빵 노점 좌표 및 도로명 주소 수집 중...");
const stalls = [];
for (const target of STALL_TARGETS) {
  let docs = await searchKeyword(target.query);
  if (docs.length === 0 && target.fallbackQuery) {
    docs = await searchKeyword(target.fallbackQuery);
  }
  if (docs.length === 0) continue;
  const top = docs[0];
  const lat = Number((Number(top.y) + (target.offsetLat || 0)).toFixed(6));
  const lng = Number((Number(top.x) + (target.offsetLng || 0)).toFixed(6));
  const geocodedAddress = await coord2Address(lat, lng);
  const rawAddress = geocodedAddress || top.road_address_name || top.address_name;
  const address = rawAddress.replace(/^서울특별시\s+/, "서울 ").replace(/\s+지하\s+/g, " ");
  stalls.push({
    lat,
    lng,
    address,
    bundleCount: target.bundleCount,
    bundlePrice: target.bundlePrice,
    openDays: target.openDays,
    tags: target.tags,
    likes: target.likes,
    note: target.query,
  });
}

console.log("2. 대방어 맛집 카카오 플레이스 정보 수집 중...");
const shopsById = new Map();

for (const target of SHOP_TARGETS) {
  const docs = await searchKeyword(target.query);
  const top = docs.find(isSeafoodPlace) || docs[0];
  if (!top) continue;
  shopsById.set(top.id, {
    kakaoPlaceId: top.id,
    name: top.place_name,
    kakaoCategory: lastCategorySegment(top.category_name),
    phone: top.phone || null,
    address: top.road_address_name || top.address_name,
    lat: Number(top.y),
    lng: Number(top.x),
    tags: target.tags,
    likes: target.likes,
  });
}

const DEFAULT_AREA_TAG_POOL = [
  ["두툼하게 썰어줌", "기름기 좔좔", "제철 대방어"],
  ["신선도 최고", "웨이팅 있어요", "매운탕 맛집"],
  ["가성비 좋아요", "모임하기 좋아요", "숙성 대방어"],
  ["뱃살 비율 높음", "포장 가능해요", "초대리밥 조합"],
  ["특수부위 있어요", "회식 추천", "양 푸짐해요"],
];

let poolIdx = 0;
for (const rect of AREA_RECTS) {
  for (const kw of ["방어", "대방어"]) {
    const docs = await searchKeyword(kw, { rect, size: "8" });
    for (const doc of docs) {
      if (shopsById.has(doc.id) || !isSeafoodPlace(doc)) continue;
      const tags = DEFAULT_AREA_TAG_POOL[poolIdx % DEFAULT_AREA_TAG_POOL.length];
      const likes = 7 + ((poolIdx * 5) % 23);
      poolIdx++;
      shopsById.set(doc.id, {
        kakaoPlaceId: doc.id,
        name: doc.place_name,
        kakaoCategory: lastCategorySegment(doc.category_name),
        phone: doc.phone || null,
        address: doc.road_address_name || doc.address_name,
        lat: Number(doc.y),
        lng: Number(doc.x),
        tags,
        likes,
      });
    }
  }
}

const shops = [...shopsById.values()];
const esc = (str) =>
  str === null || str === undefined ? "null" : `'${String(str).replace(/'/g, "''")}'`;
const uuidOf = (prefix, idx) => `${prefix}-0000-4000-8000-${String(idx + 1).padStart(12, "0")}`;

const MAX_USERS = 65;
const userIds = Array.from({ length: MAX_USERS }, (_, i) => uuidOf("00000001", i));

const sqlLines = [
  "-- 자동 수집된 서울 주요 붕어빵 노점(stall) 및 대방어 맛집(shop) 시드 데이터",
  "begin;",
  "",
  "-- 1. 시드용 익명 사용자 생성 (좋아요·태그·생존확인 집계용)",
  "insert into auth.users (id, instance_id, aud, role, is_anonymous, created_at, updated_at)",
  "values",
  userIds
    .map(
      (id) =>
        `  ('${id}', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', true, now(), now())`,
    )
    .join(",\n") + "\non conflict (id) do nothing;",
  "",
  "-- 2. 붕어빵 노점 (kind = 'stall', category = 'bungeoppang')",
];

stalls.forEach((stall, idx) => {
  const placeId = uuidOf("10000000", idx);
  const openDaysLiteral = `array[${stall.openDays.map((d) => `'${d}'::public.weekday`).join(", ")}]`;
  sqlLines.push(
    `-- ${stall.note} (${stall.address})`,
    `insert into public.places (id, kind, category, lat, lng, address, bundle_count, bundle_price, open_days, created_by, created_at)`,
    `values ('${placeId}', 'stall', 'bungeoppang', ${stall.lat}, ${stall.lng}, ${esc(stall.address)}, ${stall.bundleCount}, ${stall.bundlePrice}, ${openDaysLiteral}, '${userIds[0]}', now() - interval '${(idx % 5) + 1} days')`,
    `on conflict (id) do update set lat = excluded.lat, lng = excluded.lng, address = excluded.address, bundle_count = excluded.bundle_count, bundle_price = excluded.bundle_price, open_days = excluded.open_days;`,
  );

  const likeUsers = userIds.slice(0, Math.min(stall.likes, MAX_USERS));
  if (likeUsers.length > 0) {
    sqlLines.push(
      `insert into public.place_likes (place_id, user_id) values`,
      likeUsers.map((u) => `  ('${placeId}', '${u}')`).join(",\n") + "\non conflict do nothing;",
    );
  }

  const tagRows = [];
  stall.tags.forEach((label, tIdx) => {
    const voteCount = Math.max(2, Math.floor(stall.likes / (tIdx + 2)));
    for (let u = 0; u < Math.min(voteCount, MAX_USERS); u++) {
      tagRows.push(`  ('${placeId}', ${esc(label.slice(0, 12))}, '${userIds[u]}')`);
    }
  });
  if (tagRows.length > 0) {
    sqlLines.push(
      `insert into public.place_tags (place_id, label, user_id) values`,
      tagRows.join(",\n") + "\non conflict do nothing;",
    );
  }

  sqlLines.push(
    `insert into public.stall_checks (place_id, user_id, checked_on, is_still_there, checked_at)`,
    `values ('${placeId}', '${userIds[1]}', (now() at time zone 'Asia/Seoul')::date, true, now() - interval '${(idx % 12) + 1} hours')`,
    `on conflict (place_id, user_id, checked_on) do update set is_still_there = true, checked_at = excluded.checked_at;`,
    "",
  );
});

sqlLines.push("-- 3. 방어 맛집 (kind = 'shop', category = 'bangeo')");

shops.forEach((shop, idx) => {
  const placeId = uuidOf("20000000", idx);
  sqlLines.push(
    `-- ${shop.name} (${shop.address}) [kakao_place_id: ${shop.kakaoPlaceId}]`,
    `insert into public.places (id, kind, category, lat, lng, address, kakao_place_id, name, kakao_category, phone, created_by, created_at)`,
    `values ('${placeId}', 'shop', 'bangeo', ${shop.lat}, ${shop.lng}, ${esc(shop.address)}, ${esc(shop.kakaoPlaceId)}, ${esc(shop.name)}, ${esc(shop.kakaoCategory)}, ${esc(shop.phone)}, '${userIds[0]}', now() - interval '${(idx % 7) + 1} days')`,
    `on conflict (category, kakao_place_id) do update set lat = excluded.lat, lng = excluded.lng, address = excluded.address, name = excluded.name, kakao_category = excluded.kakao_category, phone = excluded.phone;`,
  );

  const likeUsers = userIds.slice(0, Math.min(shop.likes, MAX_USERS));
  if (likeUsers.length > 0) {
    sqlLines.push(
      `insert into public.place_likes (place_id, user_id)`,
      `select p.id, u.uid::uuid from public.places p cross join (values ${likeUsers.map((u) => `('${u}')`).join(", ")}) as u(uid)`,
      `where p.category = 'bangeo' and p.kakao_place_id = ${esc(shop.kakaoPlaceId)}`,
      `on conflict do nothing;`,
    );
  }

  shop.tags.forEach((label, tIdx) => {
    const voteCount = Math.max(2, Math.floor(shop.likes / (tIdx + 2)));
    const voters = userIds.slice(0, Math.min(voteCount, MAX_USERS));
    sqlLines.push(
      `insert into public.place_tags (place_id, label, user_id)`,
      `select p.id, ${esc(label.slice(0, 12))}, u.uid::uuid from public.places p cross join (values ${voters.map((u) => `('${u}')`).join(", ")}) as u(uid)`,
      `where p.category = 'bangeo' and p.kakao_place_id = ${esc(shop.kakaoPlaceId)}`,
      `on conflict do nothing;`,
    );
  });
  sqlLines.push("");
});

sqlLines.push("commit;", "");

const seedSqlPath = path.join(rootDir, "supabase", "seed.sql");
fs.writeFileSync(seedSqlPath, sqlLines.join("\n"), "utf8");
console.log(
  `완료: 붕어빵 노점 ${stalls.length}곳, 방어 맛집 ${shops.length}곳 -> ${seedSqlPath}`,
);

