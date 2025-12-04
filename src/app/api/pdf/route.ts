import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { Report } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { reportId } = await request.json();

    if (!reportId) {
      return NextResponse.json(
        { error: '리포트 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data: report, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (error || !report) {
      return NextResponse.json(
        { error: '리포트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // PDF 생성 데이터 반환 (클라이언트에서 jsPDF로 생성)
    return NextResponse.json({
      success: true,
      report: report as Report,
    });
  } catch (error) {
    console.error('[PDF] Generation error:', error);
    return NextResponse.json(
      { error: 'PDF 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

