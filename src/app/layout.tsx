import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'BizSpark - AI 기반 사업 아이디어 생성 플랫폼',
  description:
    '키워드 하나로 시장 데이터 분석부터 실행 가능한 사업 아이디어까지, AI가 5분 안에 만들어주는 창업 검증 플랫폼',
  keywords: [
    '사업 아이디어',
    '창업',
    '시장 분석',
    'AI',
    '트렌드 분석',
    'MVP',
    '비즈니스 모델',
  ],
  authors: [{ name: 'BizSpark' }],
  openGraph: {
    title: 'BizSpark - AI 기반 사업 아이디어 생성 플랫폼',
    description:
      '키워드 하나로 시장 데이터 분석부터 실행 가능한 사업 아이디어까지',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={outfit.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
