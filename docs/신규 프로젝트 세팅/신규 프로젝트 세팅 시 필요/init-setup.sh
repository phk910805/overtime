#!/bin/bash
# ============================================================
# 새 머신/계정 초기 설정
# ============================================================
# 새 환경에서 한 번만 실행합니다.
#
# 하는 일:
#   1. Node.js 확인
#   2. npm 글로벌 bin PATH 설정
#   3. Claude Code CLI 설치
#   4. Git 사용자 설정 확인
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}새 환경 초기 설정${NC}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── 1. Node.js ──
if ! command -v node &> /dev/null; then
  echo -e "${RED}[ERROR]${NC} Node.js가 설치되어 있지 않습니다."
  echo -e "  ${BOLD}https://nodejs.org/${NC} 에서 설치해주세요."
  exit 1
fi
echo -e "${GREEN}[OK]${NC} Node.js $(node -v)"

# ── 2. npm 글로벌 bin PATH ──
npm_prefix=$(npm config get prefix 2>/dev/null)
npm_bin="${npm_prefix}/bin"

if ! echo "$PATH" | grep -q "$npm_bin"; then
  echo -e "${YELLOW}[!]${NC} npm 글로벌 bin($npm_bin)이 PATH에 없습니다. 추가합니다."

  # bash/zsh 판별
  shell_rc="$HOME/.bashrc"
  if [ -n "$ZSH_VERSION" ] || [ "$(basename "$SHELL")" = "zsh" ]; then
    shell_rc="$HOME/.zshrc"
  fi

  echo "export PATH=\"${npm_bin}:\$PATH\"" >> "$shell_rc"
  export PATH="${npm_bin}:$PATH"
  echo -e "${GREEN}[OK]${NC} PATH 추가 완료 ($shell_rc)"
else
  echo -e "${GREEN}[OK]${NC} npm 글로벌 bin PATH 설정됨"
fi

# ── 3. Claude Code CLI ──
if command -v claude &> /dev/null; then
  echo -e "${GREEN}[OK]${NC} Claude Code 이미 설치됨 ($(claude --version 2>/dev/null))"
else
  echo -e "Claude Code를 설치합니다..."
  npm install -g @anthropic-ai/claude-code
  echo -e "${GREEN}[OK]${NC} Claude Code 설치 완료 ($(claude --version 2>/dev/null))"
fi

# ── 4. Git 사용자 설정 ──
git_name=$(git config --global user.name 2>/dev/null || true)
git_email=$(git config --global user.email 2>/dev/null || true)

if [ -n "$git_name" ] && [ -n "$git_email" ]; then
  echo -e "${GREEN}[OK]${NC} Git 사용자: $git_name <$git_email>"
else
  echo -e "${YELLOW}[!]${NC} Git 사용자 설정이 없습니다."
  if [ -z "$git_name" ]; then
    echo -e -n "${YELLOW}이름을 입력해주세요: ${NC}"
    read -r input_name
    git config --global user.name "$input_name"
  fi
  if [ -z "$git_email" ]; then
    echo -e -n "${YELLOW}이메일을 입력해주세요: ${NC}"
    read -r input_email
    git config --global user.email "$input_email"
  fi
  echo -e "${GREEN}[OK]${NC} Git 사용자 설정 완료"
fi

# ── 완료 ──
echo ""
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}초기 설정 완료!${NC}"
echo ""
echo -e "  ${GREEN}[v]${NC} Node.js $(node -v)"
echo -e "  ${GREEN}[v]${NC} Claude Code $(claude --version 2>/dev/null)"
echo -e "  ${GREEN}[v]${NC} npm 글로벌 PATH"
echo -e "  ${GREEN}[v]${NC} Git 사용자 설정"
echo ""
echo -e "  이제 프로젝트 루트에서 ${BOLD}claude${NC} 를 실행하세요."
echo ""
echo -e "  ${BOLD}디자인 시스템(WDS)이 필요하면:${NC}"
echo -e "  ${BOLD}wds-01-machine-setup.sh${NC} → ${BOLD}wds-02-project-setup.sh${NC} 순서로 실행"
echo ""
