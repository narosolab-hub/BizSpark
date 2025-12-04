import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: '리포트 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data: report, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !report) {
      return NextResponse.json(
        { error: '리포트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('[REPORT] Fetch error:', error);
    return NextResponse.json(
      { error: '리포트 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: '리포트 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: '리포트 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[REPORT] Delete error:', error);
    return NextResponse.json(
      { error: '리포트 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}

