-- ==========================================
-- BizSpark Supabase Database Schema
-- ==========================================

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- reports 테이블
-- 분석 리포트 저장
-- ==========================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  analysis_result JSONB NOT NULL,
  trend_data JSONB,
  news_data JSONB,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- reports 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_keyword ON reports USING gin(to_tsvector('simple', keyword));

-- ==========================================
-- subscriptions 테이블
-- 구독 정보 저장
-- ==========================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
  credits_remaining INT NOT NULL DEFAULT 3,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- subscriptions 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- ==========================================
-- Row Level Security (RLS) 설정
-- ==========================================

-- reports 테이블 RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 비로그인 사용자도 리포트 생성 가능 (user_id NULL 허용)
CREATE POLICY "Anyone can create reports"
  ON reports FOR INSERT
  WITH CHECK (true);

-- 자신의 리포트만 조회 가능 (또는 user_id가 NULL인 경우)
CREATE POLICY "Users can view their own reports or public reports"
  ON reports FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

-- 자신의 리포트만 업데이트 가능
CREATE POLICY "Users can update their own reports"
  ON reports FOR UPDATE
  USING (auth.uid() = user_id);

-- 자신의 리포트만 삭제 가능
CREATE POLICY "Users can delete their own reports"
  ON reports FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- subscriptions 테이블 RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 자신의 구독 정보만 조회 가능
CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- 자신의 구독 정보만 업데이트 가능
CREATE POLICY "Users can update their own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- ==========================================
-- 트리거 함수: updated_at 자동 업데이트
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- reports 테이블 트리거
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- subscriptions 테이블 트리거
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 새 유저 가입 시 기본 구독 생성 함수
-- ==========================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan, credits_remaining)
  VALUES (NEW.id, 'free', 3);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users 테이블에 트리거 연결
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

