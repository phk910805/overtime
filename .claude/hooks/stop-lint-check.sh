#!/bin/bash
set +e

# Stop hook — AI 응답 완료 후 수정된 src/*.js 파일에 ESLint 자동 실행
# 수정된 파일 없으면 즉시 종료 (오버헤드 0)
# 에러 발견 시 컨텍스트에 추가 → 다음 턴에서 AI가 인식하여 수정

# Get modified .js files in src/ (staged + unstaged vs last commit)
MODIFIED_FILES=$(git diff --name-only HEAD 2>/dev/null | grep -E '^src/.*\.js$')

if [ -z "$MODIFIED_FILES" ]; then
  exit 0
fi

FILE_COUNT=$(echo "$MODIFIED_FILES" | wc -l | tr -d ' ')

# Run ESLint on modified files only (suppress browserslist noise)
LINT_OUTPUT=$(npx eslint --no-error-on-unmatched-pattern $MODIFIED_FILES 2>/dev/null)
LINT_EXIT=$?

# Count problems from the summary line (e.g. "✖ 1 problem (0 errors, 1 warning)")
PROBLEM_COUNT=$(echo "$LINT_OUTPUT" | grep -oE '[0-9]+ problem' | grep -oE '[0-9]+' || echo "0")

if [ "$PROBLEM_COUNT" = "0" ] && [ $LINT_EXIT -eq 0 ]; then
  exit 0
fi

# Extract problem details (file path + error/warning lines only)
DETAILS=$(echo "$LINT_OUTPUT" | grep -E '(^\S.*\.js$|^\s+[0-9]+:[0-9]+\s+(error|warning))')

echo "[LINT CHECK] ${FILE_COUNT}개 수정 파일 검사 — 문제 ${PROBLEM_COUNT}개 발견 (CI=true에서 빌드 실패 원인)"
echo "$DETAILS"

exit 0
