import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSS 클래스 병합 유틸리티
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * N개월 전 날짜 반환 (YYYYMMDD 형식)
 */
export function getDateMonthsAgo(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString().split('T')[0].replace(/-/g, '');
}

/**
 * 오늘 날짜 반환 (YYYYMMDD 형식)
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0].replace(/-/g, '');
}

/**
 * 날짜 포맷팅 (YYYY년 MM월 DD일)
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 날짜+시간 포맷팅 (YYYY년 MM월 DD일 HH:MM)
 */
export function formatDateTime(dateString: string | null): string {
  if (!dateString) return '날짜 정보 없음';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '날짜 정보 없음';
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 분석 진행 상태 메시지
 */
export const ANALYSIS_STEPS = [
  { step: 1, message: '🔍 트렌드 데이터 수집 중...', duration: 2000 },
  { step: 2, message: '📰 관련 뉴스 분석 중...', duration: 2000 },
  { step: 3, message: '🧠 AI가 시장을 분석하고 있습니다...', duration: 3000 },
  { step: 4, message: '💡 사업 아이디어를 생성하고 있습니다...', duration: 2000 },
  { step: 5, message: '📊 최종 보고서를 작성하고 있습니다...', duration: 1000 },
];

/**
 * API 에러 핸들링
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown) {
  console.error('[API Error]:', error);

  if (error instanceof APIError) {
    return { error: error.message, statusCode: error.statusCode };
  }

  return { error: 'Internal Server Error', statusCode: 500 };
}

/**
 * JSON 파싱 유틸리티 (AI 응답에서 JSON 추출)
 */
export function extractJSON<T>(text: string): T | null {
  try {
    // JSON 블록 추출 시도
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // 중괄호로 둘러싸인 JSON 추출 시도
    const bracketMatch = text.match(/\{[\s\S]*\}/);
    if (bracketMatch) {
      return JSON.parse(bracketMatch[0]);
    }

    return null;
  } catch (error) {
    console.error('[JSON Parse Error]:', error);
    return null;
  }
}

/**
 * 딜레이 유틸리티
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

