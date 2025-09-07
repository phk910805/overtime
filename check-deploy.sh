#!/bin/bash
# 배포 전 환경설정 검증 스크립트

echo "🚀 배포 전 환경설정 검증 시작..."

# 환경변수 파일 존재 확인
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production 파일이 없습니다!"
    exit 1
fi

echo "✅ .env.production 파일 확인됨"

# 필수 환경변수 확인
echo "📋 환경변수 확인 중..."

# .env.production 파일 읽기
source .env.production

# Supabase 설정 확인
if [ "$REACT_APP_USE_SUPABASE" = "true" ]; then
    echo "🔗 Supabase 모드 활성화됨"
    
    if [ -z "$REACT_APP_SUPABASE_URL" ]; then
        echo "❌ REACT_APP_SUPABASE_URL이 설정되지 않았습니다!"
        exit 1
    fi
    
    if [ -z "$REACT_APP_SUPABASE_ANON_KEY" ]; then
        echo "❌ REACT_APP_SUPABASE_ANON_KEY가 설정되지 않았습니다!"
        exit 1
    fi
    
    echo "✅ Supabase 설정 완료"
    echo "   - URL: ${REACT_APP_SUPABASE_URL:0:30}..."
    echo "   - Key: ${REACT_APP_SUPABASE_ANON_KEY:0:30}..."
    
else
    echo "🗄️ localStorage 모드 활성화됨"
    echo "⚠️  경고: 프로덕션에서 localStorage 사용은 권장되지 않습니다!"
fi

# Git 상태 확인
echo "📦 Git 상태 확인..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  경고: 커밋되지 않은 변경사항이 있습니다!"
    git status --porcelain
    echo ""
    read -p "계속 진행하시겠습니까? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "❌ 배포 중단됨"
        exit 1
    fi
fi

echo "✅ 모든 검증 완료! 배포 준비됨"
echo ""
echo "🎯 배포할 환경:"
echo "   - 스토리지: $([ "$REACT_APP_USE_SUPABASE" = "true" ] && echo "Supabase" || echo "localStorage")"
echo "   - 휴일 API: $REACT_APP_HOLIDAY_API_URL"
echo ""
