#!/bin/bash
set +e

# PreToolUse hook for Edit|Write
# 1) Warns Claude when editing critical files with context-specific reminders
# 2) Routes to relevant skill based on file path and operation type (Edit=수정, Write=생성)
# Never blocks (always exit 0)

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

BASENAME=$(basename "$FILE_PATH")
SKILL=""

# === 1) Critical file warnings ===
case "$BASENAME" in
  context.js)
    cat <<'WARN'
[CRITICAL FILE] context.js — 전체 앱 상태에 영향
- useEffect 4개 분리 구조 (초기로드/월변경/리프레시/visibility)
- 새 데이터 소스 추가 시: useEffect 1의 Promise.all + useEffect 3에도 동일 추가
- isDataLoadedRef.current가 false이면 useEffect 2는 스킵됨
- resetIsInitialized()는 signOut에서 호출 — 새 상태 추가 시 리셋 대상 확인
- 수정 전 반드시 전체 파일을 Read 했는지 확인!
WARN
    SKILL="safe-edit"
    ;;
  authService.js)
    cat <<'WARN'
[CRITICAL FILE] authService.js — 인증 흐름 전체에 영향
- signOut: 5단계 캐시 초기화 순서 유지 (storageAdapter → dataCalculator → dataService → sessionStorage → resetIsInitialized)
- signIn: _loadProfileRole 호출 필수 (안 하면 역할 null → employee 폴백)
- currentUser 설정하는 5곳 모두 _profileRole 동기화 확인
- useAuth FOUC 경로: initialized 초기값은 currentUser + _profileRole 모두 있을 때만 true
- 수정 전 반드시 전체 파일을 Read 했는지 확인!
WARN
    SKILL="safe-edit"
    ;;
  dataService.js)
    cat <<'WARN'
[CRITICAL FILE] dataService.js — 모든 데이터 CRUD에 영향
- 조회 메서드: _getCached / _setCache 패턴 적용
- CUD 메서드: 반드시 관련 _invalidateCache 추가 (안 하면 stale data)
- 캐시 키 규칙: 단순 조회 = 문자열, 필터 있으면 = prefix:${JSON.stringify(filters)}
- 수정 전 반드시 전체 파일을 Read 했는지 확인!
WARN
    SKILL="safe-edit"
    ;;
  config.js)
    if echo "$FILE_PATH" | grep -q 'services/config\.js'; then
      cat <<'WARN'
[CRITICAL FILE] config.js — 환경 설정 전체에 영향
- 싱글톤 패턴 (getInstance)
- 수정 시 사용자 확인 필요
WARN
      SKILL="safe-edit"
    fi
    ;;
  App.js)
    cat <<'WARN'
[CAUTION] App.js — 라우팅/탭 구조 변경 시 사용자 확인 필요
WARN
    SKILL="safe-edit"
    ;;
  dataManager.js)
    cat <<'WARN'
[CAUTION] dataManager.js — 계산 로직 변경 시 사용자 확인 필요
WARN
    SKILL="safe-edit"
    ;;
  .env|.env.local|.env.production|.env.development)
    cat <<'WARN'
[BLOCKED] 환경 변수 파일 직접 수정 금지! 사용자 확인 필수.
WARN
    ;;
esac

# Check for storage adapter files
if echo "$FILE_PATH" | grep -q 'services/storage/'; then
  cat <<'WARN'
[CAUTION] storage adapter — 데이터 영속성에 영향. 어댑터 인터페이스 변경 시 사용자 확인 필요
WARN
  SKILL="safe-edit"
fi

# === 2) Directory-based skill routing (only if not already set by critical file check) ===
if [ -z "$SKILL" ]; then
  if echo "$FILE_PATH" | grep -qE 'src/(components|hooks|pages|services|utils)/'; then
    if [ "$TOOL_NAME" = "Write" ]; then
      SKILL="add-feature"
    else
      SKILL="safe-edit"
    fi
  fi
fi

# === 3) Output skill reference ===
if [ -n "$SKILL" ]; then
  case "$SKILL" in
    safe-edit)
      echo "[SKILL] safe-edit 워크플로우: Read → 영향범위 → 수정 → CI빌드검증"
      ;;
    add-feature)
      echo "[SKILL] add-feature 워크플로우: 기존패턴확인 → 재사용대상 → 구현 → CI빌드검증"
      ;;
  esac
fi

exit 0
