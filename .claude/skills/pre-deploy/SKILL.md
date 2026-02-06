# Pre-Deploy 체크리스트

배포 전 안전성을 확인하는 워크플로우입니다.

## 트리거
사용자가 배포 전 검증을 요청하거나, 커밋/푸시 전 확인이 필요할 때 사용합니다.

## 워크플로우

### Step 1: CI 빌드 확인
```bash
CI=true npm run build
```
- 빌드가 성공해야 합니다
- ESLint 경고가 0개여야 합니다 (CI=true 환경에서 경고=에러)
- **실패 시**: 에러 메시지를 분석하고 수정한 후 재빌드

### Step 2: 빌드 결과물 확인
```bash
du -sh build/
find build/static/js -name "*.js" | xargs ls -lh
```
- 빌드 사이즈가 비정상적으로 크지 않은지 확인
- main chunk가 500KB를 초과하면 사용자에게 알림

### Step 3: 의도하지 않은 변경 확인
```bash
git status
git diff --stat
```
- 의도하지 않은 파일 변경이 없는지 확인
- `.env.production`, `package-lock.json` 등 민감 파일 변경 여부 체크
- `node_modules/`, `build/` 가 스테이징에 포함되지 않았는지 확인

### Step 4: 현재 브랜치 확인
```bash
git branch --show-current
```
- `feature/*` → `dev`로 merge (staging 배포)
- `dev` → `main`으로 merge (프로덕션 배포)
- **`feature/*`에서 `main`으로 직접 push 금지**

### Step 5: 커밋 & 푸시
- 모든 체크를 통과한 경우에만 진행
- Conventional Commits 형식 (한글)으로 커밋
- 현재 브랜치에 맞는 대상으로 push
- Cloudflare Pages 자동 배포 시작 안내

## 실패 시 대응
- ESLint 에러: 해당 파일의 문제를 수정 (eslint-disable는 최후 수단)
- 빌드 에러: 에러 메시지 기반으로 원인 파악 및 수정
- 비정상 파일 변경: 사용자에게 보고 후 판단 요청

## 주의사항
- `--no-verify` 플래그 절대 사용 금지
- 빌드 실패 상태에서 force push 금지
- `.env.production` 변경이 감지되면 즉시 사용자 확인 요청
