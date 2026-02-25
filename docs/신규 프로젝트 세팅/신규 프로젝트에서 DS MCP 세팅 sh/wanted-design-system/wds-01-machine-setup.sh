#!/bin/bash
# ============================================================
# WDS MCP — 머신 설정 (계정당 한 번)
# ============================================================
# ~/.npmrc에 GitHub Packages 인증을 설정합니다.
# @wanteddev/wds-mcp 패키지 접근에 필요합니다.
#
# 사전 조건:
#   - init-setup.sh 실행 완료
#   - GitHub wanteddev 조직 멤버 (초대 수락 완료)
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}WDS MCP — 머신 설정${NC}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# npmrc 확인
npmrc_has_token=false
npmrc_has_registry=false

if [ -f ~/.npmrc ]; then
  grep -q "npm\.pkg\.github\.com/:_authToken" ~/.npmrc 2>/dev/null && npmrc_has_token=true
  grep -q "@wanteddev:registry" ~/.npmrc 2>/dev/null && npmrc_has_registry=true
fi

if [ "$npmrc_has_token" = true ] && [ "$npmrc_has_registry" = true ]; then
  echo -e "${GREEN}[OK]${NC} ~/.npmrc 설정이 이미 완료되어 있습니다."
  echo ""
  echo -e "  ${BOLD}wds-02-project-setup.sh${NC}로 프로젝트를 설정하세요."
  exit 0
fi

# GitHub PAT 입력
echo -e "${BOLD}GitHub Personal Access Token (Classic) 생성이 필요합니다.${NC}"
echo ""
echo "  1. https://github.com/settings/tokens/new 접속"
echo "  2. Note: 원하는 이름 (예: wds-packages)"
echo "  3. Expiration: No expiration"
echo "  4. 권한: read:packages 체크"
echo "  5. Generate token 클릭"
echo ""

while true; do
  echo -e -n "${YELLOW}토큰을 붙여넣어주세요: ${NC}"
  read -r -s github_token
  echo ""

  if [[ "$github_token" == ghp_* ]] || [[ "$github_token" == github_pat_* ]]; then
    echo -e "${GREEN}[OK]${NC} 토큰 형식 확인"
    break
  else
    echo -e "${RED}[ERROR]${NC} ghp_ 또는 github_pat_ 으로 시작해야 합니다."
  fi
done

# 기존 npmrc 백업
if [ -f ~/.npmrc ]; then
  cp ~/.npmrc ~/.npmrc.backup.$(date +%Y%m%d%H%M%S)
  sed -i '/@wanteddev/d' ~/.npmrc 2>/dev/null || sed -i '' '/@wanteddev/d' ~/.npmrc 2>/dev/null || true
  sed -i '/npm\.pkg\.github\.com\/:_authToken/d' ~/.npmrc 2>/dev/null || sed -i '' '/npm\.pkg\.github\.com\/:_authToken/d' ~/.npmrc 2>/dev/null || true
fi

{
  echo "//npm.pkg.github.com/:_authToken=${github_token}"
  echo "@wanteddev:registry=https://npm.pkg.github.com/"
} >> ~/.npmrc

echo -e "${GREEN}[OK]${NC} ~/.npmrc 설정 완료"

# 연결 테스트
echo ""
echo -e "패키지 접근을 테스트합니다..."
if npm view @wanteddev/wds-mcp version 2>/dev/null; then
  echo -e "${GREEN}[OK]${NC} @wanteddev/wds-mcp 접근 가능"
else
  echo -e "${YELLOW}[!]${NC} 패키지 접근을 확인할 수 없습니다. 토큰 또는 조직 가입을 확인해주세요."
fi

echo ""
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}머신 설정 완료.${NC} 이제 ${BOLD}wds-02-project-setup.sh${NC}로 프로젝트를 설정하세요."
echo ""
