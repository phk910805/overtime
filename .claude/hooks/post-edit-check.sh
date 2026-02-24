#!/bin/bash
set +e

# PostToolUse hook for Edit|Write
# Shows self-check reminders after editing files
# Critical files get detailed reminders, others get brief ones

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

BASENAME=$(basename "$FILE_PATH")
IS_CRITICAL=false

case "$BASENAME" in
  context.js)
    IS_CRITICAL=true
    cat <<'CHECK'
[SELF-CHECK: context.js]
- useEffect 4개 구조 유지되는지?
- 새 데이터 소스: 초기로드(1) + 리프레시(3) 모두 반영?
- 새 상태 추가: signOut 리셋 대상에 포함?
- 미사용 import/변수 없는지?
- console.log 디버깅 코드 남아있지 않은지?
CHECK
    ;;
  authService.js)
    IS_CRITICAL=true
    cat <<'CHECK'
[SELF-CHECK: authService.js]
- signOut 5단계 캐시 초기화 순서 유지?
- currentUser 설정 경로에서 _profileRole 동기화?
- 미사용 import/변수 없는지?
- console.log 디버깅 코드 남아있지 않은지?
CHECK
    ;;
  dataService.js)
    IS_CRITICAL=true
    cat <<'CHECK'
[SELF-CHECK: dataService.js]
- 새 조회 메서드에 캐시 적용?
- 새 CUD 메서드에 _invalidateCache 추가?
- 미사용 import/변수 없는지?
- console.log 디버깅 코드 남아있지 않은지?
CHECK
    ;;
  config.js)
    if echo "$FILE_PATH" | grep -q 'services/config\.js'; then
      IS_CRITICAL=true
      cat <<'CHECK'
[SELF-CHECK: config.js]
- 싱글톤 패턴 유지?
- 미사용 import/변수 없는지?
CHECK
    fi
    ;;
  App.js|dataManager.js)
    IS_CRITICAL=true
    cat <<'CHECK'
[SELF-CHECK] 핵심 파일 수정 완료
- 수정한 파일의 export를 사용하는 다른 파일에 영향 없는지?
- 미사용 import/변수 없는지?
- console.log 디버깅 코드 남아있지 않은지?
CHECK
    ;;
esac

# Storage adapter files
if echo "$FILE_PATH" | grep -q 'services/storage/'; then
  IS_CRITICAL=true
  cat <<'CHECK'
[SELF-CHECK: storage adapter]
- 어댑터 인터페이스 호환성 유지?
- 미사용 import/변수 없는지?
CHECK
fi

# Brief reminder for non-critical files
if [ "$IS_CRITICAL" = false ]; then
  echo "[SELF-CHECK] 미사용 import/변수, console.log 디버깅 코드, 하드코딩된 값 없는지 확인"
fi

exit 0
