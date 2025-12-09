'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [reanalyzing, setReanalyzing] = useState<string | null>(null);
  const [expandedKeywords, setExpandedKeywords] = useState<Set<string>>(new Set());

  const getTime = (dateStr: string | null) => {
    if (!dateStr) return 0;
    const time = new Date(dateStr).getTime();
    return isNaN(time) ? 0 : time;
  };

  const groupedReports = useMemo<GroupedReport[]>(() => {
    if (!reports || reports.length === 0) return [];
    
    const groups: { [key: string]: ReportListItem[] } = {};
    
    // 최신 리포트부터 처리 (이미 정렬되어 있지만 확실히 하기 위해)
    const sortedReports = [...reports].sort((a, b) => getTime(b.created_at) - getTime(a.created_at));
    
    sortedReports.forEach((report) => {
      if (!groups[report.keyword]) {
        groups[report.keyword] = [];
      }
      groups[report.keyword].push(report);
    });

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

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      // 타임스탬프를 쿼리 파라미터로 추가하여 캐시 무효화
      const response = await fetch(`/api/reports?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      const data = await response.json();

      if (response.ok) {
        const allReports = data.reports || [];
        
        // 사용자별 리포트 필터링 (localStorage에 저장된 내 리포트 ID만 표시)
        const myReportIds = JSON.parse(localStorage.getItem('myReportIds') || '[]');
        const myReports = myReportIds.length > 0 
          ? allReports.filter((report: ReportListItem) => myReportIds.includes(report.id))
          : allReports; // localStorage가 비어있으면 모든 리포트 표시 (기존 동작 유지)
        
        console.log('[DASHBOARD] All reports:', allReports.length);
        console.log('[DASHBOARD] My report IDs:', myReportIds.length);
        console.log('[DASHBOARD] Filtered reports:', myReports.length);
        
        if (myReports.length > 0) {
          const latest = myReports[0];
          console.log('[DASHBOARD] Latest report:', {
            keyword: latest.keyword,
            created_at: latest.created_at,
            date: latest.created_at ? new Date(latest.created_at).toLocaleString('ko-KR') : 'N/A',
          });
        }
        setReports(myReports);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    
    // 페이지가 포커스를 받을 때마다 리포트 목록 새로고침
    const handleFocus = () => {
      console.log('[DASHBOARD] Window focused, refreshing reports...');
      fetchReports();
    };
    
    // 페이지가 보일 때마다 새로고침 (다른 페이지에서 돌아올 때)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('[DASHBOARD] Page visible, refreshing reports...');
        fetchReports();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchReports]);

  // 경로 변경 시 새로고침 (다른 페이지에서 돌아올 때)
  useEffect(() => {
    if (pathname === '/dashboard') {
      console.log('[DASHBOARD] Route changed to dashboard, refreshing reports...');
      fetchReports();
    }
  }, [pathname, fetchReports]);


  const handleDelete = async (id: string) => {
    if (!confirm('이 리포트를 삭제하시겠습니까?')) return;

    setDeleting(id);
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // 프론트에서 즉시 삭제 반영
        setReports((prev) => prev.filter((r) => r.id !== id));
        // localStorage에서도 제거 (사용자별 리포트 관리용)
        const myReportIds = JSON.parse(localStorage.getItem('myReportIds') || '[]');
        const updatedIds = myReportIds.filter((reportId: string) => reportId !== id);
        localStorage.setItem('myReportIds', JSON.stringify(updatedIds));
      } else {
        const data = await response.json();
        alert(data.error || '삭제에 실패했습니다.');
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
        // 사용자별 리포트 관리: localStorage에 리포트 ID 저장
        const myReportIds = JSON.parse(localStorage.getItem('myReportIds') || '[]');
        if (!myReportIds.includes(data.reportId)) {
          myReportIds.push(data.reportId);
          localStorage.setItem('myReportIds', JSON.stringify(myReportIds));
          console.log('[DASHBOARD] Saved report ID to localStorage:', data.reportId);
        }
        // 리포트 목록 즉시 새로고침하여 최신 리포트 반영
        await fetchReports();
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
      {/* 헤더 - 모바일 최적화 */}
      <header className="pt-4 sm:pt-8 px-4 sm:px-6 pb-4 sm:pb-6 border-b border-white/10 sticky top-0 z-10 bg-slate-900/80 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 min-w-0 flex-shrink">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-white truncate">BizSpark</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-violet-600 text-white hover:bg-violet-700 active:scale-95 transition-all text-sm sm:text-base whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">새 분석</span>
            <span className="xs:hidden">분석</span>
          </Link>
        </div>
      </header>

      {/* 메인 */}
      <main className="px-4 sm:px-6 py-6 sm:py-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">내 리포트</h1>
              <p className="text-sm sm:text-base text-gray-400">
                생성한 시장 분석 리포트를 확인하세요
              </p>
            </div>
            <button
              onClick={() => fetchReports()}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-violet-600 text-white hover:bg-violet-700 active:scale-95 transition-all text-sm sm:text-base whitespace-nowrap flex-shrink-0"
              title="최신 리포트 새로고침"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">새로고침</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 sm:py-20">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 sm:py-20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">
                아직 리포트가 없습니다
              </h2>
              <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 px-4">
                키워드를 입력하고 첫 번째 시장 분석을 시작해보세요
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-violet-600 text-white hover:bg-violet-700 active:scale-95 transition-all text-sm sm:text-base"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                분석 시작하기
              </Link>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {groupedReports.map((group) => {
                const isExpanded = expandedKeywords.has(group.keyword);
                const hasMultipleVersions = group.reports.length > 1;
                const latestReport = group.reports[0];
                const isReanalyzing = reanalyzing === group.keyword;

                return (
                  <div
                    key={group.keyword}
                    className="rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
                  >
                    {/* 그룹 헤더 (최신 버전) */}
                    <div className="group p-4 sm:p-5 hover:bg-white/10 transition-all">
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                        <Link
                          href={`/analyze/${latestReport.id}`}
                          className="flex-1 min-w-0 flex items-center gap-3 sm:gap-4"
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-violet-300 transition-colors truncate">
                                &quot;{group.keyword}&quot;
                              </h3>
                              {hasMultipleVersions && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-violet-500/20 text-violet-300 whitespace-nowrap">
                                  {group.reports.length}개 버전
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mt-1">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">{formatDateTime(latestReport.created_at)}</span>
                              {hasMultipleVersions && (
                                <span className="text-violet-400 whitespace-nowrap">(최신)</span>
                              )}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all hidden sm:block flex-shrink-0" />
                        </Link>
                        
                        {/* 액션 버튼들 - 모바일 최적화 */}
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          {hasMultipleVersions && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                toggleExpand(group.keyword);
                              }}
                              className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 active:scale-90 transition-all"
                              title="이전 버전 보기"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                              ) : (
                                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                              )}
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleReanalyze(group.keyword);
                            }}
                            disabled={isReanalyzing}
                            className="p-2 rounded-lg text-gray-500 hover:text-violet-400 hover:bg-violet-500/10 active:scale-90 transition-all disabled:opacity-50"
                            title="같은 키워드로 다시 분석"
                          >
                            {isReanalyzing ? (
                              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDelete(latestReport.id);
                            }}
                            disabled={deleting === latestReport.id}
                            className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 active:scale-90 transition-all disabled:opacity-50"
                            title="리포트 삭제"
                          >
                            {deleting === latestReport.id ? (
                              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 이전 버전들 */}
                    {isExpanded && hasMultipleVersions && (
                      <div className="border-t border-white/10 bg-white/[0.02]">
                        {group.reports.slice(1).map((report, idx) => (
                          <div
                            key={report.id}
                            className={cn(
                              'group px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-2',
                              'hover:bg-white/5 transition-all',
                              idx !== group.reports.length - 2 && 'border-b border-white/5'
                            )}
                          >
                            <Link
                              href={`/analyze/${report.id}`}
                              className="flex-1 min-w-0 flex items-center gap-3 sm:gap-4"
                            >
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-700/50 flex items-center justify-center ml-0 sm:ml-2 flex-shrink-0">
                                <span className="text-xs sm:text-sm font-medium text-gray-400">
                                  v{group.reports.length - idx - 1}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span className="truncate">{formatDateTime(report.created_at)}</span>
                                </div>
                              </div>
                              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 group-hover:text-gray-400 transition-all hidden sm:block flex-shrink-0" />
                            </Link>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleDelete(report.id);
                              }}
                              disabled={deleting === report.id}
                              className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 active:scale-90 transition-all disabled:opacity-50 flex-shrink-0"
                              title="리포트 삭제"
                            >
                              {deleting === report.id ? (
                                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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
