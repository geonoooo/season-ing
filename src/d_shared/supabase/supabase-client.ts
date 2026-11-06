import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

let client: SupabaseClient<Database> | null = null;
let signingIn: Promise<SupabaseClient<Database>> | null = null;

// 읽기는 로그인 없이 한다. 익명 세션이 이미 있으면 supabase-js가 같이 보내서 내 좋아요·태그도 표시된다
export const supabaseClient = (): SupabaseClient<Database> => {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      "Supabase 환경 변수(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)가 설정되지 않았어요",
    );
  }
  client ??= createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  return client;
};

const signInAnonymously = async (): Promise<SupabaseClient<Database>> => {
  const supabase = supabaseClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
  }
  return supabase;
};

// 둘러보는 사람까지 익명 가입시키면 IP당 익명 가입 제한(시간당 30번)에 걸리므로 쓰기 직전에만 로그인한다.
// 동시에 들어온 요청끼리만 로그인을 나눠 쓰고, 끝나면 비워서 다음 쓰기 때 세션이 아직 있는지 다시 확인한다
export const signedInSupabase = (): Promise<SupabaseClient<Database>> => {
  signingIn ??= signInAnonymously().finally(() => {
    signingIn = null;
  });
  return signingIn;
};
