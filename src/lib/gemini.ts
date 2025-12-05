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
  return `당신은 10년 경력의 시장 분석 전문가이자 스타트업 전략 컨설턴트입니다.

[입력 데이터]
키워드: ${keyword}
트렌드 데이터: ${JSON.stringify(trendData, null, 2)}
뉴스 데이터: ${JSON.stringify(newsData, null, 2)}

[미션]
위 데이터를 기반으로 아래 항목을 JSON 형식으로 작성하세요.

[중요 지시사항]
1. 모든 내용은 구체적이고 실행 가능해야 합니다
2. 로드맵은 Day 단위로 구체적인 액션 아이템을 제시하세요
3. 숫자와 데이터를 최대한 포함하세요 (시장 규모, 예상 고객 수 등)
4. 한국 시장에 맞는 현실적인 분석을 제공하세요
5. 경쟁사는 반드시 실제 존재하는 회사/서비스/앱 이름을 사용하세요 (예: 당근마켓, 배달의민족, 토스 등). OO, XX, △△ 같은 가명을 절대 사용하지 마세요.
6. 반드시 유효한 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요.

{
  "marketOverview": {
    "definition": "키워드에 대한 명확한 정의와 시장 설명",
    "marketSize": "국내/글로벌 시장 규모 추정 (숫자와 근거 포함)",
    "trend": "현재 시장 트렌드와 성장 방향"
  },
  "targetCustomers": {
    "segments": ["타겟 고객 세그먼트 1", "타겟 고객 세그먼트 2", "타겟 고객 세그먼트 3"],
    "painPoints": ["고객 페인포인트 1", "고객 페인포인트 2", "고객 페인포인트 3", "고객 페인포인트 4", "고객 페인포인트 5"]
  },
  "competitors": [
    {
      "name": "경쟁사/서비스명 1",
      "strength": "해당 경쟁사의 강점",
      "weakness": "해당 경쟁사의 약점"
    },
    {
      "name": "경쟁사/서비스명 2",
      "strength": "해당 경쟁사의 강점",
      "weakness": "해당 경쟁사의 약점"
    },
    {
      "name": "경쟁사/서비스명 3",
      "strength": "해당 경쟁사의 강점",
      "weakness": "해당 경쟁사의 약점"
    }
  ],
  "businessIdeas": [
    {
      "title": "사업 아이디어 제목 1",
      "description": "아이디어에 대한 상세 설명",
      "usp": "핵심 차별화 포인트 (Unique Selling Point)",
      "targetCustomer": "이 아이디어의 주요 타겟 고객"
    },
    {
      "title": "사업 아이디어 제목 2",
      "description": "아이디어에 대한 상세 설명",
      "usp": "핵심 차별화 포인트",
      "targetCustomer": "이 아이디어의 주요 타겟 고객"
    },
    {
      "title": "사업 아이디어 제목 3",
      "description": "아이디어에 대한 상세 설명",
      "usp": "핵심 차별화 포인트",
      "targetCustomer": "이 아이디어의 주요 타겟 고객"
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
    "type": "추천 비즈니스 모델 유형 (예: SaaS, 마켓플레이스, 구독 등)",
    "pricing": "구체적인 가격 정책 제안"
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
      "solution": "대응 방안 1"
    },
    {
      "risk": "예상 리스크 2",
      "solution": "대응 방안 2"
    },
    {
      "risk": "예상 리스크 3",
      "solution": "대응 방안 3"
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
    // 안정적인 모델 사용
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = createAnalysisPrompt(keyword, trendData, newsData);

    console.log('[GEMINI] Starting analysis for:', keyword);
    console.log('[GEMINI] Using model: gemini-2.0-flash');

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log('[GEMINI] Response received, parsing JSON...');

    const analysis = extractJSON<AnalysisResult>(text);

    if (!analysis) {
      console.error('[GEMINI] Failed to parse JSON response');
      console.log('[GEMINI] Raw response:', text.substring(0, 500));
      return null;
    }

    console.log('[GEMINI] Analysis completed successfully');
    return analysis;
  } catch (error) {
    console.error('[GEMINI] API Error:', error);
    throw error;
  }
}
