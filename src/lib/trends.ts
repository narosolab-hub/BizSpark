import { GoogleTrendData } from '@/types';

// google-trends-api는 CommonJS 모듈이므로 require 사용
// eslint-disable-next-line @typescript-eslint/no-require-imports
const googleTrends = require('google-trends-api');

/**
 * Google Trends 관심도 시계열 데이터 조회
 */
export async function getGoogleTrends(keyword: string): Promise<GoogleTrendData | null> {
  try {
    console.log('[GOOGLE] Fetching trends for:', keyword);

    const result = await googleTrends.interestOverTime({
      keyword: keyword,
      startTime: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1년 전
      geo: 'KR',
    });

    console.log('[GOOGLE] Trends data received');
    return JSON.parse(result);
  } catch (error) {
    console.error('[GOOGLE] Trends Error:', error);
    return null;
  }
}

/**
 * Google Trends 연관 검색어 조회
 */
export async function getRelatedQueries(keyword: string) {
  try {
    console.log('[GOOGLE] Fetching related queries for:', keyword);

    const result = await googleTrends.relatedQueries({
      keyword: keyword,
      geo: 'KR',
    });

    console.log('[GOOGLE] Related queries received');
    return JSON.parse(result);
  } catch (error) {
    console.error('[GOOGLE] Related Queries Error:', error);
    return null;
  }
}

/**
 * Google Trends 급상승 검색어 조회
 */
export async function getDailyTrends() {
  try {
    console.log('[GOOGLE] Fetching daily trends');

    const result = await googleTrends.dailyTrends({
      geo: 'KR',
    });

    console.log('[GOOGLE] Daily trends received');
    return JSON.parse(result);
  } catch (error) {
    console.error('[GOOGLE] Daily Trends Error:', error);
    return null;
  }
}

