'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface AnalysisProgressProps {
  keyword: string;
}

const ANALYSIS_STEPS = [
  { id: 1, message: '글로벌 트렌드 및 최신 검색 데이터 분석 중', icon: '🔍', duration: 3000 },
  { id: 2, message: '관련 뉴스 및 시장 동향 심층 분석 중', icon: '📰', duration: 3000 },
  { id: 3, message: '경쟁사별 강점 및 약점, 성공 요인 분석 중', icon: '🎯', duration: 8000 },
  { id: 4, message: 'AI가 핵심 사업 아이디어 구상 중', icon: '💡', duration: 15000 },
  { id: 5, message: '시장 침투 전략 및 30일 실행 로드맵 작성 중', icon: '📊', duration: 10000 },
  { id: 6, message: '추가 프롬프트 및 실행 가이드 생성 중', icon: '🚀', duration: 8000 },
  { id: 7, message: '거의 다 됐습니다! 최종 검토 중...', icon: '✨', duration: 5000 },
];

export default function AnalysisProgress({ keyword }: AnalysisProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    let totalDelay = 0;

    ANALYSIS_STEPS.forEach((step, index) => {
      // 스텝 시작
      setTimeout(() => {
        setCurrentStep(index);
      }, totalDelay);

      // 스텝 완료
      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, step.id]);
      }, totalDelay + step.duration - 200);

      totalDelay += step.duration;
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 p-4">
      <div className="max-w-lg w-full">
        {/* 헤더 - 모바일 최적화 */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-violet-500/20 text-violet-300 text-xs sm:text-sm mb-4 sm:mb-6">
            <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
            분석 진행 중
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3 break-words px-2">
            &quot;{keyword}&quot;
          </h1>
          <p className="text-sm sm:text-base text-gray-400 px-4">
            AI가 시장을 분석하고 사업 아이디어를 생성하고 있습니다
          </p>
        </div>

        {/* 진행 단계 - 모바일 최적화 */}
        <div className="space-y-3 sm:space-y-4">
          {ANALYSIS_STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === index && !isCompleted;
            const isPending = currentStep < index;

            return (
              <div
                key={step.id}
                className={cn(
                  'flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all duration-500',
                  isCompleted && 'bg-violet-500/10 border border-violet-500/30',
                  isCurrent && 'bg-white/5 border border-white/10 scale-[1.02]',
                  isPending && 'opacity-40'
                )}
              >
                {/* 아이콘 - 모바일 크기 조정 */}
                <div
                  className={cn(
                    'w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0',
                    isCompleted && 'bg-violet-500/20',
                    isCurrent && 'bg-white/10 animate-pulse',
                    isPending && 'bg-white/5'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
                  ) : isCurrent ? (
                    <span className="animate-bounce">{step.icon}</span>
                  ) : (
                    <span className="grayscale">{step.icon}</span>
                  )}
                </div>

                {/* 텍스트 - 모바일 최적화 */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'font-medium transition-colors duration-300 text-sm sm:text-base',
                      isCompleted && 'text-violet-300',
                      isCurrent && 'text-white',
                      isPending && 'text-gray-500'
                    )}
                  >
                    {step.message}
                    {isCurrent && (
                      <span className="ml-1 inline-flex">
                        <span className="animate-pulse">.</span>
                        <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
                        <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
                      </span>
                    )}
                  </p>
                </div>

                {/* 상태 표시 - 모바일 크기 조정 */}
                {isCurrent && (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400 animate-spin flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* 하단 안내 - 모바일 최적화 */}
        <div className="mt-8 sm:mt-12 text-center px-4">
          <p className="text-xs sm:text-sm text-gray-500">
            고품질 분석을 위해 약 1분 정도 소요됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
