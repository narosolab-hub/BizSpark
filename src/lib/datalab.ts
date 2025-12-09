import axios from 'axios';
import { NaverTrendData } from '@/types';
import { getDateMonthsAgo, getTodayDate } from './utils';

/**
 * Naver DataLab 트렌드 데이터 조회
 */
export async function getNaverTrends(keyword: string): Promise<NaverTrendData | null> {
  const url = 'https://openapi.naver.com/v1/datalab/search';

  const body = {
    startDate: getDateMonthsAgo(12), // 최근 12개월
    endDate: getTodayDate(),
    timeUnit: 'month',
    keywordGroups: [
      {
        groupName: keyword,
        keywords: [keyword],
      },
    ],
    device: '', // 전체 디바이스
    ages: [], // 전연령
    gender: '', // 전체 성별
  };

  try {
    console.log('[NAVER] Fetching trends for:', keyword);

    if (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET) {
      console.warn('[NAVER] API keys not configured, skipping trends fetch');
      return null;
    }

    const response = await axios.post(url, body, {
      headers: {
        'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
        'Content-Type': 'application/json',
      },
    });

    console.log('[NAVER] Trends data received');
    return response.data;
  } catch (error: any) {
    console.error('[NAVER] DataLab API Error:', {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
    });
    return null;
  }
}

/**
 * Naver 뉴스 검색 API
 */
export async function getNaverNews(keyword: string) {
  const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(keyword)}&display=20&sort=date`;

  try {
    console.log('[NAVER] Fetching news for:', keyword);

    if (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET) {
      console.warn('[NAVER] API keys not configured, skipping news fetch');
      return [];
    }

    const response = await axios.get(url, {
      headers: {
        'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
      },
    });

    console.log('[NAVER] News data received, items:', response.data.items?.length || 0);

    if (!response.data.items || !Array.isArray(response.data.items)) {
      console.warn('[NAVER] Invalid news response format');
      return [];
    }

    return response.data.items.map((item: { title: string; description: string; link: string; pubDate: string }) => ({
      title: item.title.replace(/<[^>]*>/g, ''), // HTML 태그 제거
      description: item.description.replace(/<[^>]*>/g, ''),
      url: item.link,
      publishedAt: item.pubDate,
    }));
  } catch (error: any) {
    const status = error?.response?.status;
    const errorData = error?.response?.data;
    
    // 401 에러인 경우 상세 로그
    if (status === 401) {
      console.error('[NAVER] News API 401 Unauthorized:', {
        message: error?.message,
        status,
        statusText: error?.response?.statusText,
        errorCode: errorData?.errorCode,
        errorMessage: errorData?.errorMessage,
      });
      console.warn('[NAVER] ⚠️ Naver News API 인증 실패. 네이버 개발자 센터에서 다음을 확인하세요:');
      console.warn('[NAVER] 1. API 키(Client ID/Secret)가 올바른지 확인');
      console.warn('[NAVER] 2. "검색" API 권한이 활성화되어 있는지 확인');
      console.warn('[NAVER] 3. 애플리케이션 상태가 "운영"인지 확인');
    } else {
      console.error('[NAVER] News API Error:', {
        message: error?.message,
        status,
        statusText: error?.response?.statusText,
        data: errorData,
      });
    }
    return [];
  }
}

