#!/bin/bash

# ============================================
# Multi-tenancy 작업 전 전체 백업 스크립트
# ============================================

BACKUP_DIR="/Users/user/Desktop/overtime-app/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🔒 Multi-tenancy 작업 전 백업 시작..."
echo ""

# 1) 백업 디렉토리 생성
mkdir -p "$BACKUP_DIR"

# 2) 환경 변수 백업
echo "📋 환경 변수 백업 중..."
cp .env.local "$BACKUP_DIR/.env.local.backup_$TIMESTAMP"
cp .env.production "$BACKUP_DIR/.env.production.backup_$TIMESTAMP"
echo "   ✅ .env 파일 백업 완료"

# 3) 중요 문서 백업
echo ""
echo "📄 문서 백업 중..."
cp -r src "$BACKUP_DIR/src_backup_$TIMESTAMP"
echo "   ✅ 소스 코드 백업 완료"

# 4) 패키지 정보 백업
echo ""
echo "📦 패키지 정보 백업 중..."
cp package.json "$BACKUP_DIR/package.json.backup_$TIMESTAMP"
cp package-lock.json "$BACKUP_DIR/package-lock.json.backup_$TIMESTAMP"
echo "   ✅ 패키지 정보 백업 완료"

# 5) Git 커밋
echo ""
echo "💾 Git 커밋 중..."
git add .
git commit -m "backup: complete system backup before multi-tenancy

Backup includes:
- Source code (src/)
- Environment files (.env.*)
- Package configurations
- Current database schema

Timestamp: $TIMESTAMP"

echo "   ✅ Git 커밋 완료"

# 6) 완료 메시지
echo ""
echo "✅ 백업 완료!"
echo ""
echo "백업 위치: $BACKUP_DIR"
echo "타임스탬프: $TIMESTAMP"
echo ""
echo "📌 다음 단계:"
echo "1. GitHub 푸시: git push origin main"
echo "2. Supabase Dashboard에서 DB 백업"
echo "3. 백업 확인 후 Multi-tenancy 작업 시작"
echo ""
