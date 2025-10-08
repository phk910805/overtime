#!/bin/bash

# Reset Password 페이지 추가 커밋

cd /Users/user/Documents/overtime-app

echo "🔄 변경사항 확인 중..."
git status

echo ""
echo "📦 파일 추가 중..."
git add .

echo ""
echo "💾 커밋 중..."
git commit -m "feat: 비밀번호 재설정 페이지 추가

- ResetPasswordPage: 이메일 링크에서 접근하는 비밀번호 재설정 페이지
- AuthWrapper: URL 라우팅 로직 추가 (/reset-password)
- SUPABASE-EMAIL-SETUP.md: 이메일 템플릿 설정 가이드

기능:
- 재설정 토큰 자동 확인
- 비밀번호 유효성 검증 (6자리 이상, 영문+숫자)
- 비밀번호 보기/숨기기 토글
- 변경 성공 시 자동 로그인 화면 이동
- 만료된 링크 에러 처리

UX:
- 실시간 에러 메시지
- 로딩 상태 표시
- 성공 화면 (3초 후 자동 이동)
- 로그인 화면으로 돌아가기 버튼"

echo ""
echo "✅ 커밋 완료!"
echo ""
echo "변경/추가된 파일:"
echo "- src/components/ResetPasswordPage.js (새 파일)"
echo "- src/components/AuthWrapper.js (수정)"
echo "- SUPABASE-EMAIL-SETUP.md (새 파일)"
