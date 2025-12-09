import axios from 'axios';
import { NewsItem } from '@/types';

/**
 * NewsAPI를 통한 뉴스 검색
 */
export async function getRecentNews(keyword: string): Promise<NewsItem[]> {
  // NewsAPI 키가 없으면 빈 배열 반환
  if (!process.env.NEWS_API_KEY) {
    console.log('[NEWS] No API key configured, skipping news fetch');
    return [];
  }

  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(keyword)}&language=ko&sortBy=publishedAt&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`;

  try {
    console.log('[NEWS] Fetching news for:', keyword);

    const response = await axios.get(url);

    console.log('[NEWS] News data received');

    return response.data.articles.slice(0, 10).map((article: {
      title: string;
      description: string;
      url: string;
      publishedAt: string;
    }) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      publishedAt: article.publishedAt,
    }));
  } catch (error) {
    console.error('[NEWS] API Error:', error);
    return [];
  }
}

/**
 * @deprecated NewsAPI만 사용하므로 이 함수는 더 이상 사용하지 않습니다.
 * 대신 getRecentNews()를 직접 사용하세요.
 */
export async function getIntegratedNews(
  keyword: string,
  _naverNews: NewsItem[] // 사용하지 않음
): Promise<NewsItem[]> {
  // NewsAPI만 사용
  return await getRecentNews(keyword);
}

