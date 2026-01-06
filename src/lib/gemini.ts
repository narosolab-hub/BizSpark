import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisResult, TrendData, NewsItem } from '@/types';
import { extractJSON } from './utils';

// API 키 확인
const apiKey = process.env.GEMINI_API_KEY;
console.log('[GEMINI] API Key exists:', !!apiKey, apiKey ? `(${apiKey.substring(0, 10)}...)` : '');

if (!apiKey) {
  console.error('[GEMINI] ⚠️ GEMINI_API_KEY is not set!');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * 사업 아이디어 분석 프롬프트 생성
 */
function createAnalysisPrompt(
  keyword: string,
  trendData: TrendData,
  newsData: NewsItem[]
): string {
  // 뉴스 데이터를 최대 2개로 제한하고 제목만 사용 (더 축소)
  const limitedNews = newsData.slice(0, 2).map(news => news.title).join(' | ');

  return `키워드 "${keyword}"에 대한 비즈니스 분석을 JSON으로 제공하세요.

요구사항:
- 경쟁사는 실제 회사명 사용
- 사업 아이디어 3개: SaaS/디지털, HaaS/제품, 서비스/콘텐츠 각 1개 이상
- 비즈니스 모델 2개 이상 (SaaS 구독 외 다른 유형 포함)
- 로드맵은 Day 단위
- 리스크는 실행 계획 포함 (지표, 기간)
- AI 프롬프트: 시장진입/제품구체화/리스크완화 각 1~2개

JSON 형식 (다른 텍스트 없이):
{"keyInsights":["인사이트1","인사이트2","인사이트3"],"marketOverview":{"definition":"시장 정의","marketSize":"시장 규모(숫자)","trend":"시장 트렌드"},"targetCustomers":{"coreGroup":"핵심 그룹(20자 이내)","segments":["세그먼트1","세그먼트2","세그먼트3"],"painPoints":["페인포인트1","페인포인트2","페인포인트3","페인포인트4","페인포인트5"]},"competitors":[{"name":"경쟁사1","serviceScope":"서비스 범위","priceRange":"가격대","coreUSP":"USP","strength":"강점","weakness":"약점"},{"name":"경쟁사2","serviceScope":"서비스 범위","priceRange":"가격대","coreUSP":"USP","strength":"강점","weakness":"약점"},{"name":"경쟁사3","serviceScope":"서비스 범위","priceRange":"가격대","coreUSP":"USP","strength":"강점","weakness":"약점"}],"businessIdeas":[{"title":"아이디어1","type":"SaaS/디지털","description":"설명","usp":"차별화 포인트","targetCustomer":"타겟","physicalTouchpoint":"물리적 접점"},{"title":"아이디어2","type":"HaaS/제품","description":"설명","usp":"차별화 포인트","targetCustomer":"타겟","physicalTouchpoint":"물리적 접점"},{"title":"아이디어3","type":"서비스/콘텐츠","description":"설명","usp":"차별화 포인트","targetCustomer":"타겟","physicalTouchpoint":"물리적 접점"}],"mvpFeatures":["기능1","기능2","기능3","기능4","기능5"],"businessModel":{"options":[{"type":"모델1","pricing":"가격 정책","rationale":"선택 근거"},{"type":"모델2","pricing":"가격 정책","rationale":"선택 근거"}]},"roadmap":{"week1":["Day 1-2: 할 일","Day 3-4: 할 일","Day 5-7: 할 일"],"week2":["Day 8-10: 할 일","Day 11-12: 할 일","Day 13-14: 할 일"],"week3":["Day 15-17: 할 일","Day 18-19: 할 일","Day 20-21: 할 일"],"week4":["Day 22-24: 할 일","Day 25-27: 할 일","Day 28-30: 할 일"]},"risks":[{"risk":"리스크1","solution":"대응 방안","actionPlan":"실행 계획(지표,기간)"},{"risk":"리스크2","solution":"대응 방안","actionPlan":"실행 계획(지표,기간)"},{"risk":"리스크3","solution":"대응 방안","actionPlan":"실행 계획(지표,기간)"}],"aiCopilotPrompts":[{"category":"시장 진입","title":"프롬프트1","prompt":"프롬프트 템플릿"},{"category":"시장 진입","title":"프롬프트2","prompt":"프롬프트 템플릿"},{"category":"제품 구체화","title":"프롬프트3","prompt":"프롬프트 템플릿"},{"category":"제품 구체화","title":"프롬프트4","prompt":"프롬프트 템플릿"},{"category":"리스크 완화","title":"프롬프트5","prompt":"프롬프트 템플릿"},{"category":"리스크 완화","title":"프롬프트6","prompt":"프롬프트 템플릿"}]}`;
}

/**
 * Gemini API를 사용한 사업 아이디어 분석
 */
export async function analyzeBusinessIdea(
  keyword: string,
  trendData: TrendData,
  newsData: NewsItem[]
): Promise<AnalysisResult | null> {
  if (!genAI) {
    console.error('[GEMINI] API client not initialized - missing API key');
    throw new Error('Gemini API 키가 설정되지 않았습니다.');
  }

  try {
    // 최신 모델 사용 (gemini-2.5 시리즈)
    // 여러 모델을 시도할 수 있도록 fallback 로직 포함
    let model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    let modelName = 'gemini-2.5-flash';

    const prompt = createAnalysisPrompt(keyword, trendData, newsData);

    console.log('[GEMINI] Starting analysis for:', keyword);
    console.log('[GEMINI] Using model: gemini-2.5-flash (latest model)');
    const geminiStartTime = Date.now();

    let result;
    try {
      // Gemini API 호출에 타임아웃 설정 (최대 120초)
      result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Gemini API timeout')), 120000)
        ),
      ]) as any;
    } catch (modelError: any) {
      // 실제 에러 내용을 상세히 로깅
      console.error('[GEMINI] Model error details:', {
        message: modelError?.message,
        status: modelError?.status,
        statusText: modelError?.statusText,
        response: modelError?.response?.data,
        code: modelError?.code,
      });
      
      // API 키 만료 또는 유효하지 않은 경우만 명확한 에러 메시지
      // 400 에러는 너무 광범위하므로 제외하고, 실제 API 키 관련 에러만 체크
      if (modelError?.message?.includes('API key expired') || 
          modelError?.message?.includes('API_KEY_INVALID') ||
          modelError?.message?.includes('API key not valid') ||
          modelError?.response?.status === 401 ||
          modelError?.response?.status === 403) {
        console.error('[GEMINI] API key expired or invalid:', modelError?.message);
        throw new Error('Gemini API 키가 만료되었거나 유효하지 않습니다. Vercel 환경 변수에서 API 키를 확인해주세요.');
      }
      
      // 404 에러인 경우 다른 최신 모델 시도
      if (modelError?.message?.includes('404') || modelError?.message?.includes('not found')) {
        console.warn(`[GEMINI] Model ${modelName} not found, trying gemini-2.5-pro...`);
        try {
          model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
          modelName = 'gemini-2.5-pro';
          result = await model.generateContent(prompt);
        } catch (secondError: any) {
          // 실제 에러 내용을 상세히 로깅
          console.error('[GEMINI] Second model error details:', {
            message: secondError?.message,
            status: secondError?.status,
            response: secondError?.response?.data,
          });
          
          // API 키 문제인 경우만 즉시 throw (400은 제외 - 너무 광범위)
          if (secondError?.message?.includes('API key expired') || 
              secondError?.message?.includes('API_KEY_INVALID') ||
              secondError?.message?.includes('API key not valid') ||
              secondError?.response?.status === 401 ||
              secondError?.response?.status === 403) {
            throw new Error('Gemini API 키가 만료되었거나 유효하지 않습니다. Vercel 환경 변수에서 API 키를 확인해주세요.');
          }
          
          // gemini-2.5-pro도 실패하면 gemini-1.5-flash로 fallback
          if (secondError?.message?.includes('404') || secondError?.message?.includes('not found')) {
            console.warn(`[GEMINI] Model ${modelName} not found, trying gemini-1.5-flash...`);
            model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            modelName = 'gemini-1.5-flash';
            result = await model.generateContent(prompt);
          } else {
            throw secondError;
          }
        }
      } else {
        throw modelError;
      }
    }

    const text = result.response.text();
    const geminiTime = Date.now() - geminiStartTime;

    console.log('[GEMINI] Response received, parsing JSON...');
    console.log('[GEMINI] Gemini API time:', `${geminiTime}ms`);

    const analysis = extractJSON<AnalysisResult>(text);

    if (!analysis) {
      console.error('[GEMINI] Failed to parse JSON response');
      console.log('[GEMINI] Raw response:', text.substring(0, 500));
      return null;
    }

    console.log('[GEMINI] Analysis completed successfully');
    return analysis;
  } catch (error: any) {
    console.error('[GEMINI] API Error:', {
      message: error?.message,
      status: error?.status || error?.response?.status,
      statusText: error?.statusText || error?.response?.statusText,
      details: error?.response?.data || error?.details,
      stack: error?.stack,
    });
    
    // 404 에러인 경우 더 명확한 메시지 제공
    if (error?.message?.includes('404') || error?.message?.includes('not found')) {
      throw new Error('Gemini 모델을 찾을 수 없습니다. API 키 권한을 확인하거나 다른 모델을 사용해주세요.');
    }
    
    throw error;
  }
}
