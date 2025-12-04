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
  segments: string[];
  painPoints: string[];
}

// 경쟁사
export interface Competitor {
  name: string;
  strength: string;
  weakness: string;
}

// 사업 아이디어
export interface BusinessIdea {
  title: string;
  description: string;
  usp: string;
  targetCustomer: string;
}

// 비즈니스 모델
export interface BusinessModel {
  type: string;
  pricing: string;
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
}

// 분석 결과 전체
export interface AnalysisResult {
  marketOverview: MarketOverview;
  targetCustomers: TargetCustomers;
  competitors: Competitor[];
  businessIdeas: BusinessIdea[];
  mvpFeatures: string[];
  businessModel: BusinessModel;
  roadmap: Roadmap;
  risks: Risk[];
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

