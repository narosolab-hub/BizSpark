import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createClient();
    // 최신 리포트부터 가져오기 (created_at 기준 내림차순)
    // 성능 최적화: 최근 50개만 가져오기 (필요시 증가 가능)
    const { data: reports, error } = await supabase
      .from('reports')
      .select('id, keyword, created_at')
      .order('created_at', { ascending: false, nullsFirst: false })
      .limit(50);

    if (error) {
      console.error('[REPORTS] Fetch error:', error);
      return NextResponse.json(
        { error: '리포트 목록을 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    // 최신 리포트와 오래된 리포트의 날짜 확인
    if (reports && reports.length > 0) {
      const latest = reports[0];
      const oldest = reports[reports.length - 1];
      console.log('[REPORTS] Fetched count:', reports.length);
      console.log('[REPORTS] Latest report:', {
        keyword: latest.keyword,
        created_at: latest.created_at,
        date: latest.created_at ? new Date(latest.created_at).toLocaleString('ko-KR') : 'N/A',
      });
      console.log('[REPORTS] Oldest report:', {
        keyword: oldest.keyword,
        created_at: oldest.created_at,
        date: oldest.created_at ? new Date(oldest.created_at).toLocaleString('ko-KR') : 'N/A',
      });
    } else {
      console.log('[REPORTS] No reports found');
    }

    const response = NextResponse.json({ reports: reports || [] });
    
    // 캐시 방지 헤더 추가
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('[REPORTS] Error:', error);
    return NextResponse.json(
      { error: '리포트 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

