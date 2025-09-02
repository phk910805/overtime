# Git 커밋 및 GitHub 업로드 가이드

## 1. Git 초기화 및 첫 커밋

```bash
# Git 초기화
git init

# 모든 파일 스테이징
git add .

# 첫 커밋
git commit -m "🎉 초기 프로젝트 설정 및 기본 구조 생성

- React 프로젝트 기본 구조 생성
- 초과근무 관리 시스템 기본 컴포넌트 구현
- 공휴일 처리, 시간 계산 유틸리티 추가
- GitHub Actions CI/CD 파이프라인 설정"
```

## 2. GitHub 리포지토리 연결

```bash
# GitHub에서 리포지토리 생성 후
git remote add origin https://github.com/YOUR_USERNAME/overtime-management.git

# 메인 브랜치 설정
git branch -M main

# 첫 푸시
git push -u origin main
```

## 3. 향후 커밋 규칙

### 커밋 메시지 형식
```
<타입>: <제목>

<본문(선택사항)>

<푸터(선택사항)>
```

### 커밋 타입
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 스타일 변경 (포매팅, 세미콜론 등)
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드
- `chore`: 빌드, 패키지 매니저 등

### 예시
```bash
git commit -m "feat: 직원 일괄 시간 설정 기능 추가"
git commit -m "fix: 공휴일 표시 오류 수정"
git commit -m "docs: README 사용법 섹션 추가"
```

## 4. 브랜치 전략

```bash
# 새 기능 개발
git checkout -b feature/new-feature-name
# 개발 완료 후
git checkout main
git merge feature/new-feature-name
git push origin main

# 버그 수정
git checkout -b fix/bug-description
# 수정 완료 후
git checkout main
git merge fix/bug-description
git push origin main
```

## 5. GitHub Pages 배포

GitHub Actions가 자동으로 배포를 처리합니다:
1. `main` 브랜치에 푸시하면 자동 빌드
2. 빌드 성공 시 GitHub Pages에 배포
3. `https://YOUR_USERNAME.github.io/overtime-management/`에서 접속 가능

## 6. 로컬 개발 환경

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 빌드 테스트
npm run build
```
