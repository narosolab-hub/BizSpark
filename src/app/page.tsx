'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import KeywordInput from '@/components/KeywordInput';
import AnalysisProgress from '@/components/AnalysisProgress';
import { Sparkles, TrendingUp, Lightbulb, Rocket, Clock } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  const handleAnalyze = async (inputKeyword: string) => {
    setKeyword(inputKeyword);
    setLoading(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: inputKeyword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '분석 중 오류가 발생했습니다.');
      }

      if (data.reportId) {
        router.push(`/analyze/${data.reportId}`);
      } else {
        // reportId가 없으면 홈으로
        alert('분석이 완료되었으나 저장에 실패했습니다.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  // 로딩 중일 때 진행 화면 표시
  if (loading) {
    return <AnalysisProgress keyword={keyword} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-40 right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* 메인 컨텐츠 */}
      <div className="relative z-10">
        {/* 헤더 */}
        <header className="pt-8 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">BizSpark</span>
            </div>
            <a
              href="/dashboard"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              내 리포트
            </a>
          </div>
        </header>

        {/* 히어로 섹션 */}
        <main className="px-6 pt-20 pb-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* 배지 */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-violet-300 text-sm mb-8">
              <Clock className="w-4 h-4" />
              5분 안에 사업 아이디어 검증
            </div>

            {/* 타이틀 */}
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              키워드 하나로
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                사업 아이디어
              </span>
              를 발견하세요
            </h1>

            {/* 서브타이틀 */}
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              AI가 시장 트렌드를 분석하고, 경쟁 환경을 파악하고,
              <br className="hidden md:block" />
              실행 가능한 사업 아이디어와 전략까지 제안합니다.
            </p>

            {/* 키워드 입력 */}
            <KeywordInput onSubmit={handleAnalyze} loading={loading} />

            {/* 기능 소개 */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={<TrendingUp className="w-6 h-6" />}
                title="시장 트렌드 분석"
                description="네이버 + 구글 트렌드 데이터로 실시간 시장 동향 파악"
              />
              <FeatureCard
                icon={<Lightbulb className="w-6 h-6" />}
                title="AI 아이디어 생성"
                description="Gemini AI가 3가지 차별화된 사업 아이디어 제안"
              />
              <FeatureCard
                icon={<Rocket className="w-6 h-6" />}
                title="실행 전략 제공"
                description="MVP 기능, 비즈니스 모델, 30일 로드맵까지"
              />
            </div>
          </div>
        </main>

        {/* 푸터 */}
        <footer className="absolute bottom-0 w-full py-6 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-sm text-gray-500">
              © 2024 BizSpark. AI 기반 사업 아이디어 생성 플랫폼
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-left hover:bg-white/10 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center text-violet-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
