import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase 클라이언트 생성
 * 클라이언트 사이드에서 사용
 */
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Supabase 싱글톤 클라이언트
 */
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

