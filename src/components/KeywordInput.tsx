'use client';

import { useState, FormEvent } from 'react';
import { Search, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeywordInputProps {
  onSubmit: (keyword: string) => void;
  loading?: boolean;
}

const EXAMPLE_KEYWORDS = [
  '반려동물 헬스케어',
  '시니어 디지털 교육',
  '친환경 패키징',
  '1인 가구 밀키트',
  'AI 영어 튜터',
];

export default function KeywordInput({ onSubmit, loading = false }: KeywordInputProps) {
  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (keyword.trim() && !loading) {
      onSubmit(keyword.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    setKeyword(example);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          {/* 글로우 효과 */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl sm:rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
          
          {/* 입력창 - 모바일 최적화 */}
          <div className="relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="분석하고 싶은 키워드 입력"
              disabled={loading}
              className={cn(
                'w-full px-4 sm:px-6 py-4 sm:py-5 pr-24 sm:pr-32',
                'text-base sm:text-lg rounded-xl sm:rounded-2xl',
                'bg-white/90 backdrop-blur-sm',
                'border-2 border-gray-200/50',
                'placeholder:text-gray-400',
                'focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100',
                'transition-all duration-200',
                'disabled:opacity-60 disabled:cursor-not-allowed',
                'touch-manipulation' // 모바일 터치 최적화
              )}
              maxLength={50}
              autoComplete="off"
            />
            
            {/* 제출 버튼 - 모바일 터치 영역 확보 */}
            <button
              type="submit"
              disabled={!keyword.trim() || loading}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2',
                'px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl',
                'font-semibold text-sm sm:text-base',
                'bg-gradient-to-r from-violet-600 to-indigo-600',
                'text-white shadow-lg shadow-violet-500/30',
                'hover:shadow-xl hover:shadow-violet-500/40 hover:scale-[1.02]',
                'active:scale-[0.98]',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                'transition-all duration-200',
                'flex items-center gap-1.5 sm:gap-2',
                'min-h-[44px]', // iOS 최소 터치 영역
                'touch-manipulation'
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span className="hidden xs:inline">분석중</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>분석</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* 예시 키워드 - 모바일 최적화 */}
      <div className="mt-4 sm:mt-6">
        <div className="flex items-center gap-2 mb-2 sm:mb-3 px-1">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-gray-500">예시 키워드</span>
        </div>
        
        {/* 스크롤 가능한 가로 배치 (모바일) + 일반 배치 (PC) */}
        <div className="flex sm:flex-wrap gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {EXAMPLE_KEYWORDS.map((example) => (
            <button
              key={example}
              onClick={() => handleExampleClick(example)}
              disabled={loading}
              className={cn(
                'px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full whitespace-nowrap',
                'bg-white/80 backdrop-blur-sm',
                'border border-gray-200/50',
                'text-gray-600 hover:text-violet-600',
                'hover:border-violet-300 hover:bg-violet-50/50',
                'active:scale-95',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'touch-manipulation',
                'flex-shrink-0' // 모바일 스크롤용
              )}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
