#!/bin/bash

# ============================================
# Multi-tenancy 롤백 스크립트
# ============================================

echo "⚠️  Multi-tenancy 작업 롤백을 시작합니다..."
echo ""
echo "이 스크립트는 다음을 수행합니다:"
echo "1. Git을 백업 커밋으로 되돌리기"
echo "2. Supabase DB를 수동으로 복원하는 방법 안내"
echo ""

read -p "계속하시겠습니까? (y/N): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "롤백이 취소되었습니다."
    exit 0
fi

echo ""
echo "📋 Step 1: Git 롤백"
echo ""

# 백업 커밋 찾기
echo "최근 백업 커밋 목록:"
git log --oneline --grep="backup: before multi-tenancy" -5

echo ""
read -p "롤백할 커밋 해시를 입력하세요 (또는 Enter로 최신 백업): " commit_hash

if [ -z "$commit_hash" ]; then
    # 최신 백업 커밋으로 롤백
    commit_hash=$(git log --oneline --grep="backup: before multi-tenancy" -1 | awk '{print $1}')
fi

echo ""
echo "커밋 $commit_hash 로 롤백 중..."

# Hard reset (변경사항 모두 제거)
git reset --hard $commit_hash

echo "✅ Git 롤백 완료!"
echo ""

# Step 2: DB 롤백 안내
echo "📋 Step 2: Supabase DB 복원"
echo ""
echo "⚠️  주의: DB는 수동으로 복원해야 합니다."
echo ""
echo "방법 1: Supabase Dashboard 백업에서 복원"
echo "  1. https://app.supabase.com 접속"
echo "  2. 프로젝트 선택"
echo "  3. Database → Backups"
echo "  4. 'before-multi-tenancy-2024-12-14' 선택"
echo "  5. [Restore] 버튼 클릭"
echo ""
echo "방법 2: SQL로 수동 복원 (테이블별)"
echo "  1. Supabase SQL Editor 접속"
echo "  2. 다음 스크립트 실행:"
echo ""
echo "  -- companies 테이블 삭제 (추가된 경우)"
echo "  DROP TABLE IF EXISTS company_invites CASCADE;"
echo "  DROP TABLE IF EXISTS companies CASCADE;"
echo ""
echo "  -- company_id 컬럼 제거"
echo "  ALTER TABLE profiles DROP COLUMN IF EXISTS company_id;"
echo "  ALTER TABLE employees DROP COLUMN IF EXISTS company_id;"
echo "  ALTER TABLE overtime_records DROP COLUMN IF EXISTS company_id;"
echo "  ALTER TABLE vacation_records DROP COLUMN IF EXISTS company_id;"
echo "  ALTER TABLE carryover_records DROP COLUMN IF EXISTS company_id;"
echo "  ALTER TABLE settings DROP COLUMN IF EXISTS company_id;"
echo "  ALTER TABLE settings_history DROP COLUMN IF EXISTS company_id;"
echo "  ALTER TABLE employee_changes DROP COLUMN IF EXISTS company_id;"
echo ""
echo "  -- RLS 정책 비활성화"
echo "  ALTER TABLE employees DISABLE ROW LEVEL SECURITY;"
echo "  ALTER TABLE overtime_records DISABLE ROW LEVEL SECURITY;"
echo "  ALTER TABLE vacation_records DISABLE ROW LEVEL SECURITY;"
echo ""
echo "✅ 롤백 완료!"
echo ""
echo "다음 단계:"
echo "1. 로컬 서버 재시작: npm start"
echo "2. 기능 테스트"
echo "3. 문제 없으면 GitHub 푸시: git push origin main --force"
echo ""
