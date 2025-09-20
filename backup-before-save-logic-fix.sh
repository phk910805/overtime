#!/bin/bash

# 코드 수정 안전 원칙 - UI 수정 후 저장 로직 개선 전 백업
echo "🔄 UI 수정 완료 후 저장 로직 개선 전 백업..."

# 변경사항 스테이징 및 커밋
git add .
git commit -m "backup after UI fixes before save logic improvements - $(date '+%Y-%m-%d %H:%M:%S')"

if [ $? -eq 0 ]; then
    echo "✅ 백업 완료!"
    echo "🔄 롤백이 필요한 경우: git reset --hard HEAD~1"
else
    echo "⚠️  커밋할 변경사항이 없습니다"
fi

echo "🎯 다음: 저장 로직 개선"
