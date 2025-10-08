#!/bin/bash

# Git 커밋 스크립트
cd /Users/user/Documents/overtime-app

echo "🔄 변경사항 확인 중..."
git status

echo ""
echo "📦 파일 추가 중..."
git add .

echo ""
echo "💾 커밋 중..."
git commit -m "feat: 비밀번호 재설정 및 이메일 찾기 기능 추가

- ForgotPasswordModal: 비밀번호 재설정 이메일 전송
- FindEmailModal: 이메일 마스킹 힌트 제공
- authService: sendPasswordResetEmail 메서드 추가
- LoginForm: 비밀번호/이메일 찾기 링크 추가

보안 기능:
- 이메일 마스킹 (p***@gmail.com)
- 계정 존재 여부 숨김
- Rate limiting (Supabase 기본 제공)
- 사업자등록번호로 본인 확인"

echo ""
echo "✅ 커밋 완료!"
echo ""
echo "변경된 파일:"
echo "- src/components/ForgotPasswordModal.js (새 파일)"
echo "- src/components/FindEmailModal.js (새 파일)"
echo "- src/components/LoginForm.js (수정)"
echo "- src/services/authService.js (수정)"
