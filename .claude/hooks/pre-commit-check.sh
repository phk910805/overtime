#!/bin/bash
set +e

# PreToolUse hook for Bash
# Checks for dangerous git operations and reminds about build verification
# Blocks: --no-verify, push --force, reset --hard

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)

if [ -z "$COMMAND" ]; then
  exit 0
fi

# Early exit: if command doesn't start with "git", not our concern
FIRST_WORD=$(echo "$COMMAND" | awk '{print $1}')
if [ "$FIRST_WORD" != "git" ]; then
  exit 0
fi

# Block --no-verify
if echo "$COMMAND" | grep -qE '^git\s+.*--no-verify'; then
  echo "--no-verify 플래그 사용 금지! 프로젝트 규칙 위반입니다." >&2
  exit 2
fi

# Block git push --force / -f
if echo "$COMMAND" | grep -qE '^git\s+push\s+.*(-f|--force)'; then
  echo "git push --force 금지! 프로젝트 규칙 위반입니다." >&2
  exit 2
fi

# Block git reset --hard
if echo "$COMMAND" | grep -qE '^git\s+reset\s+--hard'; then
  echo "git reset --hard 금지! 프로젝트 규칙 위반입니다." >&2
  exit 2
fi

# Remind on git commit
if echo "$COMMAND" | grep -qE '^git\s+commit'; then
  echo "[REMIND] CI=true npm run build 통과했는지 확인! 빌드 실패 상태에서 커밋 금지."
fi

# Remind on git push — pre-deploy checklist
if echo "$COMMAND" | grep -qE '^git\s+push'; then
  echo "[SKILL] pre-deploy 체크리스트: CI빌드 → 결과물확인 → 의도하지않은변경 → 브랜치확인"
fi

exit 0
