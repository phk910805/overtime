# 환경변수 설정 가이드

## 🚨 중요: 배포 전 필수 확인사항

### 환경변수 파일 구조
```
.env.example        # 템플릿 (Git에 포함)
.env.local         # 로컬 개발용 (Git에서 제외)
.env.production    # 프로덕션용 (Git에 포함)
```

## 필수 환경변수

### 스토리지 설정
- `REACT_APP_USE_SUPABASE`: 
  - `true`: Supabase 사용 (프로덕션 권장)
  - `false`: localStorage 사용 (개발/테스트용)

### Supabase 연결 (USE_SUPABASE=true 시 필수)
- `REACT_APP_SUPABASE_URL`: Supabase 프로젝트 URL
- `REACT_APP_SUPABASE_ANON_KEY`: Supabase anon 키

### API 설정
- `REACT_APP_HOLIDAY_API_URL`: 휴일 API 엔드포인트

## 🔒 보안 주의사항

1. **Supabase 키는 anon 키만 사용**
   - Service key는 절대 클라이언트에 노출하지 말 것
   - RLS(Row Level Security) 정책으로 보안 강화

2. **환경변수 검증**
   - 배포 전 `npm run check-deploy` 실행 필수
   - 자동 검증으로 설정 오류 사전 방지

## 🚀 배포 프로세스

### 1. 배포 전 검증
```bash
npm run check-deploy
```

### 2. 자동 배포 (검증 포함)
```bash
npm run predeploy  # 검증 + 빌드
npm run deploy     # GitHub Pages 배포
```

## ❌ 절대 하지 말 것

1. `.env.production`에서 `REACT_APP_USE_SUPABASE=false` 설정
2. 프로덕션 환경에서 localStorage 의존
3. 검증 스크립트 없이 배포
4. Service key 클라이언트 노출

## 🐛 문제 해결

### "localStorage 모드로 배포됨" 문제
1. `.env.production` 확인
2. `REACT_APP_USE_SUPABASE=true` 설정
3. Supabase 연결 정보 확인
4. `npm run check-deploy`로 검증

### 환경변수 변경 후
1. 개발 서버 재시작
2. 빌드 캐시 클리어: `rm -rf build/`
3. 검증 후 재배포

## 📋 체크리스트

### 배포 전 필수 확인
- [ ] `.env.production`에 `REACT_APP_USE_SUPABASE=true` 설정
- [ ] Supabase URL/Key 정상 설정
- [ ] `npm run check-deploy` 성공
- [ ] Git 커밋 완료
- [ ] Supabase 테이블 구조 확인

### 환경별 권장 설정

#### 로컬 개발 (.env.local)
```
REACT_APP_USE_SUPABASE=false  # 빠른 개발
```

#### 프로덕션 (.env.production)
```
REACT_APP_USE_SUPABASE=true   # 실제 데이터베이스 사용
```
