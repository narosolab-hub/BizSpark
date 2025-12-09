'use client';

import { useState, useRef } from 'react';
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
  Menu,
  Sparkles,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';

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
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between hover:bg-gray-50/50 active:bg-gray-100/50 transition-colors touch-manipulation"
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-600 flex-shrink-0">
            {icon}
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{title}</h2>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-100">
          <div className="pt-4 sm:pt-5">{children}</div>
        </div>
      )}
    </div>
  );
}

interface PromptCardProps {
  prompt: {
    title: string;
    prompt: string;
  };
}

function PromptCard({ prompt }: PromptCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('복사에 실패했습니다.');
    }
  };

  return (
    <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-blue-50 border border-blue-200">
      <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2">
        <h5 className="font-medium text-sm sm:text-base text-gray-900 flex-1">{prompt.title}</h5>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs sm:text-sm transition-colors flex-shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
              복사됨
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
              복사
            </>
          )}
        </button>
      </div>
      <div className="bg-white rounded-lg p-2 sm:p-3 border border-blue-100">
        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-mono">
          {prompt.prompt}
        </p>
      </div>
    </div>
  );
}

export default function ReportView({ report }: ReportViewProps) {
  const { keyword, analysis_result: analysis, created_at } = report;
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const reportContentRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        // 모바일 네이티브 공유
        await navigator.share({
          title: `"${keyword}" 시장 분석 리포트`,
          text: 'BizSpark AI 분석 리포트를 확인해보세요',
          url: window.location.href,
        });
      } else {
        // 폴백: 클립보드 복사
        await navigator.clipboard.writeText(window.location.href);
        alert('링크가 복사되었습니다!');
      }
    } catch {
      alert('링크 복사에 실패했습니다.');
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportContentRef.current) {
      alert('리포트 내용을 찾을 수 없습니다.');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pdfWidth - margin * 2;
      let yPosition = margin;

      // 헤더 추가
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`"${report.keyword}" 시장 분석 리포트`, margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const dateStr = report.created_at 
        ? new Date(report.created_at).toLocaleDateString('ko-KR')
        : new Date().toLocaleDateString('ko-KR');
      pdf.text(`생성일: ${dateStr}`, margin, yPosition);
      yPosition += 15;

      // 분석 결과를 텍스트로 변환하여 PDF에 추가
      const analysis = report.analysis_result;
      
      // 핵심 인사이트
      if (analysis.keyInsights && analysis.keyInsights.length > 0) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('핵심 인사이트', margin, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        analysis.keyInsights.forEach((insight: string) => {
          const lines = pdf.splitTextToSize(`• ${insight}`, contentWidth);
          if (yPosition + lines.length * 6 > pdfHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(lines, margin, yPosition);
          yPosition += lines.length * 6 + 2;
        });
        yPosition += 5;
      }

      // 시장 개요
      if (analysis.marketOverview) {
        if (yPosition + 20 > pdfHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('시장 개요', margin, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const mo = analysis.marketOverview;
        if (mo.definition) {
          const lines = pdf.splitTextToSize(`정의: ${mo.definition}`, contentWidth);
          if (yPosition + lines.length * 6 > pdfHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(lines, margin, yPosition);
          yPosition += lines.length * 6 + 3;
        }
        if (mo.marketSize) {
          const lines = pdf.splitTextToSize(`시장 규모: ${mo.marketSize}`, contentWidth);
          if (yPosition + lines.length * 6 > pdfHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(lines, margin, yPosition);
          yPosition += lines.length * 6 + 3;
        }
        if (mo.trend) {
          const lines = pdf.splitTextToSize(`트렌드: ${mo.trend}`, contentWidth);
          if (yPosition + lines.length * 6 > pdfHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(lines, margin, yPosition);
          yPosition += lines.length * 6 + 3;
        }
        yPosition += 5;
      }

      // 타겟 고객
      if (analysis.targetCustomers) {
        if (yPosition + 20 > pdfHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('타겟 고객', margin, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const tc = analysis.targetCustomers;
        if (tc.coreGroup) {
          pdf.setFont('helvetica', 'bold');
          const lines = pdf.splitTextToSize(`핵심 그룹: ${tc.coreGroup}`, contentWidth);
          if (yPosition + lines.length * 6 > pdfHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(lines, margin, yPosition);
          yPosition += lines.length * 6 + 3;
          pdf.setFont('helvetica', 'normal');
        }
        if (tc.segments && tc.segments.length > 0) {
          const lines = pdf.splitTextToSize(`세그먼트: ${tc.segments.join(', ')}`, contentWidth);
          if (yPosition + lines.length * 6 > pdfHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(lines, margin, yPosition);
          yPosition += lines.length * 6 + 3;
        }
        yPosition += 5;
      }

      // 사업 아이디어
      if (analysis.businessIdeas && analysis.businessIdeas.length > 0) {
        if (yPosition + 20 > pdfHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('사업 아이디어', margin, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        analysis.businessIdeas.forEach((idea: any, idx: number) => {
          if (yPosition + 30 > pdfHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.setFont('helvetica', 'bold');
          const titleLines = pdf.splitTextToSize(`${idx + 1}. ${idea.title || '아이디어'} (${idea.type || '유형'})`, contentWidth);
          pdf.text(titleLines, margin, yPosition);
          yPosition += titleLines.length * 6 + 2;
          
          pdf.setFont('helvetica', 'normal');
          if (idea.description) {
            const descLines = pdf.splitTextToSize(`설명: ${idea.description}`, contentWidth);
            if (yPosition + descLines.length * 6 > pdfHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(descLines, margin, yPosition);
            yPosition += descLines.length * 6 + 2;
          }
          if (idea.usp) {
            const uspLines = pdf.splitTextToSize(`USP: ${idea.usp}`, contentWidth);
            if (yPosition + uspLines.length * 6 > pdfHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(uspLines, margin, yPosition);
            yPosition += uspLines.length * 6 + 2;
          }
          yPosition += 5;
        });
      }

      // 경쟁사
      if (analysis.competitors && analysis.competitors.length > 0) {
        if (yPosition + 20 > pdfHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('경쟁 환경', margin, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        analysis.competitors.forEach((competitor: any, idx: number) => {
          if (yPosition + 40 > pdfHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.setFont('helvetica', 'bold');
          const nameLines = pdf.splitTextToSize(`${idx + 1}. ${competitor.name}`, contentWidth);
          pdf.text(nameLines, margin, yPosition);
          yPosition += nameLines.length * 6 + 2;
          
          pdf.setFont('helvetica', 'normal');
          if (competitor.serviceScope) {
            const lines = pdf.splitTextToSize(`서비스 범위: ${competitor.serviceScope}`, contentWidth);
            if (yPosition + lines.length * 6 > pdfHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(lines, margin, yPosition);
            yPosition += lines.length * 6 + 2;
          }
          if (competitor.priceRange) {
            const lines = pdf.splitTextToSize(`가격대: ${competitor.priceRange}`, contentWidth);
            if (yPosition + lines.length * 6 > pdfHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(lines, margin, yPosition);
            yPosition += lines.length * 6 + 2;
          }
          if (competitor.coreUSP) {
            const lines = pdf.splitTextToSize(`핵심 USP: ${competitor.coreUSP}`, contentWidth);
            if (yPosition + lines.length * 6 > pdfHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(lines, margin, yPosition);
            yPosition += lines.length * 6 + 2;
          }
          if (competitor.strength) {
            const lines = pdf.splitTextToSize(`강점: ${competitor.strength}`, contentWidth);
            if (yPosition + lines.length * 6 > pdfHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(lines, margin, yPosition);
            yPosition += lines.length * 6 + 2;
          }
          if (competitor.weakness) {
            const lines = pdf.splitTextToSize(`약점: ${competitor.weakness}`, contentWidth);
            if (yPosition + lines.length * 6 > pdfHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(lines, margin, yPosition);
            yPosition += lines.length * 6 + 2;
          }
          yPosition += 5;
        });
      }

      // MVP 기능
      if (analysis.mvpFeatures && analysis.mvpFeatures.length > 0) {
        if (yPosition + 20 > pdfHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('MVP 필수 기능', margin, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        analysis.mvpFeatures.forEach((feature: string, idx: number) => {
          const lines = pdf.splitTextToSize(`${idx + 1}. ${feature}`, contentWidth);
          if (yPosition + lines.length * 6 > pdfHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(lines, margin, yPosition);
          yPosition += lines.length * 6 + 2;
        });
        yPosition += 5;
      }

      // 비즈니스 모델
      if (analysis.businessModel && analysis.businessModel.options && analysis.businessModel.options.length > 0) {
        if (yPosition + 20 > pdfHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('비즈니스 모델', margin, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        analysis.businessModel.options.forEach((option: any, idx: number) => {
          if (yPosition + 30 > pdfHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.setFont('helvetica', 'bold');
          const typeLines = pdf.splitTextToSize(`${idx + 1}. ${option.type || '모델 유형'}`, contentWidth);
          pdf.text(typeLines, margin, yPosition);
          yPosition += typeLines.length * 6 + 2;
          
          pdf.setFont('helvetica', 'normal');
          if (option.pricing) {
            const lines = pdf.splitTextToSize(`가격 정책: ${option.pricing}`, contentWidth);
            if (yPosition + lines.length * 6 > pdfHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(lines, margin, yPosition);
            yPosition += lines.length * 6 + 2;
          }
          if (option.rationale) {
            const lines = pdf.splitTextToSize(`선택 근거: ${option.rationale}`, contentWidth);
            if (yPosition + lines.length * 6 > pdfHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(lines, margin, yPosition);
            yPosition += lines.length * 6 + 2;
          }
          yPosition += 5;
        });
      }

      // 로드맵
      if (analysis.roadmap) {
        if (yPosition + 20 > pdfHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('30일 실행 로드맵', margin, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const roadmap = analysis.roadmap;
        Object.entries(roadmap).forEach(([week, tasks]: [string, string[]]) => {
          if (yPosition + 20 > pdfHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.setFont('helvetica', 'bold');
          pdf.text(week.toUpperCase(), margin, yPosition);
          yPosition += 6;
          
          pdf.setFont('helvetica', 'normal');
          tasks.forEach((task: string) => {
            const lines = pdf.splitTextToSize(`• ${task}`, contentWidth);
            if (yPosition + lines.length * 6 > pdfHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(lines, margin, yPosition);
            yPosition += lines.length * 6 + 2;
          });
          yPosition += 3;
        });
      }

      // 리스크
      if (analysis.risks && analysis.risks.length > 0) {
        if (yPosition + 20 > pdfHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('예상 리스크 및 대응 방안', margin, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        analysis.risks.forEach((risk: any, idx: number) => {
          if (yPosition + 40 > pdfHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.setFont('helvetica', 'bold');
          const riskLines = pdf.splitTextToSize(`${idx + 1}. 리스크: ${risk.risk}`, contentWidth);
          pdf.text(riskLines, margin, yPosition);
          yPosition += riskLines.length * 6 + 2;
          
          pdf.setFont('helvetica', 'normal');
          if (risk.solution) {
            const lines = pdf.splitTextToSize(`대응 방안: ${risk.solution}`, contentWidth);
            if (yPosition + lines.length * 6 > pdfHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(lines, margin, yPosition);
            yPosition += lines.length * 6 + 2;
          }
          if (risk.actionPlan) {
            const lines = pdf.splitTextToSize(`실행 계획: ${risk.actionPlan}`, contentWidth);
            if (yPosition + lines.length * 6 > pdfHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(lines, margin, yPosition);
            yPosition += lines.length * 6 + 2;
          }
          yPosition += 5;
        });
      }

      // AI 코파일럿 프롬프트
      if (analysis.aiCopilotPrompts && analysis.aiCopilotPrompts.length > 0) {
        if (yPosition + 20 > pdfHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('AI 코파일럿 프롬프트', margin, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const categories = ['시장 진입', '제품 구체화', '리스크 완화'];
        categories.forEach((category) => {
          const prompts = analysis.aiCopilotPrompts?.filter((p: any) => p.category === category) || [];
          if (prompts.length > 0) {
            if (yPosition + 20 > pdfHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.setFont('helvetica', 'bold');
            pdf.text(`[${category}]`, margin, yPosition);
            yPosition += 6;
            
            pdf.setFont('helvetica', 'normal');
            prompts.forEach((prompt: any, idx: number) => {
              if (yPosition + 30 > pdfHeight - margin) {
                pdf.addPage();
                yPosition = margin;
              }
              const titleLines = pdf.splitTextToSize(`${idx + 1}. ${prompt.title}`, contentWidth);
              pdf.text(titleLines, margin, yPosition);
              yPosition += titleLines.length * 6 + 2;
              
              if (prompt.prompt) {
                const promptLines = pdf.splitTextToSize(prompt.prompt, contentWidth - 5);
                if (yPosition + promptLines.length * 5 > pdfHeight - margin) {
                  pdf.addPage();
                  yPosition = margin;
                }
                pdf.setFont('helvetica', 'italic');
                pdf.text(promptLines, margin + 5, yPosition);
                yPosition += promptLines.length * 5 + 3;
                pdf.setFont('helvetica', 'normal');
              }
            });
            yPosition += 3;
          }
        });
      }

      // 파일 다운로드
      const fileName = `BizSpark_${report.keyword}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      alert('PDF 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-violet-50/30">
      {/* 헤더 - 모바일 최적화 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-gray-900 active:text-gray-900 transition-colors min-w-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-sm sm:text-base truncate">새 분석</span>
            </Link>
            
            {/* 데스크톱 버튼들 */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                title="공유하기"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    PDF 다운로드
                  </>
                )}
              </button>
            </div>
            
            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          
          {/* 모바일 드롭다운 메뉴 */}
          {showMobileMenu && (
            <div className="sm:hidden mt-3 pb-2 space-y-2 border-t border-gray-100 pt-3">
              <button
                onClick={() => {
                  handleShare();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 text-sm transition-colors"
              >
                <Share2 className="w-4 h-4" />
                공유하기
              </button>
              <button
                onClick={() => {
                  handleDownloadPDF();
                  setShowMobileMenu(false);
                }}
                disabled={isGeneratingPDF}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    PDF 다운로드
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8" ref={reportContentRef}>
        {/* 리포트 헤더 - 모바일 최적화 */}
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs sm:text-sm mb-3 sm:mb-4">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            시장 분석 리포트
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 break-words px-2">
            &quot;{keyword}&quot;
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {formatDate(created_at)} 생성
          </p>
        </div>

        {/* 섹션들 - 모바일 최적화 */}
        <div className="space-y-3 sm:space-y-4">
          {/* 핵심 인사이트 3줄 요약 */}
          {analysis.keyInsights && analysis.keyInsights.length > 0 && (
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl sm:rounded-2xl border-2 border-violet-200 p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-600 flex-shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">핵심 인사이트</h2>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {analysis.keyInsights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-2 sm:gap-3">
                    <span className="text-violet-600 font-bold text-sm sm:text-base mt-0.5 flex-shrink-0">
                      {idx + 1}.
                    </span>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-medium">
                      {insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 시장 개요 */}
          <Section
            title="시장 개요"
            icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />}
            defaultOpen={true}
          >
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">정의</h4>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{analysis.marketOverview.definition}</p>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">시장 규모</h4>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{analysis.marketOverview.marketSize}</p>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">트렌드</h4>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{analysis.marketOverview.trend}</p>
              </div>
            </div>
          </Section>

          {/* 타겟 고객 */}
          <Section title="타겟 고객" icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}>
            <div className="space-y-4 sm:space-y-6">
              {/* 핵심 그룹 강조 */}
              {analysis.targetCustomers.coreGroup && (
                <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-violet-50 border-2 border-violet-200">
                  <h4 className="text-xs sm:text-sm font-medium text-violet-700 mb-1.5 sm:mb-2">핵심 타겟 그룹</h4>
                  <p className="text-base sm:text-lg font-bold text-violet-900">{analysis.targetCustomers.coreGroup}</p>
                </div>
              )}
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-2 sm:mb-3">고객 세그먼트</h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {analysis.targetCustomers.segments.map((segment, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-violet-100 text-violet-700 text-xs sm:text-sm"
                    >
                      {segment}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-2 sm:mb-3">페인포인트</h4>
                <ul className="space-y-2">
                  {analysis.targetCustomers.painPoints.map((pain, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 flex-shrink-0">•</span>
                      <span className="text-sm sm:text-base text-gray-700 leading-relaxed">{pain}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          {/* 경쟁 환경 - 모바일 카드, 데스크톱 테이블 */}
          <Section title="경쟁 환경" icon={<Target className="w-4 h-4 sm:w-5 sm:h-5" />}>
            {/* 모바일: 카드 형식 - 모바일에서만 표시 */}
            <div className="block sm:hidden space-y-3 -mx-4 sm:mx-0 px-4 sm:px-0">
              {analysis.competitors.map((competitor, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200"
                >
                  <h4 className="font-semibold text-base text-gray-900 mb-3 pb-2 border-b border-gray-200">
                    {competitor.name}
                  </h4>
                  <div className="space-y-2.5 text-sm">
                    {competitor.serviceScope && (
                      <div>
                        <span className="font-medium text-gray-700">서비스 범위:</span>
                        <p className="text-gray-600 mt-0.5 leading-relaxed">{competitor.serviceScope}</p>
                      </div>
                    )}
                    {competitor.priceRange && (
                      <div>
                        <span className="font-medium text-gray-700">가격대:</span>
                        <p className="text-gray-600 mt-0.5 leading-relaxed">{competitor.priceRange}</p>
                      </div>
                    )}
                    {competitor.coreUSP && (
                      <div>
                        <span className="font-medium text-gray-700">핵심 USP:</span>
                        <p className="text-gray-600 mt-0.5 leading-relaxed">{competitor.coreUSP}</p>
                      </div>
                    )}
                    <div className="pt-2 space-y-1.5">
                      <div>
                        <span className="text-green-600 font-medium">강점:</span>
                        <p className="text-gray-600 mt-0.5 leading-relaxed">{competitor.strength}</p>
                      </div>
                      <div>
                        <span className="text-red-600 font-medium">약점:</span>
                        <p className="text-gray-600 mt-0.5 leading-relaxed">{competitor.weakness}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 데스크톱: 테이블 형식 - 데스크톱에서만 표시 */}
            <div className="hidden sm:block overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap min-w-[100px]">
                        경쟁사
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 min-w-[200px]">
                        서비스 범위
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 min-w-[150px]">
                        가격대
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 min-w-[150px]">
                        핵심 USP
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 min-w-[250px]">
                        강점/약점
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analysis.competitors.map((competitor, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">
                          {competitor.name}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-600 break-words max-w-[200px]">
                          {competitor.serviceScope || '-'}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-600 break-words max-w-[150px]">
                          {competitor.priceRange || '-'}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-600 break-words max-w-[150px]">
                          {competitor.coreUSP || '-'}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">
                          <div className="space-y-1.5 min-w-[250px]">
                            <div className="break-words">
                              <span className="text-green-600 font-medium">강:</span>{' '}
                              <span className="text-gray-600">{competitor.strength}</span>
                            </div>
                            <div className="break-words">
                              <span className="text-red-600 font-medium">약:</span>{' '}
                              <span className="text-gray-600">{competitor.weakness}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Section>

          {/* 사업 아이디어 */}
          <Section
            title="사업 아이디어 제안"
            icon={<Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />}
            defaultOpen={true}
          >
            <div className="space-y-3 sm:space-y-4">
              {analysis.businessIdeas.map((idea, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'p-4 sm:p-5 rounded-lg sm:rounded-xl border-2',
                    idx === 0
                      ? 'bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200'
                      : 'bg-white border-gray-100'
                  )}
                >
                  <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <span
                      className={cn(
                        'w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0',
                        idx === 0
                          ? 'bg-violet-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      )}
                    >
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base text-gray-900">{idea.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">{idea.description}</p>
                    </div>
                  </div>
                  <div className="ml-8 sm:ml-11 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    {idea.type && (
                      <div>
                        <span className="font-medium text-violet-600">유형:</span>
                        <span className="ml-2 px-2 py-0.5 rounded bg-violet-100 text-violet-700 font-medium">
                          {idea.type}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-violet-600">USP:</span>
                      <span className="text-gray-600 ml-2">{idea.usp}</span>
                    </div>
                    <div>
                      <span className="font-medium text-violet-600">타겟:</span>
                      <span className="text-gray-600 ml-2">{idea.targetCustomer}</span>
                    </div>
                    {idea.physicalTouchpoint && (
                      <div>
                        <span className="font-medium text-violet-600">물리적 접점:</span>
                        <span className="text-gray-600 ml-2">{idea.physicalTouchpoint}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* MVP 기능 */}
          <Section title="MVP 기능 리스트" icon={<Rocket className="w-4 h-4 sm:w-5 sm:h-5" />}>
            <ul className="space-y-2 sm:space-y-3">
              {analysis.mvpFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 sm:gap-3">
                  <span
                    className={cn(
                      'w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0',
                      idx < 3
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    )}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-sm sm:text-base text-gray-700 leading-relaxed">{feature}</span>
                  {idx < 3 && (
                    <span className="px-2 py-0.5 text-xs rounded bg-violet-100 text-violet-600 whitespace-nowrap">
                      우선순위
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Section>

          {/* 비즈니스 모델 - 다중 제안 */}
          <Section title="비즈니스 모델" icon={<DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />}>
            <div className="space-y-4 sm:space-y-5">
              {analysis.businessModel.options && analysis.businessModel.options.length > 0 ? (
                analysis.businessModel.options.map((option, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200"
                  >
                    <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-1">
                          {option.type}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{option.pricing}</p>
                      </div>
                    </div>
                    <div className="ml-8 sm:ml-11 mt-2 sm:mt-3">
                      <h5 className="text-xs sm:text-sm font-medium text-green-700 mb-1">선택 근거</h5>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{option.rationale}</p>
                    </div>
                  </div>
                ))
              ) : (
                // 하위 호환성: 기존 형식 지원
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">모델 유형</h4>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      {(analysis.businessModel as any).type || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">가격 정책</h4>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      {(analysis.businessModel as any).pricing || 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* 30일 로드맵 */}
          <Section title="30일 실행 로드맵" icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5" />}>
            <div className="space-y-4 sm:space-y-6">
              {(Object.entries(analysis.roadmap) as [string, string[]][]).map(([week, tasks]) => (
                <div key={week}>
                  <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 sm:mb-3 capitalize">
                    {week.replace('week', 'Week ')}
                  </h4>
                  <ul className="space-y-2">
                    {tasks?.map((task: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded bg-violet-100 text-violet-600 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600 leading-relaxed">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          {/* 리스크 분석 */}
          <Section title="리스크 & 대응" icon={<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />}>
            <div className="space-y-3 sm:space-y-4">
              {analysis.risks.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-amber-50/50 border border-amber-100"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 space-y-2">
                      <h4 className="font-medium text-sm sm:text-base text-gray-900">{item.risk}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        <span className="font-medium text-green-600">대응 방안:</span>{' '}
                        {item.solution}
                      </p>
                      {item.actionPlan && (
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-white/50 p-2 rounded border border-amber-200">
                          <span className="font-medium text-blue-600">실행 계획:</span>{' '}
                          {item.actionPlan}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* AI 코파일럿 프롬프트 */}
          {analysis.aiCopilotPrompts && analysis.aiCopilotPrompts.length > 0 && (
            <Section
              title="다음 단계: AI 기반 실행 프롬프트"
              icon={<Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />}
              defaultOpen={true}
            >
              <div className="space-y-4 sm:space-y-5">
                {['시장 진입', '제품 구체화', '리스크 완화'].map((category) => {
                  const prompts = analysis.aiCopilotPrompts?.filter((p) => p.category === category) || [];
                  if (prompts.length === 0) return null;
                  return (
                    <div key={category} className="space-y-3 sm:space-y-4">
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        {category}
                      </h4>
                      {prompts.map((promptItem, idx) => (
                        <PromptCard key={idx} prompt={promptItem} />
                      ))}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

