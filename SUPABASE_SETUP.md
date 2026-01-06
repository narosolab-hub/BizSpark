# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Name**: BizSpark (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 설정 (나중에 필요)
   - **Region**: 가장 가까운 리전 선택
4. 프로젝트 생성 완료 대기 (약 2분)

## 2. 환경 변수 설정

프로젝트가 생성되면 다음 정보를 확인하세요:

1. Supabase 대시보드 → **Settings** → **API**
2. 다음 정보를 복사:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. `.env.local` 파일에 추가 (또는 Vercel 환경 변수에 추가):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. 데이터베이스 스키마 적용

1. Supabase 대시보드 → **SQL Editor** 클릭
2. `supabase/schema.sql` 파일의 전체 내용을 복사하여 SQL Editor에 붙여넣기
3. **Run** 버튼 클릭하여 실행
4. 성공 메시지 확인

## 4. RLS 정책 업데이트 (선택사항)

모든 사용자가 모든 리포트를 조회할 수 있도록 하려면:

1. SQL Editor에서 `supabase/rls-policy-update.sql` 파일의 내용을 실행
2. 또는 기본 스키마의 RLS 정책을 그대로 사용 (자신의 리포트만 조회)

## 5. 확인

스키마가 제대로 적용되었는지 확인:

1. Supabase 대시보드 → **Table Editor**
2. `reports` 테이블이 생성되었는지 확인
3. `subscriptions` 테이블이 생성되었는지 확인

## 6. Vercel 환경 변수 설정 (배포 시)

Vercel에 배포하는 경우:

1. Vercel 대시보드 → 프로젝트 → **Settings** → **Environment Variables**
2. 다음 변수 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY` (이미 있다면)

## 문제 해결

### "분석이 완료되었으나 저장에 실패했습니다" 에러

1. Supabase 대시보드 → **Logs** → **Postgres Logs**에서 에러 확인
2. RLS 정책이 제대로 설정되었는지 확인
3. 환경 변수가 올바르게 설정되었는지 확인

### 테이블이 보이지 않을 때

1. SQL Editor에서 다음 쿼리 실행:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

2. `reports`와 `subscriptions` 테이블이 있는지 확인

