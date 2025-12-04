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
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
          <div className="relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="분석하고 싶은 키워드를 입력하세요"
              disabled={loading}
              className={cn(
                'w-full px-6 py-5 pr-32 text-lg rounded-2xl',
                'bg-white/90 backdrop-blur-sm',
                'border-2 border-gray-200/50',
                'placeholder:text-gray-400',
                'focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100',
                'transition-all duration-200',
                'disabled:opacity-60 disabled:cursor-not-allowed'
              )}
              maxLength={50}
            />
            <button
              type="submit"
              disabled={!keyword.trim() || loading}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2',
                'px-6 py-3 rounded-xl font-semibold',
                'bg-gradient-to-r from-violet-600 to-indigo-600',
                'text-white shadow-lg shadow-violet-500/30',
                'hover:shadow-xl hover:shadow-violet-500/40 hover:scale-[1.02]',
                'active:scale-[0.98]',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                'transition-all duration-200',
                'flex items-center gap-2'
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>분석중</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>분석</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* 예시 키워드 */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">예시 키워드</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_KEYWORDS.map((example) => (
            <button
              key={example}
              onClick={() => handleExampleClick(example)}
              disabled={loading}
              className={cn(
                'px-4 py-2 text-sm rounded-full',
                'bg-white/80 backdrop-blur-sm',
                'border border-gray-200/50',
                'text-gray-600 hover:text-violet-600',
                'hover:border-violet-300 hover:bg-violet-50/50',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed'
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

