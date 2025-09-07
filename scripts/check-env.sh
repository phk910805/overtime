#!/bin/bash

# 🛡️ 환경변수 일관성 검증 도구
# 로컬과 프로덕션 환경변수가 일치하는지 확인

echo "🔍 Environment Consistency Check"
echo "================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_passed=true

# .env.local과 .env.production 비교
echo "📋 Comparing local vs production settings..."

# .env.local 파일 확인
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ .env.local file not found${NC}"
    check_passed=false
fi

# .env.production 파일 확인
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ .env.production file not found${NC}"
    check_passed=false
fi

if [ "$check_passed" = true ]; then
    # 환경변수 로드
    source .env.local
    LOCAL_USE_SUPABASE=$REACT_APP_USE_SUPABASE
    LOCAL_SUPABASE_URL=$REACT_APP_SUPABASE_URL
    LOCAL_SUPABASE_KEY=$REACT_APP_SUPABASE_ANON_KEY

    source .env.production
    PROD_USE_SUPABASE=$REACT_APP_USE_SUPABASE
    PROD_SUPABASE_URL=$REACT_APP_SUPABASE_URL
    PROD_SUPABASE_KEY=$REACT_APP_SUPABASE_ANON_KEY

    echo ""
    echo "🔧 Environment Settings Comparison:"
    echo "======================================"
    
    # USE_SUPABASE 비교
    if [ "$LOCAL_USE_SUPABASE" = "$PROD_USE_SUPABASE" ]; then
        echo -e "${GREEN}✅ USE_SUPABASE: $LOCAL_USE_SUPABASE (consistent)${NC}"
    else
        echo -e "${RED}❌ USE_SUPABASE: LOCAL=$LOCAL_USE_SUPABASE vs PROD=$PROD_USE_SUPABASE${NC}"
        check_passed=false
    fi
    
    # Supabase URL 비교
    if [ "$LOCAL_SUPABASE_URL" = "$PROD_SUPABASE_URL" ]; then
        echo -e "${GREEN}✅ SUPABASE_URL: ${LOCAL_SUPABASE_URL:0:30}... (consistent)${NC}"
    else
        echo -e "${RED}❌ SUPABASE_URL: Different between local and production${NC}"
        check_passed=false
    fi
    
    # Supabase Key 비교
    if [ "$LOCAL_SUPABASE_KEY" = "$PROD_SUPABASE_KEY" ]; then
        echo -e "${GREEN}✅ SUPABASE_KEY: ${LOCAL_SUPABASE_KEY:0:30}... (consistent)${NC}"
    else
        echo -e "${RED}❌ SUPABASE_KEY: Different between local and production${NC}"
        check_passed=false
    fi

    echo ""
    
    # 프로덕션 배포 준비성 확인
    if [ "$PROD_USE_SUPABASE" = "true" ] && [ -n "$PROD_SUPABASE_URL" ] && [ -n "$PROD_SUPABASE_KEY" ]; then
        echo -e "${GREEN}✅ Production deployment ready${NC}"
    else
        echo -e "${RED}❌ Production configuration incomplete${NC}"
        check_passed=false
    fi
fi

echo ""
if [ "$check_passed" = true ]; then
    echo -e "${GREEN}🎉 All environment checks passed!${NC}"
    exit 0
else
    echo -e "${RED}💥 Environment configuration issues detected${NC}"
    echo -e "${YELLOW}💡 Fix suggestions:${NC}"
    echo "  1. Ensure both .env.local and .env.production have identical Supabase settings"
    echo "  2. Set REACT_APP_USE_SUPABASE=true in both files"
    echo "  3. Verify Supabase URL and key are properly set"
    exit 1
fi
