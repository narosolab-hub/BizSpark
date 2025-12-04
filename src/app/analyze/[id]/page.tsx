'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ReportView from '@/components/ReportView';
import { Report } from '@/types';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AnalyzePage() {
  const params = useParams();
  const id = params.id as string;
  
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchReport();
    }
  }, [id]);

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/reports/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '리포트를 불러오는데 실패했습니다.');
      }

      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-violet-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">리포트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">😢</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            리포트를 찾을 수 없습니다
          </h1>
          <p className="text-gray-400 mb-6">
            {error || '요청하신 리포트가 존재하지 않거나 삭제되었습니다.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors"
          >
            새 분석 시작하기
          </Link>
        </div>
      </div>
    );
  }

  return <ReportView report={report} />;
}
