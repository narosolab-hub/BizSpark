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
 * 통합 뉴스 검색 (Naver + NewsAPI)
 */
export async function getIntegratedNews(
  keyword: string,
  naverNews: NewsItem[]
): Promise<NewsItem[]> {
  const newsApiNews = await getRecentNews(keyword);

  // 중복 제거 및 병합
  const allNews = [...naverNews, ...newsApiNews];
  const uniqueNews = allNews.reduce((acc: NewsItem[], current) => {
    const exists = acc.find((item) => item.title === current.title);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);

  // 최신순 정렬 후 상위 15개 반환
  return uniqueNews
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 15);
}

