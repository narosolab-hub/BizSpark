import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createClient();
    // 전부 가져오고 프론트엔드에서 정렬
    const { data: reports, error } = await supabase
      .from('reports')
      .select('id, keyword, created_at')
      .limit(100);

    if (error) {
      console.error('[REPORTS] Fetch error:', error);
      return NextResponse.json(
        { error: '리포트 목록을 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    console.log('[REPORTS] Fetched count:', reports?.length || 0);
    return NextResponse.json({ reports: reports || [] });
  } catch (error) {
    console.error('[REPORTS] Error:', error);
    return NextResponse.json(
      { error: '리포트 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

