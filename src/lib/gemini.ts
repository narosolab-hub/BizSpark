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
  // 뉴스 데이터를 최대 5개로 제한하여 프롬프트 크기 축소
  const limitedNews = newsData.slice(0, 5);
  
  // 트렌드 데이터 요약 (전체 데이터 대신 핵심만)
  const trendSummary = {
    hasNaver: !!trendData.naver,
    hasGoogle: !!trendData.google,
    naverDataPoints: trendData.naver?.results?.[0]?.data?.length || 0,
    googleDataPoints: trendData.google?.default?.timelineData?.length || 0,
  };

  return `당신은 10년 경력의 시장 분석 전문가이자 스타트업 전략 컨설턴트입니다.

[입력 데이터]
키워드: ${keyword}
트렌드 데이터 요약: ${JSON.stringify(trendSummary)}
뉴스 데이터 (최신 5개): ${JSON.stringify(limitedNews, null, 2)}

[미션]
위 데이터를 기반으로 아래 항목을 JSON 형식으로 작성하세요.

[중요 지시사항]
1. 모든 내용은 구체적이고 실행 가능해야 합니다
2. 로드맵은 Day 단위로 구체적인 액션 아이템을 제시하세요
3. 숫자와 데이터를 최대한 포함하세요 (시장 규모, 예상 고객 수 등)
4. 한국 시장에 맞는 현실적인 분석을 제공하세요
5. 경쟁사는 반드시 실제 존재하는 회사/서비스/앱 이름을 사용하세요 (예: 당근마켓, 배달의민족, 토스 등). OO, XX, △△ 같은 가명을 절대 사용하지 마세요.
6. 반드시 유효한 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.

[핵심 요구사항]
- 핵심 인사이트: 시장/타겟/아이템의 핵심을 3개의 간결한 문장으로 요약
- 타겟 고객: 핵심 그룹을 20자 이내로 명확히 정의 (예: "2030 여성 1인 가구")
- 경쟁사: 비교표 형식으로 서비스 범위, 가격대, 핵심 USP, 강점/약점 포함
- 사업 아이디어: 3가지 아이템에 SaaS/디지털, HaaS/제품, 서비스/콘텐츠 유형을 각각 1개 이상 포함 필수
- 비즈니스 모델: SaaS 구독 모델 외의 다른 유형을 포함하여 최소 2가지 이상 제안, 각 모델의 선택 근거 명시
- 리스크: 대응 방안을 구체적인 실행 계획으로 작성 (지표, 기간 포함)
- AI 프롬프트: 시장 진입, 제품 구체화, 리스크 완화 카테고리별로 각 1~2가지씩 제공

{
  "keyInsights": [
    "시장 인사이트 1줄 요약",
    "타겟 고객 인사이트 1줄 요약",
    "사업 아이템 인사이트 1줄 요약"
  ],
  "marketOverview": {
    "definition": "키워드에 대한 명확한 정의와 시장 설명",
    "marketSize": "국내/글로벌 시장 규모 추정 (숫자와 근거 포함)",
    "trend": "현재 시장 트렌드와 성장 방향"
  },
  "targetCustomers": {
    "coreGroup": "핵심 그룹 (20자 이내, 예: 2030 여성 1인 가구)",
    "segments": ["타겟 고객 세그먼트 1", "타겟 고객 세그먼트 2", "타겟 고객 세그먼트 3"],
    "painPoints": ["고객 페인포인트 1", "고객 페인포인트 2", "고객 페인포인트 3", "고객 페인포인트 4", "고객 페인포인트 5"]
  },
  "competitors": [
    {
      "name": "경쟁사/서비스명 1",
      "serviceScope": "서비스 범위 (예: 전국 배송, 온라인 전용 등)",
      "priceRange": "가격대 (예: 월 9,900원, 거래당 3% 수수료 등)",
      "coreUSP": "핵심 USP (예: 30분 배송, 무료 배송 등)",
      "strength": "해당 경쟁사의 강점",
      "weakness": "해당 경쟁사의 약점"
    },
    {
      "name": "경쟁사/서비스명 2",
      "serviceScope": "서비스 범위",
      "priceRange": "가격대",
      "coreUSP": "핵심 USP",
      "strength": "해당 경쟁사의 강점",
      "weakness": "해당 경쟁사의 약점"
    },
    {
      "name": "경쟁사/서비스명 3",
      "serviceScope": "서비스 범위",
      "priceRange": "가격대",
      "coreUSP": "핵심 USP",
      "strength": "해당 경쟁사의 강점",
      "weakness": "해당 경쟁사의 약점"
    }
  ],
  "businessIdeas": [
    {
      "title": "사업 아이디어 제목 1",
      "type": "SaaS/디지털",
      "description": "아이디어에 대한 상세 설명",
      "usp": "핵심 차별화 포인트 (Unique Selling Point)",
      "targetCustomer": "이 아이디어의 주요 타겟 고객",
      "physicalTouchpoint": "물리적 접점 또는 오프라인 연계성 (해당 없는 경우 생략 가능)"
    },
    {
      "title": "사업 아이디어 제목 2",
      "type": "HaaS/제품",
      "description": "아이디어에 대한 상세 설명",
      "usp": "핵심 차별화 포인트",
      "targetCustomer": "이 아이디어의 주요 타겟 고객",
      "physicalTouchpoint": "물리적 접점 또는 오프라인 연계성"
    },
    {
      "title": "사업 아이디어 제목 3",
      "type": "서비스/콘텐츠",
      "description": "아이디어에 대한 상세 설명",
      "usp": "핵심 차별화 포인트",
      "targetCustomer": "이 아이디어의 주요 타겟 고객",
      "physicalTouchpoint": "물리적 접점 또는 오프라인 연계성"
    }
  ],
  "mvpFeatures": [
    "MVP 필수 기능 1 (우선순위 높음)",
    "MVP 필수 기능 2",
    "MVP 필수 기능 3",
    "MVP 필수 기능 4",
    "MVP 필수 기능 5"
  ],
  "businessModel": {
    "options": [
      {
        "type": "비즈니스 모델 유형 1 (예: SaaS 구독, 거래 수수료, 제품 판매, 전문 컨설팅 등)",
        "pricing": "구체적인 가격 정책 제안",
        "rationale": "이 모델이 시장 분석 결과에 왜 가장 적합한지 설명"
      },
      {
        "type": "비즈니스 모델 유형 2 (SaaS 구독 모델이 아닌 다른 유형 필수)",
        "pricing": "구체적인 가격 정책 제안",
        "rationale": "이 모델이 시장 분석 결과에 왜 적합한지 설명"
      }
    ]
  },
  "roadmap": {
    "week1": [
      "Day 1-2: 구체적인 할 일 (예: 시장조사, 경쟁사 분석 등)",
      "Day 3-4: 구체적인 할 일 (예: 고객 인터뷰, 설문조사 등)",
      "Day 5-7: 구체적인 할 일 (예: MVP 기획, 와이어프레임 등)"
    ],
    "week2": [
      "Day 8-10: 구체적인 할 일 (예: 핵심 기능 개발, 디자인 등)",
      "Day 11-12: 구체적인 할 일 (예: 백엔드 구축, DB 설계 등)",
      "Day 13-14: 구체적인 할 일 (예: 프론트엔드 개발, UI 구현 등)"
    ],
    "week3": [
      "Day 15-17: 구체적인 할 일 (예: 테스트, 버그 수정 등)",
      "Day 18-19: 구체적인 할 일 (예: 베타 테스트, 피드백 수집 등)",
      "Day 20-21: 구체적인 할 일 (예: 랜딩페이지, 마케팅 준비 등)"
    ],
    "week4": [
      "Day 22-24: 구체적인 할 일 (예: 런칭 준비, 최종 점검 등)",
      "Day 25-27: 구체적인 할 일 (예: 소프트 런칭, 초기 사용자 확보 등)",
      "Day 28-30: 구체적인 할 일 (예: 피드백 분석, 개선 계획 수립 등)"
    ]
  },
  "risks": [
    {
      "risk": "예상 리스크 1",
      "solution": "대응 방안 1",
      "actionPlan": "구체적인 실행 계획 (지표, 기간 포함, 예: AES-256 암호화 적용 및 월 1회 보안 감사 계획 수립)"
    },
    {
      "risk": "예상 리스크 2",
      "solution": "대응 방안 2",
      "actionPlan": "구체적인 실행 계획 (지표, 기간 포함)"
    },
    {
      "risk": "예상 리스크 3",
      "solution": "대응 방안 3",
      "actionPlan": "구체적인 실행 계획 (지표, 기간 포함)"
    }
  ],
  "aiCopilotPrompts": [
    {
      "category": "시장 진입",
      "title": "프롬프트 제목 1",
      "prompt": "구체적인 AI 코파일럿 프롬프트 템플릿 (사용자가 복사해서 사용할 수 있는 형태)"
    },
    {
      "category": "시장 진입",
      "title": "프롬프트 제목 2",
      "prompt": "구체적인 AI 코파일럿 프롬프트 템플릿"
    },
    {
      "category": "제품 구체화",
      "title": "프롬프트 제목 3",
      "prompt": "구체적인 AI 코파일럿 프롬프트 템플릿"
    },
    {
      "category": "제품 구체화",
      "title": "프롬프트 제목 4",
      "prompt": "구체적인 AI 코파일럿 프롬프트 템플릿"
    },
    {
      "category": "리스크 완화",
      "title": "프롬프트 제목 5",
      "prompt": "구체적인 AI 코파일럿 프롬프트 템플릿"
    },
    {
      "category": "리스크 완화",
      "title": "프롬프트 제목 6",
      "prompt": "구체적인 AI 코파일럿 프롬프트 템플릿"
    }
  ]
}`;
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
      // Gemini API 호출에 타임아웃 설정 (최대 60초)
      result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Gemini API timeout')), 60000)
        ),
      ]) as any;
    } catch (modelError: any) {
      // 404 에러인 경우 다른 최신 모델 시도
      if (modelError?.message?.includes('404') || modelError?.message?.includes('not found')) {
        console.warn(`[GEMINI] Model ${modelName} not found, trying gemini-2.5-pro...`);
        try {
          model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
          modelName = 'gemini-2.5-pro';
          result = await model.generateContent(prompt);
        } catch (secondError: any) {
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
