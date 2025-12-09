# RLS 정책 수정 가이드

## 문제
다른 사용자가 리포트를 생성해도 다른 사용자의 리포트 목록에 나타나지 않고, 새로고침하면 사라지는 문제가 발생했습니다.

## 원인
Supabase의 Row Level Security (RLS) 정책이 `user_id IS NULL OR auth.uid() = user_id`로 설정되어 있어서, 인증되지 않은 사용자나 다른 사용자의 리포트를 볼 수 없었습니다.

## 해결 방법

### 1. Supabase 대시보드에서 RLS 정책 수정

1. Supabase 대시보드 (https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **SQL Editor** 클릭
4. 아래 SQL 쿼리를 실행:

```sql
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view their own reports or public reports" ON reports;

-- 새로운 정책: 모든 사용자가 모든 리포트 조회 가능
CREATE POLICY "Anyone can view all reports"
  ON reports FOR SELECT
  USING (true);
```

### 2. 또는 `supabase/rls-policy-update.sql` 파일 실행

프로젝트 루트에 있는 `supabase/rls-policy-update.sql` 파일의 내용을 Supabase SQL Editor에서 실행하세요.

## 참고사항

- **INSERT 정책**: 이미 "Anyone can create reports"로 설정되어 있어 모든 사용자가 리포트를 생성할 수 있습니다.
- **UPDATE/DELETE 정책**: 자신의 리포트만 수정/삭제할 수 있도록 유지됩니다.
- **보안 고려사항**: 모든 사용자가 모든 리포트를 볼 수 있으므로, 민감한 정보가 포함된 리포트는 생성하지 않도록 주의하세요.

