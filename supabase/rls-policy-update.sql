-- ==========================================
-- RLS 정책 업데이트: 모든 사용자가 모든 리포트 조회 가능
-- ==========================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view their own reports or public reports" ON reports;

-- 새로운 정책: 모든 사용자가 모든 리포트 조회 가능
CREATE POLICY "Anyone can view all reports"
  ON reports FOR SELECT
  USING (true);

-- 기존 정책은 유지 (INSERT, UPDATE, DELETE)
-- INSERT: "Anyone can create reports" (이미 있음)
-- UPDATE: "Users can update their own reports" (이미 있음)
-- DELETE: "Users can delete their own reports" (이미 있음)

