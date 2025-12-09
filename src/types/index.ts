// ==========================================
// BizSpark 타입 정의
// ==========================================

// 시장 개요
export interface MarketOverview {
  definition: string;
  marketSize: string;
  trend: string;
}

// 타겟 고객
export interface TargetCustomers {
  coreGroup?: string; // 핵심 그룹 (예: 2030 여성 1인 가구) (하위 호환성)
  segments: string[];
  painPoints: string[];
}

// 경쟁사
export interface Competitor {
  name: string;
  serviceScope?: string; // 서비스 범위 (하위 호환성)
  priceRange?: string; // 가격대 (하위 호환성)
  coreUSP?: string; // 핵심 USP (하위 호환성)
  strength: string;
  weakness: string;
}

// 사업 아이디어
export interface BusinessIdea {
  title: string;
  type: 'SaaS/디지털' | 'HaaS/제품' | '서비스/콘텐츠'; // 아이템 유형
  description: string;
  usp: string;
  targetCustomer: string;
  physicalTouchpoint?: string; // 물리적 접점 또는 오프라인 연계성
}

// 비즈니스 모델
export interface BusinessModelOption {
  type: string; // 모델 유형 (예: SaaS 구독, 거래 수수료, 제품 판매 등)
  pricing: string; // 구체적인 가격 정책
  rationale: string; // 선택 근거 (왜 이 모델이 적합한지)
}

// 비즈니스 모델 (다중 제안)
export interface BusinessModel {
  options: BusinessModelOption[]; // 최소 2가지 이상
}

// 로드맵
export interface Roadmap {
  week1: string[];
  week2: string[];
  week3: string[];
  week4: string[];
}

// 리스크
export interface Risk {
  risk: string;
  solution: string;
  actionPlan?: string; // 구체적인 실행 계획 (지표, 기간 포함) (하위 호환성)
}

// AI 코파일럿 프롬프트
export interface AICopilotPrompt {
  category: '시장 진입' | '제품 구체화' | '리스크 완화';
  title: string;
  prompt: string;
}

// 분석 결과 전체
export interface AnalysisResult {
  keyInsights?: string[]; // 핵심 인사이트 3줄 요약 (하위 호환성)
  marketOverview: MarketOverview;
  targetCustomers: TargetCustomers;
  competitors: Competitor[];
  businessIdeas: BusinessIdea[];
  mvpFeatures: string[];
  businessModel: BusinessModel;
  roadmap: Roadmap;
  risks: Risk[];
  aiCopilotPrompts?: AICopilotPrompt[]; // AI 코파일럿 프롬프트 (하위 호환성)
}

// 트렌드 데이터
export interface TrendData {
  naver?: NaverTrendData;
  google?: GoogleTrendData;
}

export interface NaverTrendData {
  startDate: string;
  endDate: string;
  timeUnit: string;
  results: {
    title: string;
    keywords: string[];
    data: {
      period: string;
      ratio: number;
    }[];
  }[];
}

export interface GoogleTrendData {
  default: {
    timelineData: {
      time: string;
      formattedTime: string;
      value: number[];
    }[];
  };
}

// 뉴스 데이터
export interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
}

// 리포트
export interface Report {
  id: string;
  user_id?: string;
  keyword: string;
  analysis_result: AnalysisResult;
  trend_data?: TrendData;
  news_data?: NewsItem[];
  pdf_url?: string;
  created_at: string;
}

// API 응답 타입
export interface AnalyzeResponse {
  reportId: string;
  status: 'processing' | 'completed' | 'error';
}

export interface ApiError {
  error: string;
  statusCode: number;
}

// 구독 플랜
export type SubscriptionPlan = 'free' | 'pro' | 'business';

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  credits_remaining: number;
  current_period_end?: string;
  created_at: string;
}

// 사용자
export interface User {
  id: string;
  email: string;
  subscription_tier: SubscriptionPlan;
  credits_remaining: number;
  created_at: string;
}

