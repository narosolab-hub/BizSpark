'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDateTime, cn } from '@/lib/utils';
import {
  Sparkles,
  FileText,
  Trash2,
  Plus,
  Loader2,
  Clock,
  ArrowRight,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ReportListItem {
  id: string;
  keyword: string;
  created_at: string | null;
}

interface GroupedReport {
  keyword: string;
  reports: ReportListItem[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [reanalyzing, setReanalyzing] = useState<string | null>(null);
  const [expandedKeywords, setExpandedKeywords] = useState<Set<string>>(new Set());

  // 날짜 파싱 헬퍼 (NULL 처리)
  const getTime = (dateStr: string | null) => {
    if (!dateStr) return 0;
    const time = new Date(dateStr).getTime();
    return isNaN(time) ? 0 : time;
  };

  // 키워드별로 그룹화
  const groupedReports = useMemo<GroupedReport[]>(() => {
    const groups: { [key: string]: ReportListItem[] } = {};
    
    reports.forEach((report) => {
      if (!groups[report.keyword]) {
        groups[report.keyword] = [];
      }
      groups[report.keyword].push(report);
    });

    // 각 그룹 내에서 날짜 역순 정렬 (최신이 맨 위, NULL은 맨 뒤)
    // 그룹 자체도 최신 리포트 기준으로 정렬
    return Object.entries(groups)
      .map(([keyword, items]) => ({
        keyword,
        reports: items.sort((a, b) => getTime(b.created_at) - getTime(a.created_at)),
      }))
      .sort((a, b) => getTime(b.reports[0].created_at) - getTime(a.reports[0].created_at));
  }, [reports]);

  const toggleExpand = (keyword: string) => {
    setExpandedKeywords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyword)) {
        newSet.delete(keyword);
      } else {
        newSet.add(keyword);
      }
      return newSet;
    });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // 캐시 무시하고 항상 최신 데이터 가져오기
      const response = await fetch('/api/reports', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      const data = await response.json();
      console.log('[DASHBOARD] Fetched reports:', data.reports?.length);

      if (response.ok) {
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 리포트를 삭제하시겠습니까?')) return;

    setDeleting(id);
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReports((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to delete report:', error);
      alert('삭제에 실패했습니다.');
    } finally {
      setDeleting(null);
    }
  };

  const handleReanalyze = async (keyword: string) => {
    if (!confirm(`"${keyword}" 키워드로 새로운 분석을 시작하시겠습니까?\n(기존 리포트는 유지됩니다)`)) return;

    setReanalyzing(keyword);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword }),
      });

      const data = await response.json();

      if (response.ok && data.reportId) {
        // 새 리포트를 리스트에 추가
        const newReport: ReportListItem = {
          id: data.reportId,
          keyword: keyword,
          created_at: new Date().toISOString(),
        };
        setReports((prev) => [newReport, ...prev]);
        
        // 새 리포트 페이지로 이동
        router.push(`/analyze/${data.reportId}`);
      } else {
        alert(data.error || '분석에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to reanalyze:', error);
      alert('분석에 실패했습니다.');
    } finally {
      setReanalyzing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900">
      {/* 헤더 */}
      <header className="pt-8 px-6 pb-6 border-b border-white/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">BizSpark</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 분석
          </Link>
        </div>
      </header>

      {/* 메인 */}
      <main className="px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">내 리포트</h1>
            <p className="text-gray-400">
              생성한 시장 분석 리포트를 확인하세요
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-gray-500" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                아직 리포트가 없습니다
              </h2>
              <p className="text-gray-400 mb-6">
                키워드를 입력하고 첫 번째 시장 분석을 시작해보세요
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                분석 시작하기
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {groupedReports.map((group) => {
                const isExpanded = expandedKeywords.has(group.keyword);
                const hasMultipleVersions = group.reports.length > 1;
                const latestReport = group.reports[0];
                const isReanalyzing = reanalyzing === group.keyword;

                return (
                  <div
                    key={group.keyword}
                    className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
                  >
                    {/* 그룹 헤더 (최신 버전) */}
                    <div
                      className={cn(
                        'group p-5',
                        'hover:bg-white/10 transition-all'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/analyze/${latestReport.id}`}
                          className="flex-1 flex items-center gap-4"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-violet-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors">
                                &ldquo;{group.keyword}&rdquo;
                              </h3>
                              {hasMultipleVersions && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-violet-500/20 text-violet-300">
                                  {group.reports.length}개 버전
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <Clock className="w-4 h-4" />
                              {formatDateTime(latestReport.created_at)}
                              {hasMultipleVersions && (
                                <span className="text-violet-400">(최신)</span>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                        </Link>
                        
                        {/* 버전 펼치기 버튼 */}
                        {hasMultipleVersions && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleExpand(group.keyword);
                            }}
                            className="ml-2 p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                            title="이전 버전 보기"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleReanalyze(group.keyword);
                          }}
                          disabled={isReanalyzing}
                          className="ml-2 p-2 rounded-lg text-gray-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors disabled:opacity-50"
                          title="같은 키워드로 다시 분석"
                        >
                          {isReanalyzing ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(latestReport.id);
                          }}
                          disabled={deleting === latestReport.id}
                          className="ml-2 p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          title="리포트 삭제"
                        >
                          {deleting === latestReport.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 이전 버전들 */}
                    {isExpanded && hasMultipleVersions && (
                      <div className="border-t border-white/10 bg-white/[0.02]">
                        {group.reports.slice(1).map((report, idx) => (
                          <div
                            key={report.id}
                            className={cn(
                              'group px-5 py-4 flex items-center justify-between',
                              'hover:bg-white/5 transition-all',
                              idx !== group.reports.length - 2 && 'border-b border-white/5'
                            )}
                          >
                            <Link
                              href={`/analyze/${report.id}`}
                              className="flex-1 flex items-center gap-4"
                            >
                              <div className="w-10 h-10 rounded-lg bg-gray-700/50 flex items-center justify-center ml-2">
                                <span className="text-sm font-medium text-gray-400">
                                  v{group.reports.length - idx - 1}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                  <Clock className="w-4 h-4" />
                                  {formatDateTime(report.created_at)}
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-all" />
                            </Link>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelete(report.id);
                              }}
                              disabled={deleting === report.id}
                              className="ml-2 p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                              title="리포트 삭제"
                            >
                              {deleting === report.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
