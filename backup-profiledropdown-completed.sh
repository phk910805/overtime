#!/bin/bash

# 코드 수정 안전 원칙 - ProfileDropdown 완료 상태 백업
echo "🔄 ProfileDropdown 완료 상태 백업 중..."

# 현재 브랜치 확인
echo "📍 현재 브랜치: $(git branch --show-current)"

# 변경사항 확인
echo "📝 변경된 파일들:"
git status --porcelain

# 모든 변경사항 스테이징
echo "📦 변경사항 스테이징..."
git add .

# 백업 커밋
echo "💾 백업 커밋 생성..."
git commit -m "backup ProfileDropdown completed state before modal implementation - $(date '+%Y-%m-%d %H:%M:%S')"

if [ $? -eq 0 ]; then
    echo "✅ 백업 완료!"
    echo "🔄 롤백이 필요한 경우: git reset --hard HEAD~1"
else
    echo "⚠️  커밋할 변경사항이 없습니다 (이미 최신 상태)"
fi

echo ""
echo "🎯 다음 단계: 프로필 편집 모달 구현"
