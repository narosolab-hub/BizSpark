import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { analyzeBusinessIdea } from '@/lib/gemini';
import { getNaverTrends, getNaverNews } from '@/lib/datalab';
import { getGoogleTrends } from '@/lib/trends';
import { getIntegratedNews } from '@/lib/news';
import { APIError, handleAPIError } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // 환경 변수 체크
    const requiredEnvVars = {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };

    const missingEnvVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingEnvVars.length > 0) {
      console.error('[ANALYZE] Missing environment variables:', missingEnvVars);
      return NextResponse.json(
        { error: '서버 설정 오류가 발생했습니다. 관리자에게 문의해주세요.' },
        { status: 500 }
      );
    }

    const { keyword } = await request.json();

    // 입력 검증
    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json(
        { error: '키워드를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (keyword.length < 2 || keyword.length > 50) {
      return NextResponse.json(
        { error: '키워드는 2자 이상 50자 이하로 입력해주세요.' },
        { status: 400 }
      );
    }

    console.log('[ANALYZE] Starting analysis for:', keyword);

    // 1. 데이터 수집 (병렬 처리, 개별 에러 핸들링)
    let naverTrends = null;
    let googleTrends = null;
    let naverNews: any[] = [];

    try {
      const results = await Promise.allSettled([
        getNaverTrends(keyword).catch((err) => {
          console.error('[ANALYZE] Naver trends failed:', err);
          return null;
        }),
        getGoogleTrends(keyword).catch((err) => {
          console.error('[ANALYZE] Google trends failed:', err);
          return null;
        }),
        getNaverNews(keyword).catch((err) => {
          console.error('[ANALYZE] Naver news failed:', err);
          return [];
        }),
      ]);

      naverTrends = results[0].status === 'fulfilled' ? results[0].value : null;
      googleTrends = results[1].status === 'fulfilled' ? results[1].value : null;
      naverNews = results[2].status === 'fulfilled' ? results[2].value : [];
    } catch (error) {
      console.error('[ANALYZE] Data collection error:', error);
      // 데이터 수집 실패해도 계속 진행
    }

    console.log('[ANALYZE] Data collection completed:', {
      hasNaverTrends: !!naverTrends,
      hasGoogleTrends: !!googleTrends,
      naverNewsCount: naverNews.length,
    });

    // 2. 뉴스 통합
    let newsData: any[] = [];
    try {
      newsData = await getIntegratedNews(keyword, naverNews);
      console.log('[ANALYZE] News integration completed, count:', newsData.length);
    } catch (error) {
      console.error('[ANALYZE] News integration failed:', error);
      newsData = naverNews; // Naver 뉴스라도 사용
    }

    // 3. AI 분석
    console.log('[ANALYZE] Starting AI analysis...');
    let analysis;
    try {
      analysis = await analyzeBusinessIdea(
        keyword,
        {
          naver: naverTrends || undefined,
          google: googleTrends || undefined,
        },
        newsData
      );

      if (!analysis) {
        throw new APIError(500, 'AI 분석에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
      console.log('[ANALYZE] AI analysis completed successfully');
    } catch (error) {
      console.error('[ANALYZE] AI analysis failed:', error);
      throw error;
    }

    // 4. DB 저장
    const supabase = createClient();
    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        keyword,
        analysis_result: analysis,
        trend_data: {
          naver: naverTrends,
          google: googleTrends,
        },
        news_data: newsData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[SUPABASE] Insert error:', error);
      // DB 저장 실패해도 분석 결과는 반환
      return NextResponse.json({
        reportId: null,
        analysis,
        status: 'completed',
        message: '분석은 완료되었으나 저장에 실패했습니다.',
      });
    }

    console.log('[ANALYZE] Analysis completed, reportId:', report.id);

    return NextResponse.json({
      reportId: report.id,
      status: 'completed',
    });
  } catch (error) {
    console.error('[ANALYZE] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error,
    });
    
    const { error: errorMessage, statusCode } = handleAPIError(error);
    return NextResponse.json(
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && error instanceof Error ? {
          details: error.message,
          stack: error.stack,
        } : {}),
      }, 
      { status: statusCode }
    );
  }
}

