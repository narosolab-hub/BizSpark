'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface AnalysisProgressProps {
  keyword: string;
}

const ANALYSIS_STEPS = [
  { id: 1, message: '트렌드 데이터 수집 중', icon: '🔍', duration: 2000 },
  { id: 2, message: '관련 뉴스 분석 중', icon: '📰', duration: 2000 },
  { id: 3, message: 'AI가 시장을 분석하고 있습니다', icon: '🧠', duration: 4000 },
  { id: 4, message: '사업 아이디어 생성 중', icon: '💡', duration: 3000 },
  { id: 5, message: '최종 보고서 작성 중', icon: '📊', duration: 2000 },
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900">
      <div className="max-w-lg w-full px-6">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 text-violet-300 text-sm mb-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            분석 진행 중
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            &ldquo;{keyword}&rdquo;
          </h1>
          <p className="text-gray-400">
            AI가 시장을 분석하고 사업 아이디어를 생성하고 있습니다
          </p>
        </div>

        {/* 진행 단계 */}
        <div className="space-y-4">
          {ANALYSIS_STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === index && !isCompleted;
            const isPending = currentStep < index;

            return (
              <div
                key={step.id}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl transition-all duration-500',
                  isCompleted && 'bg-violet-500/10 border border-violet-500/30',
                  isCurrent && 'bg-white/5 border border-white/10 scale-[1.02]',
                  isPending && 'opacity-40'
                )}
              >
                {/* 아이콘 */}
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                    isCompleted && 'bg-violet-500/20',
                    isCurrent && 'bg-white/10 animate-pulse',
                    isPending && 'bg-white/5'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-violet-400" />
                  ) : isCurrent ? (
                    <span className="animate-bounce">{step.icon}</span>
                  ) : (
                    <span className="grayscale">{step.icon}</span>
                  )}
                </div>

                {/* 텍스트 */}
                <div className="flex-1">
                  <p
                    className={cn(
                      'font-medium transition-colors duration-300',
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

                {/* 상태 표시 */}
                {isCurrent && (
                  <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                )}
              </div>
            );
          })}
        </div>

        {/* 하단 안내 */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            분석에는 약 30초~1분 정도 소요됩니다
          </p>
        </div>
      </div>
    </div>
  );
}

