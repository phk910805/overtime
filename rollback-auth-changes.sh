#!/bin/bash

# 코드 수정 안전 원칙 - 3단계: 즉시 롤백
echo "🚨 문제 발견으로 인한 롤백 진행..."

# 현재 상태 확인
echo "📍 현재 브랜치: $(git branch --show-current)"
echo "📝 변경된 파일들:"
git status --porcelain

echo ""
echo "⏪ 백업 지점으로 롤백 중..."

# 백업 지점으로 롤백
git reset --hard HEAD~1

if [ $? -eq 0 ]; then
    echo "✅ 롤백 완료!"
    echo "📊 현재 상태:"
    git log --oneline -3
    echo ""
    echo "🔍 변경된 파일들:"
    git status --porcelain
    echo ""
    echo "✨ 원상 복구되었습니다."
else
    echo "❌ 롤백 실패"
    exit 1
fi

echo ""
echo "🎯 다음 단계: 기존 Auth 시스템 완전 분석 후 재계획"
