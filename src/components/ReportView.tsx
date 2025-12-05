'use client';

import { useState } from 'react';
import { Report } from '@/types';
import { cn, formatDate } from '@/lib/utils';
import {
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  TrendingUp,
  Users,
  Target,
  Lightbulb,
  Rocket,
  DollarSign,
  Calendar,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface ReportViewProps {
  report: Report;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon, children, defaultOpen = false }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-600">
            {icon}
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="pt-5">{children}</div>
        </div>
      )}
    </div>
  );
}

export default function ReportView({ report }: ReportViewProps) {
  const { keyword, analysis_result: analysis, created_at } = report;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다!');
    } catch {
      alert('링크 복사에 실패했습니다.');
    }
  };

  const handleDownloadPDF = () => {
    // TODO: PDF 다운로드 구현
    alert('PDF 다운로드 기능은 준비 중입니다.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-violet-50/30">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>새 분석</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                PDF 다운로드
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 리포트 헤더 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm mb-4">
            <TrendingUp className="w-4 h-4" />
            시장 분석 리포트
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            &ldquo;{keyword}&rdquo;
          </h1>
          <p className="text-gray-500">
            {formatDate(created_at)} 생성
          </p>
        </div>

        {/* 섹션들 */}
        <div className="space-y-4">
          {/* 시장 개요 */}
          <Section
            title="시장 개요"
            icon={<TrendingUp className="w-5 h-5" />}
            defaultOpen={true}
          >
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">정의</h4>
                <p className="text-gray-700">{analysis.marketOverview.definition}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">시장 규모</h4>
                <p className="text-gray-700">{analysis.marketOverview.marketSize}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">트렌드</h4>
                <p className="text-gray-700">{analysis.marketOverview.trend}</p>
              </div>
            </div>
          </Section>

          {/* 타겟 고객 */}
          <Section title="타겟 고객" icon={<Users className="w-5 h-5" />}>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">고객 세그먼트</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.targetCustomers.segments.map((segment, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm"
                    >
                      {segment}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">페인포인트</h4>
                <ul className="space-y-2">
                  {analysis.targetCustomers.painPoints.map((pain, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span className="text-gray-700">{pain}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          {/* 경쟁 환경 */}
          <Section title="경쟁 환경" icon={<Target className="w-5 h-5" />}>
            <div className="space-y-4">
              {analysis.competitors.map((competitor, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {competitor.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-green-600 font-medium">강점:</span>
                      <p className="text-gray-600 mt-1">{competitor.strength}</p>
                    </div>
                    <div>
                      <span className="text-red-600 font-medium">약점:</span>
                      <p className="text-gray-600 mt-1">{competitor.weakness}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* 사업 아이디어 */}
          <Section
            title="사업 아이디어 제안"
            icon={<Lightbulb className="w-5 h-5" />}
            defaultOpen={true}
          >
            <div className="space-y-4">
              {analysis.businessIdeas.map((idea, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'p-5 rounded-xl border-2',
                    idx === 0
                      ? 'bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200'
                      : 'bg-white border-gray-100'
                  )}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                        idx === 0
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      )}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{idea.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{idea.description}</p>
                    </div>
                  </div>
                  <div className="ml-11 space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-violet-600">USP:</span>
                      <span className="text-gray-600 ml-2">{idea.usp}</span>
                    </div>
                    <div>
                      <span className="font-medium text-violet-600">타겟:</span>
                      <span className="text-gray-600 ml-2">{idea.targetCustomer}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* MVP 기능 */}
          <Section title="MVP 기능 리스트" icon={<Rocket className="w-5 h-5" />}>
            <ul className="space-y-3">
              {analysis.mvpFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <span
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                      idx < 3
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    )}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-gray-700">{feature}</span>
                  {idx < 3 && (
                    <span className="px-2 py-0.5 text-xs rounded bg-violet-100 text-violet-600">
                      우선순위
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Section>

          {/* 비즈니스 모델 */}
          <Section title="비즈니스 모델" icon={<DollarSign className="w-5 h-5" />}>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">모델 유형</h4>
                <p className="text-gray-700">{analysis.businessModel.type}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">가격 정책</h4>
                <p className="text-gray-700">{analysis.businessModel.pricing}</p>
              </div>
            </div>
          </Section>

          {/* 30일 로드맵 */}
          <Section title="30일 실행 로드맵" icon={<Calendar className="w-5 h-5" />}>
            <div className="space-y-6">
              {Object.entries(analysis.roadmap).map(([week, tasks]) => (
                <div key={week}>
                  <h4 className="font-semibold text-gray-900 mb-3 capitalize">
                    {week.replace('week', 'Week ')}
                  </h4>
                  <ul className="space-y-2">
                    {tasks.map((task: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded bg-violet-100 text-violet-600 flex items-center justify-center text-xs mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-gray-600">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          {/* 리스크 분석 */}
          <Section title="리스크 & 대응" icon={<AlertTriangle className="w-5 h-5" />}>
            <div className="space-y-4">
              {analysis.risks.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-amber-50/50 border border-amber-100"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">{item.risk}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium text-green-600">대응:</span>{' '}
                        {item.solution}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

